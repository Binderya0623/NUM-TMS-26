# Хөгжүүлэгчийн гарын авлага

## Шаардлага

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Compose багтсан)
- Git

---

## Локал орчинд ажиллуулах

### 1. Repo clone хийх

```bash
git clone https://github.com/Binderya0623/NUM-TMS-26.git
cd NUM-TMS-26
```

### 2. Орчны тохиргоо

```bash
cp .env.local.example .env
```

> `.env` файлыг **commit хийхгүй** — `.gitignore`-д бүртгэлтэй.

### 3. Эхлүүлэх

```bash
docker compose up -d --build
```

Эхний удаа бүх Java сервисийг compile хийх тул **10–20 минут** болно.  
Дараагийн удаад `--build` орхиж болно — зөвхөн өөрчлөгдсөн сервис rebuild хийгдэнэ.

### 4. Туршилтын өгөгдөл үүсгэх

```bash
./infra/seed.sh
```

Үүсгэсэн хэрэглэгчид (нууц үг: `Num2026!`):

| Роль | sisiId-ууд |
|------|-----------|
| Admin | `admin` |
| Teacher | `t.head` `t.secretary` `t.member1` `t.member2` `t.member3` `expert.1` |
| Student | `22b1num0027` `22b1num1811` `22b1num5541` `22b1num5330` `22b1num5773` |

### 5. Нээх

```
http://localhost:9090
```

---

## Docker Compose файлууд

| Файл | Зориулалт |
|------|-----------|
| `docker-compose.yml` | Локал — source-аас build хийнэ |
| `docker-compose.prod.yml` | Продакшн — Docker Hub-аас image pull хийнэ |

```bash
# Локал
docker compose up -d --build

# Продакшн
docker compose -f docker-compose.prod.yml up -d
```

---

## Нийтлэг командууд

```bash
# Бүх сервисийн төлөв
docker compose ps

# Нэг сервисийн лог харах
docker compose logs -f thesis_service

# Нэг сервис дахин эхлүүлэх
docker compose restart thesis_service

# Зогсоох (өгөгдөл хадгалагдана)
docker compose down

# Зогсоох + өгөгдөл устгах
docker compose down -v
```

---

## CI/CD

`main` branch руу push хийхэд GitHub Actions автоматаар:

1. **Ямар сервис өөрчлөгдсөнийг** `dorny/paths-filter`-ээр тодорхойлно
2. Өөрчлөгдсөн сервисийн **шинэ Docker image** build хийж Docker Hub руу push хийнэ
3. Server дээр SSH-аар орж тухайн сервисийг **pull + restart** хийнэ
4. `infra/nginx/` эсвэл `docker-compose.prod.yml` өөрчлөгдвөл **nginx** автоматаар restart хийгдэнэ

> Сервисийн кодыг өөрчлөөгүй бол тухайн сервисийн image rebuild хийгдэхгүй.

---

## Файл upload хязгаар

Файл upload хийх хязгаар дараах 2 газарт тохируулагдсан — **хоёрыг зэрэг өөрчлөх хэрэгтэй**:

| Файл | Тохиргоо |
|------|---------|
| `infra/nginx/nginx.conf` | `client_max_body_size 30M` |
| `docker-compose.prod.yml` | `SPRING_CODEC_MAX_IN_MEMORY_SIZE: 30MB` |

---

## Архитектур

```
Browser
  └── nginx :80 (prod) / :9090 (local)
        ├── /auth          → auth_service    :8887
        ├── /api/users     → user_service    :8086
        ├── /api/v2        → topic_service   :8081
        ├── /api/thesis*   → thesis_service  :8083
        ├── /api/...       → бусад сервисүүд
        └── /              → jsf_host        :8080
```

### Сервисүүд

| Сервис | Port | Зориулалт |
|--------|------|-----------|
| `auth_service` | 8887 | JWT нэвтрэлт |
| `user_service` | 8086 | Хэрэглэгч, оюутан, багш |
| `topic_service` | 8081 | Сэдэв, сонгон шалгаруулалт |
| `committee_service` | 8082 | Комисс, шүүмжлэгч |
| `thesis_service` | 8083 | Дипломын ажил, тайлан, файл |
| `workflow_service` | 8084 | Хамгаалалтын үе шат |
| `evaluation_service` | 8085 | Үнэлгээ, дүн |
| `notification_service` | 8087 | Мэдэгдэл |
| `report_service` | 8088 | Нэгдсэн тайлан |
| `message_service` | 8089 | Чат |
| `analytic_service` | 8090 | Статистик |
| `grading_service` | 8091 | Дүнгийн тооцоолол |
