# МУИС — Дипломын ажлын удирдлагын систем

> Хибрид микрофронтэнд + микросервис архитектурт суурилсан, **МУИС-ийн МКУТ тэнхимийн** дипломын ажлын бүх амьдралын мөчлөгийг (сэдэв сонгох → төлөвлөгөө → тайлан → хамгаалалт → дүн) удирдах систем.

---

## 1. Архитектурын ерөнхий зураг

```
┌─────────────────────────────────────────────────────────────────┐
│  Хөтөч  (http://localhost:8080)                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │   JSF 2.3 host (Tomcat) │   ← /login, /admin, /teacher, /student
              │       jsf-host          │
              └────────────┬────────────┘
                           │  ачаалдаг (statically)
   ┌───────────────────────┼───────────────────────┐
   │ React MFE (Vite + Module Federation)          │
   │                                               │
   │  module-auth      — нэвтрэлт                  │
   │  module-admin     — админ хяналт              │
   │  module-teacher   — багш / комиссын гишүүн    │
   │  module-student   — оюутан                    │
   │  module-thesis    — нийтлэг "thesis" feature  │
   │  shared-ui-module — design system (remote)    │
   └───────────────────────┬───────────────────────┘
                           │  REST/JSON, fetch, axios
                           ▼
┌────────────────────────────────────────────────────────────────┐
│   Spring Boot микросервисүүд (PostgreSQL R2DBC, port-уудаар)    │
│                                                                │
│   user_service        :8086     → users / students / teachers  │
│   topic_service       :8081     → сэдэв, сэдвийн хүсэлт         │
│   committee_service   :8082     → комисс, шүүмжлэгч             │
│   thesis_service      :8083     → дипломын ажил, тайлан         │
│   workflow_service    :8084     → стейж, defense-session        │
│   evaluation_service  :8085     → үнэлгээ, эцсийн дүн           │
│   notification_service:8087     → мэдэгдэл                      │
│   report_service      :8088     → нэгдсэн тайлан                │
│   grading_service     :8089     → дүнгийн тооцоолол             │
│   analytic_service    :8090     → статистик                     │
└────────────────────────────────────────────────────────────────┘
```

### Микрофронтэнд горим — "хибрид"

| Үе шат | Remote-ыг хаанаас унших |
|---|---|
| `vite dev` (локал hot reload) | Тус бүрийн **Vite preview server** (3013, 3020 ...) |
| `vite build` (production) | **Tomcat** дотор статикаар (`http://localhost:8080/microfrontends/...`) |

Хибрид гэдгийг `vite.config.ts`-д `command === 'build'` шалгуураар салгана.

---

## 2. Лавлахын бүтэц

```
prototype/
├── jsf-host/                ← JSF 2.3 + Tomcat (production host)
│   └── src/main/webapp/
│       ├── login.xhtml      ← role-аар үндсэн рүү шилжүүлдэг
│       ├── admin.xhtml      ← module-admin/dist/bootstrap.css + main.js
│       ├── teacher.xhtml
│       ├── student.xhtml
│       └── microfrontends/  ← `build-modules.sh` энд хуулдаг
│
├── module-auth/             ← Vite + React 18 + TS  (port 3xxx — dev)
├── module-admin/            ← :3010 dev
├── module-teacher/          ← :3011 dev — consumes shared_ui + module_thesis
├── module-student/          ← :3012 dev — consumes shared_ui + module_thesis
├── module-thesis/           ← :3013 preview (federation remote)
├── shared-ui-module/        ← :3020 preview (federation remote, design system)
│
├── user_service/            ← Spring Boot WebFlux + R2DBC (PostgreSQL)
├── topic_service/           ← Spring Boot MVC + JDBC
├── committee_service/
├── thesis_service/
├── workflow_service/
├── evaluation_service/
├── notification_service/
├── report_service/
├── grading_service/
├── analytic_service/
│
├── num_auth-main/           ← External auth proto (auth-service + authorization-service)
│
├── build-modules.sh         ← Бүх MFE-г build хийж jsf-host руу хуулна
├── setup-modules.sh         ← Эх кодыг template-аас хуулах helper
└── README.md
```

---

## 3. Системийн шаардлага

| Технологи | Хувилбар | Тэмдэглэл |
|---|---|---|
| **Java JDK** | 17+ | Spring Boot 3.x WebFlux |
| **Maven** | 3.6+ | Backend + jsf-host build |
| **Node.js** | 18.18.0+ | Тус бүрийн MFE-д `node_modules` |
| **npm** | 9+ | Vite/React |
| **PostgreSQL** | 14+ | Локал `localhost:5432`, давсгүй |
| **Tomcat** | 7 (Maven plugin) | `mvn tomcat7:run` |

