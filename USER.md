# Хэрэглэгч нэмэх зааварчилгаа

Системд шинэ хэрэглэгч нэмэхдээ дараах хоёр өгөгдлийн санд (DB) зэрэг бүртгэх шаардлагатай. Одоогоор "Гадаад эксперт"-ээс бусад хэрэглэгчдийг хоёр DB хооронд автоматаар нэмдэг механизм байхгүй тул API-аар дамжуулан гараар бүртгэнэ.

### Өгөгдлийн сангийн бүтэц

| Төрөл | user_service_db | auth_service_db |
| :--- | :--- | :--- |
| **Student** | `users` + `students` хүснэгт | `users` (sisiId, password, roles) |
| **Teacher** | `users` + `teachers` хүснэгт | `users` хүснэгт |
| **External Expert** | `users` + `external_experts` | `users` хүснэгт |

---

## 1. Багш нэмэх (Teacher)

Эхлээд үйлчилгээнүүд асаалттай байгааг шалгана уу: `user_service` (:8086), `auth_service` (:8887).

### Алхам А: user_service-д профайл үүсгэх
```bash
curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Жавхлан",
    "lastName": "Рэнцэндорж",
    "email": "r.javkhlan@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Ахлах багш"
  }'
  
curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Энхтуяа",
    "lastName": "Цогтбаатар",
    "email": "enkhtuya.ts@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Багш"
  }'
  
curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Отгоннаран",
    "lastName": "Очирбат",
    "email": "otgonnaran@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Ахлах багш"
  }'

  curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Үйтүмэн",
    "lastName": "Жам",
    "email": "uitumen@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Ахлах багш"
  }'

    curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Багаболд",
    "lastName": "Гэндэнсүрэн",
    "email": "bagabold.g@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Багш"
  }'

curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Гантуяа",
    "lastName": "Пэрэнлэйхүндэв",
    "email": "gantuya.p@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Дэд профессор"
  }'

  curl -X POST http://localhost:8086/api/users/teachers \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Батням",
    "lastName": "Баттулга",
    "email": "bbatnyam@num.edu.mn",
    "departmentId": "МКУТ",
    "position": "Ахлах багш"
  }'
```

### Алхам Б: auth_service-д нэвтрэх эрх нэмэх
```bash
curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "r.javkhlan",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'

curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "enkhtuya.ts",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'

  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "otgonnaran",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'

    curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "uitumen",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'

    curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "bagabold.g",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'

  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "gantuya.p",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'

    curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "bbatnyam",
    "password": "Num2026!",
    "roles": ["ROLE_TEACHER"]
  }'
```

> **Тэмдэглэл:** Багш `batbayar` / `Num2024!` гэж нэвтэрнэ. Систем нэвтрэх үед `{sisiId}@num.edu.mn` имэйлээр `user_service` дээрх профайлтай автоматаар холбогдоно.

---

## 2. Оюутан нэмэх (Student)

### Алхам А: user_service-д профайл үүсгэх
```bash
curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Биндэрцэцэг",
    "lastName": "Цэдэн-Иш",
    "email": "22b1num0027@stud.num.edu.mn",
    "studentId": "22B1NUM0027",
    "departmentId": "МКУТ",
    "major": "Программ хангамж"
  }'

curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Нинжбадгар",
    "lastName": "Цогтбаяр",
    "email": "22b1num1811@stud.num.edu.mn",
    "studentId": "22B1NUM1811",
    "departmentId": "МКУТ",
    "major": "Программ хангамж"
  }'

  curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Дэлгэрмаа",
    "lastName": "Галбаяр",
    "email": "22b1num5541@stud.num.edu.mn",
    "studentId": "22B1NUM5541",
    "departmentId": "МКУТ",
    "major": "Программ хангамж"
  }'

  curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Билгүүн",
    "lastName": "Эрхэмбаяр",
    "email": "22b1num5330@stud.num.edu.mn",
    "studentId": "22B1NUM5330",
    "departmentId": "МКУТ",
    "major": "Программ хангамж"
  }'

  curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Хишигжаргал",
    "lastName": "Гантулга",
    "email": "22b1num5300@stud.num.edu.mn",
    "studentId": "22B1NUM5300",
    "departmentId": "МКУТ",
    "major": "Компьютерын ухаан"
  }'

    curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Тест",
    "lastName": "Тест",
    "email": "22b1num0000@stud.num.edu.mn",
    "studentId": "22B1NUM0000",
    "departmentId": "МКУТ",
    "major": "Компьютерын ухаан"
  }'

    curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Энхбаяр",
    "lastName": "Бямбасүрэн",
    "email": "22b1num5773@stud.num.edu.mn",
    "studentId": "22B1NUM5773",
    "departmentId": "МКУТ",
    "major": "Компьютерын ухаан"
  }'
  curl -X POST http://localhost:8086/api/users/students \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Анар",
    "lastName": "Төвшинжаргал",
    "email": "22b1num5762@stud.num.edu.mn",
    "studentId": "22B1NUM5762",
    "departmentId": "МКУТ",
    "major": "Компьютерын ухаан"
  }'
  
```

### Алхам Б: auth_service-д нэвтрэх эрх нэмэх
```bash
curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num0027",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num0000",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num1811",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num5541",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num5330",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num5300",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num5773",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
  curl -X POST http://localhost:8887/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "sisiId": "22b1num5762",
    "password": "Num2026!",
    "roles": ["ROLE_STUDENT"]
  }'
```
> **Тэмдэглэл:** Оюутан нэвтрэх үед `{sisiId}@stud.num.edu.mn` загвараар профайлтай холбогдоно.

---

## 3. Анхаарах чухал зүйлс

* **sisiId тодорхойлох:**
    * Багш/Оюутан: Имэйлийн эхний хэсэг (`@` тэмдгийн өмнөх хэсэг).
    * Гадаад эксперт: Бүтэн имэйл хаяг нь өөрөө `sisiId` болно.
* **Имэйл конвенц:**
    * Оюутан: `{sisiId}@stud.num.edu.mn`
    * Багш / Админ: `{sisiId}@num.edu.mn`
    * Гадаад эксперт: Ямар ч домэйн байж болно (email = sisiId).
* **Роль mapping:** `AuthContext.mapRole` функцээр дараах байдлаар хөрвүүлэгдэнэ:
    * `ADMIN` → `admin`
    * `TEACHER` болон `EXTERNAL_EXPERT` → `teacher`
    * Бусад утгууд → `student`
* **Гадаад эксперт бүртгэх:** Админ UI-ийн `/admin/external-experts` хуудаснаас нэмэхэд backend нь `user` болон `auth` мэдээллийг зэрэг үүсгэнэ.
* **Нууц үг:** Анхдагч нууц үг нь `Num2024!`.

---

## 4. Аюулгүй байдал ба SQL

**Анхааруулга:** `auth_service_db`-д SQL `INSERT` ашиглан шууд өгөгдөл оруулахгүй байхыг зөвлөж байна. Учир нь нууц үгийг **Bcrypt** алгоритмаар hash хийх шаардлагатай байдаг тул заавал `/auth/register` REST endpoint-ийг ашиглаарай.

---

### Өөрчлөлтийн тэмдэглэл (Changelog)
* `Teachers.tsx` дээрх "+ Багш нэмэх" товчийг устгасан.
* Ашиглагдаагүй `Plus` импорт болон Modal-той холбоотой state-үүдийг цэвэрлэх шаардлагатай.

---