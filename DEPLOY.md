# Deployment runbook

End-to-end, container-only deploy. Brings up Postgres, Kafka, the auth
service, all 11 backend services, and the JSF host with the MFE bundles
baked in.

## Prerequisites
- A Linux host with **Docker 24+** and the **compose plugin** installed.
- Open ports on the host: **8080** (JSF UI), **8887** (auth API), and
  **8081–8091** (per-service APIs the browser hits directly). Every other
  port stays inside the docker network.
- Roughly **6 GB RAM** for the running stack and **8 GB disk** for the
  initial image build (Maven downloads the world).
- Outbound network during build (Docker pulls images, npm/maven download
  dependencies). After `docker compose build` finishes you can disable
  outbound traffic if you want.

## 1. Get the source onto the box
```bash
# from your laptop
rsync -avzP --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'target' \
    --exclude 'dist' \
    --exclude '*.war' \
    ./ user@host:/opt/diploma/
```
`--exclude` is important — `node_modules` and `target` blow up the rsync.
The Docker build re-creates them inside the build containers anyway.

## 2. Configure environment
```bash
ssh user@host
cd /opt/diploma
cp .env.example .env

# Required edits in .env:
#   POSTGRES_PASSWORD     change from "postgres"
#   APP_JWT_SECRET        rotate (openssl rand -base64 64 | tr -d '\n')
#   VITE_API_*            point to the public hostname users will hit
nano .env
```
**The `APP_JWT_SECRET` value must be identical here and inside auth-service** —
docker-compose passes it to both via the same env var. Don't ship the
default base64 string to anything that's not your laptop.

## 3. Build all images
```bash
docker compose build
```
Expect 5–15 minutes the first time. Builds in parallel:
- one Maven build per service (×12)
- one Vite build per MFE (×6) inside the jsf-host stage
- one WAR package
- one Tomcat image

Subsequent builds are fast — Maven and npm dep layers cache as long as
`pom.xml` / `package.json` don't change.

## 4. Start the stack
```bash
docker compose up -d
docker compose ps                 # services should all show "running"
docker compose logs -f jsf_host   # watch Tomcat boot
```
Healthchecks are wired:
- `postgres` → `pg_isready`
- `kafka`    → `kafka-topics --list`
- `jsf_host` → HTTP 200 from `:8080/`

The Spring services will report ready via Spring Boot Actuator at
`http://<host>:<port>/actuator/health` once they've connected to Postgres
and Kafka.

## 5. Seed the demo dataset
```bash
./infra/seed.sh
```
Creates one department, an admin, 5 teachers (one of each role), 1 external
expert, and 5 students. Re-running is a no-op (registrations and POSTs
both ignore "already exists" errors).

Default login credentials (all share password `Num2026!` unless you
overrode `SEED_PASSWORD` in `.env`):

| Role     | sisiId                                                   |
|----------|----------------------------------------------------------|
| admin    | `admin`                                                  |
| teacher  | `t.head`, `t.secretary`, `t.member1..3`, `expert.1`      |
| student  | `22b1num0027`, `22b1num1811`, `22b1num5541`, `22b1num5330`, `22b1num5773` |

## 6. Hit the app
Browse to `http://<host>:8080/login.xhtml`. After login the host redirects
based on role:
- `/admin.xhtml#/admin`
- `/teacher.xhtml#/teacher`
- `/student.xhtml#/student`

## Routine ops

| Action                          | Command                                          |
|---------------------------------|--------------------------------------------------|
| Tail one service                | `docker compose logs -f <service>`               |
| Restart one service             | `docker compose restart <service>`               |
| Rebuild after code change       | `docker compose build <service> && docker compose up -d <service>` |
| Reset everything (drops data)   | `docker compose down -v && docker compose up -d` |
| Backup database                 | `docker compose exec postgres pg_dumpall -U $POSTGRES_USER > backup.sql` |
| Restore                         | `cat backup.sql \| docker compose exec -T postgres psql -U $POSTGRES_USER` |

## Production hardening (turn auth on)
Once you've logged in once and confirmed the frontend has a JWT in
`localStorage.mauth_token`:

1. Edit `.env`: `APP_SECURITY_JWT_ENABLED=true`.
2. `docker compose up -d` — services restart with the JWT filter active.
3. Any unauthenticated request now gets `401`. The frontend handles 401 by
   bouncing back to `/auth.xhtml#/auth/login`.

The filter permits `/actuator/*`, `/auth/*`, `/swagger`, and OPTIONS
preflight without a token, so health probes and login still work.

## Reverse proxy (optional, recommended for real users)
Put nginx in front of the host on 80/443 so users see one origin and a TLS
cert. Sketch:

```nginx
server {
    listen 443 ssl http2;
    server_name thesis.example.com;
    ssl_certificate     /etc/letsencrypt/live/thesis.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thesis.example.com/privkey.pem;

    location /              { proxy_pass http://localhost:8080;  proxy_http_version 1.1; }
    location /auth/         { proxy_pass http://localhost:8887;  proxy_http_version 1.1; }
    # …one location block per service port (8081–8091)…

    # SSE: disable buffering so chat events flow in real time
    location /api/messages/stream/ {
        proxy_pass            http://localhost:8089;
        proxy_buffering       off;
        proxy_cache           off;
        proxy_set_header      Connection '';
        proxy_http_version    1.1;
        chunked_transfer_encoding off;
    }
}
```
Then rebuild the JSF image with `VITE_API_*=https://thesis.example.com` so
the bundle calls out via the HTTPS origin.

## Troubleshooting
- **`jsf_host` keeps restarting**: usually the WAR failed to build because
  one of the MFEs has a TS error. Run `docker compose build jsf_host` and
  read the failure from the npm/vite stage.
- **`auth_service` 500s on register**: check `docker compose logs auth_service`
  for `auth_service_db` connection errors — `init-databases.sh` only runs
  on first Postgres boot, so if Postgres started before this commit you'll
  need `docker compose down -v` to recreate.
- **Frontend gets CORS errors**: verify each service's `application.properties`
  still has `@CrossOrigin(origins = "*")` (it does in this repo). For real
  prod tighten this to your host(s).
- **Chat doesn't update in real time**: SSE was probably stripped by a
  proxy. Ensure `proxy_buffering off` on `/api/messages/stream/` and that
  no intermediate proxy enforces a short read timeout.

## What I deliberately did not include
- **Flyway migrations.** Schemas still self-create via `spring.sql.init.mode=always`.
- **Image registry / CI.** You build on the host with `docker compose build`.
  If you want a registry pipeline, that's a separate piece of work.
- **Backups on a schedule.** `pg_dumpall` is one cron away; not configured.
- **Log shipping / metrics.** Spring Boot Actuator is exposed; wiring
  Prometheus / Loki is a follow-up.