> **Анхаар**: `application.properties`-д default username `bindertsetseg` тавьсан. Өөр машин дээр ажиллуулах бол `SPRING_R2DBC_USERNAME=postgres` гэх мэтээр environment variable-аар дарж бичнэ үү.

---

## 4. Эхэн дээр нэг удаа суулгах

### 4.1. PostgreSQL дээр өгөгдлийн сан үүсгэх

Микросервис тус бүр өөрийн DB-тэй:

```sql
CREATE DATABASE user_service;
CREATE DATABASE thesisdb;            -- topic_service хэрэглэдэг
CREATE DATABASE committee_service;
CREATE DATABASE thesis_service;
CREATE DATABASE workflow_service;
CREATE DATABASE evaluation_service;
CREATE DATABASE notification_service;
CREATE DATABASE report_service;
CREATE DATABASE message_service;
CREATE DATABASE grading_service;
CREATE DATABASE analytic_service;
```

> **Эсвэл (зөвлөмж)** — `docker compose up -d` нь PostgreSQL + Kafka + 11 backend
> микросервисийг автоматаар асаана, өгөгдлийн сангуудыг бэлддэг. Хэсэг **«Docker
> Compose-ээр ажиллуулах»**-аас үзнэ үү.

Бүх схем (DDL) тус бүрийн `src/main/resources/schema_*.sql`-д байгаа. Ихэнх сервис эхлэхдээ автоматаар schema-г унших боловч заримыг гараар оруулна:

```bash
psql -d evaluation_service -f evaluation_service/src/main/resources/schema_evaluation_service.sql
```

### 4.2. Хэрэглэгч seed хийх

Хэрэглэгч нэмэх нарийн тайлбар → **[USER.md](./USER.md)**.

### 4.3. Frontend dependency-ууд татах

```bash
# Тус бүрийн модульд `npm install` ажиллуулна
for m in module-auth module-admin module-teacher module-student module-thesis shared-ui-module ; do
  ( cd "$m" && npm install )
done
```

Эсвэл `build-modules.sh` дотор `npm install --silent` ажиллах ёстой.

---

## 5. Бүгдийг ажиллуулах (production-style)

### 5.1. Backend микросервисүүд

Тус бүр бие даасан Maven төсөл. Шинэ терминал бүрт нэгийг асаана:

```bash
cd user_service       && ./mvnw spring-boot:run     # :8086
cd topic_service      && ./mvnw spring-boot:run     # :8081
cd committee_service  && ./mvnw spring-boot:run     # :8082
cd thesis_service     && ./mvnw spring-boot:run     # :8083
cd workflow_service   && ./mvnw spring-boot:run     # :8084
cd evaluation_service && ./mvnw spring-boot:run     # :8085
cd notification_service && ./mvnw spring-boot:run   # :8087
cd report_service     && ./mvnw spring-boot:run     # :8088
cd message_service    && ./mvnw spring-boot:run     # :8089
cd analytic_service   && ./mvnw spring-boot:run     # :8090
cd grading_service    && ./mvnw spring-boot:run     # :8091
```

> Бүх сервисээ нэг дор асаадаг tmux/Procfile script одоогоор байхгүй — гараар асаах эсвэл доорх Docker Compose stack-ийг хэрэглэнэ.

### 5.2. React MFE-ийг build + jsf-host руу deploy

```bash
./build-modules.sh
```

Дараах дарааллаар build хийж, `dist/`-ийг `jsf-host/src/main/webapp/microfrontends/<module>/dist/`-д хуулна:

```
shared-ui-module → module-thesis → module-auth → module-admin
                                   → module-teacher → module-student
```

> `build-modules.sh` нь `cp -r dist/. "$DEST/"` ашигладаг тул **dest дотор хуучин файлыг устгахгүй**. Хэрэв CSS/JS өөрчлөгдөөд хүчингүй копи дунд үлдсэн бол тухайн `dist/` хавтсаа `rm -rf` хийгээд дахин ажиллуулна.

### 5.3. JSF host-ыг ажиллуулах

```bash
cd jsf-host
mvn clean package
mvn tomcat7:run
```

Tomcat `localhost:8080`-д асна. WAR-ыг `target/jsf-host.war`-д үүсгэдэг.

### 5.4. Хөтөч

| Эхлэлийн URL | Тайлбар |
|---|---|
| `http://localhost:8080/login.xhtml` | Эхэлэх цэг — нэвтрэх форм |
| `http://localhost:8080/admin.xhtml` | Админ дашбоард |
| `http://localhost:8080/teacher.xhtml` | Багш / комиссын гишүүн |
| `http://localhost:8080/student.xhtml` | Оюутан |

> CSS-ийн өөрчлөлтийг хөтөч кэшэлдэг. Шинэ build-ыг харахын тулд **hard refresh** (`⌘ + ⇧ + R` / `Ctrl + ⇧ + R`) хийнэ.

---

## 6. Docker Compose-ээр ажиллуулах (зөвлөмж)

Backend bundle бүхэлд нь нэг командаар асаах хувилбар:

```bash
cp .env.example .env       # хэрэв POSTGRES_PASSWORD-ийг өөрчлөх бол
docker compose up -d       # postgres + kafka + 11 backend service
docker compose logs -f user_service
```

Юу багтаж байгаа:

| Сервис | Зориулалт | Порт |
|---|---|---|
| `postgres` | PostgreSQL 14, 11 өгөгдлийн сан автоматаар үүсгэгдэнэ | `5432` |
| `kafka` | Kafka 3.7, KRaft mode, single broker | `9092` |
| `user_service` … `grading_service` | Бүх 11 backend микросервис | `8081-8091` |

Frontend (React MFE-ууд + jsf-host) нь **compose-д багтаагүй** — тэдгээрийг
host машин дээр энд хүртэл шиг ажиллуулна:

```bash
./build-modules.sh
cd jsf-host && mvn clean package && mvn tomcat7:run
```

Ингээд хөтчөөс `http://localhost:8080` рүү орно. Frontend нь
`localhost:8081-8091` хаягуудаар backend-тэй холбогдоно (compose-аар порт map
хийгдсэн).

**Гол файлууд:**

- `docker-compose.yml` — стэкийн тодорхойлолт
- `Dockerfile.spring` — Spring Boot service бүрд хамтран ашиглагдах multi-stage build
- `infra/postgres/init-databases.sh` — PostgreSQL дотор бүх DB-г үүсгэх скрипт
- `.env.example` — credentials template

**Нийтлэг командууд:**

```bash
docker compose up -d --build         # rebuild after code change
docker compose restart evaluation_service
docker compose ps                    # status
docker compose down                  # stop, KEEP data volume
docker compose down -v               # stop + nuke postgres/kafka data
```

> **Анхаарах**: эхний build удаан үргэлжилнэ (~10-15 минут, 11 Maven build-ийг
> зэрэг хийнэ). Дахин build хийхэд Docker layer caching ашиглагдана.
> Code өөрчлөгдөхгүй бол image-ийг дахин build хийхгүй — `docker compose up -d`
> л хангалттай.

---

## 7. Хөгжүүлэлтийн горим (hot reload)

Production build хийхгүйгээр локал dev server-аар тус бүрд нь ажиллуулж болно:

```bash
# Шаардлагатай remote-уудыг build хийх (нэг удаа эсвэл өөрчлөлт хийсэн үед)
( cd shared-ui-module && npm run build && npm run preview ) &  # :3020
( cd module-thesis    && npm run build && npm run preview ) &  # :3013

# Хэрэглэгчийн mfe-г dev горимоор асаах
cd module-teacher && npm run dev   # :3011
cd module-student && npm run dev   # :3012
cd module-admin   && npm run dev   # :3010
cd module-auth    && npm run dev
```

> `vite dev` режимд `vite.config.ts` дотор remote-ууд нь Vite preview сервер рүү (`localhost:3013`, `localhost:3020`) очдог. `vite build` режимд Tomcat руу очдог.

---

## 8. Технологийн стек

### Frontend

| Зүйл | Хэрэглээ |
|---|---|
| **Vite 6** + **TypeScript** | Build / dev server |
| **React 18.3** | UI |
| **`@originjs/vite-plugin-federation`** | Module Federation runtime |
| **Tailwind v4** + `@theme` tokens | Дизайн систем |
| **Radix UI primitives** + shadcn-style components | UI компонентууд |
| **Recharts** | Админ дашбоардын графикууд |
| **react-router** v7 | Дотоод routing |
| **lucide-react** | Иконнууд |

### Backend

| Зүйл | Хэрэглээ |
|---|---|
| **Spring Boot 3** | Микросервис framework |
| **Spring WebFlux** + R2DBC | Reactive DB access (ихэнх сервист) |
| **Spring MVC** + JDBC | `topic_service` дотор |
| **PostgreSQL 14+** | Анхдагч DB |
| **JSF 2.3** + Tomcat 7 | jsf-host shell, role-аар үндсэн рүү шилжүүлэх |

---

## 9. Хибрид микрофронтэнд: яаж ажилладаг

```
JSF (.xhtml)
  └─ <link  rel="stylesheet"
            href=".../microfrontends/module-teacher/dist/bootstrap.css">
  └─ <script type="module"
             src=".../microfrontends/module-teacher/dist/main.js">
                                 │
                                 ▼  (async chunk дуудлага)
            chunk-bootstrap.js → './bootstrap.tsx'
                                 │
                                 ▼
                  createRoot(#microfrontend-root).render(<App/>)
```

**Гол санаанууд**:

1. **Async entry** — `src/index.ts` нь `import('./bootstrap')` хэлбэртэй. Энэ нь Module Federation-д federation-ын shared dependency-уудыг урьдчилан зохицуулахад шаардлагатай.
2. **CSS-ийн нэр** — Federation-той MFE-д Vite-ийн `cssCodeSplit:false` ашигладаг. Энэ нь зөвхөн нэг CSS файл бий болгодог; асцет нэрийг `bootstrap.css` болгож rename хийдэг (host-ийн `<link>`-тэй тааруулахын тулд).
3. **Shared deps** — `react`, `react-dom`, `antd`-г singleton-аар хуваалцана; нэгэн удаа л ачаалагдана.
4. **CSS Modules + Tailwind v4** — `generateScopedName`-аар MFE тус бүр өөрийн prefix-тэй scope-той хэшийн нэртэй болгодог. Tailwind-ийн design token-уудыг тус бүрд дублаасан `index.css`-р түгээдэг (admin/teacher/student тус бүр өөрийн index.css).

---

## 10. Сайн мэдэх ёстой файлууд

| Файл | Юунд хэрэгтэй |
|---|---|
| `build-modules.sh` | Бүх MFE-ийн build + deploy pipeline |
| `<module>/vite.config.ts` | Federation remote URL-ууд, port, asset rename |
| `<module>/src/index.css` | Tailwind v4 `@theme` tokens (accent, ink, dot, surface) |
| `<module>/src/app/components/ui/*.tsx` | Shadcn-style UI primitives |
| `jsf-host/src/main/webapp/<role>.xhtml` | MFE-ийг ачаалах гадаад бүрхүүл |

---

## 11. Алдааг засах түгээмэл

### "Style-уудыг хөдөлгөвөл хөтөч хуучин харагдсан хэвээр"

Энэ систем нь `bootstrap.css` файлыг hash-гүй замаар serve хийдэг тул хөтөчийн кэш биеэ үлдээж болно.

```
1. ./build-modules.sh
2. cd jsf-host && mvn clean package && mvn tomcat7:run
3. Хөтөч: ⌘+⇧+R эсвэл DevTools → Network → "Disable cache"
```

### "Style.css болон bootstrap.css хоёулаа байна"

Хуучин deploy-оос үлдсэн стейл файл. Тухайн модулийн dist хавтасыг цэвэрлэнэ:

```bash
rm -rf jsf-host/src/main/webapp/microfrontends/module-XXX/dist/style.css
./build-modules.sh
```

### "Federation remote ачаалагдахгүй"

Dev горимд remote-уудаа эхлэн build хийсэн эсэхээ шалгана:

```bash
cd shared-ui-module && npm run build && npm run preview   # :3020
cd module-thesis    && npm run build && npm run preview   # :3013
```

Тэгээд consumer MFE-г асаана.

### Backend "Connection refused" / DB байхгүй

Тухайн сервисийн `application.properties`-д заасан DB үүсгэгдсэн эсэхийг шалгана:

```bash
psql -l | grep evaluation_service
```

Хэрэглэгчийн нэр буруу гарвал:

```bash
SPRING_R2DBC_USERNAME=postgres SPRING_R2DBC_PASSWORD=secret \
  ./mvnw spring-boot:run
```

---

## 12. Цаашдын төлөв

- [ ] Микросервисүүдийг `docker-compose` дотор багц болгон асаах
- [ ] `build-modules.sh`-д stale-asset цэвэрлэдэг алхам нэмэх (`rm -rf $DEST` өмнөх копи)
- [ ] CI pipeline (build + lint + test)
- [ ] Auth-ийг `num_auth-main`-той бүрэн нэгтгэх (одоо JSF-ийн дотор stub байна)

---

## Лиценз

Diploma research prototype — National University of Mongolia, MKUT.

