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
jq -c '.[]' teachers.json | while read row; do
  curl -sS -X POST http://localhost:8086/api/users/teachers \
    -H 'Content-Type: application/json' \
    -d "$row"
  echo
done
```

### Алхам Б: auth_service-д нэвтрэх эрх нэмэх
```bash
jq -c '.[]' teachers_register.json | while read row; do
  curl -sS -X POST http://localhost:8887/auth/register \
    -H 'Content-Type: application/json' \
    -d "$row"
  echo
done
```

> **Тэмдэглэл:** Багш `batbayar` / `Num2024!` гэж нэвтэрнэ. Систем нэвтрэх үед `{sisiId}@num.edu.mn` имэйлээр `user_service` дээрх профайлтай автоматаар холбогдоно.

---

## 2. Оюутан нэмэх (Student)

### Алхам А: user_service-д профайл үүсгэх
```bash
jq -c '.[]' students.json | while read row; do
  curl -sS -X POST http://localhost:8086/api/users/students \
    -H 'Content-Type: application/json' \
    -d "$row"
  echo
done
```

### Алхам Б: auth_service-д нэвтрэх эрх нэмэх
```bash
jq -c '.[]' students_register.json | while read row; do
  curl -sS -X POST http://localhost:8887/auth/register \
    -H 'Content-Type: application/json' \
    -d "$row"
  echo
done
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


### Topics:

```bash
  POST http://localhost:8081/api/v2/topics
  Content-Type: application/json
  {
    "createdById":   "575c0ea8-0fcc-4dbb-a0a4-ff203d897a04",
    "createdByType": "TEACHER",
    "supervisorId":  "575c0ea8-0fcc-4dbb-a0a4-ff203d897a04",
    "title":         "Холимог микрофронтенд архитектур",
    "titleEn":       "Hybrid microfrontend architecture",
    "description":   "<p>...html allowed (TipTap)</p>",
    "researchGoal":  "<p>...</p>",
    "keywords":      "react, jsf, microfrontend",
    "program":       "Программ Хангамж",
    "status":        "APPROVED",
    "visibility":    "PUBLIC"
  }  

  POST http://localhost:8081/api/v2/topic-requests
  Content-Type: application/json
    {
    "topicId": 12,
    "requestedById": "7d59cd21-f4b2-4c70-bed9-534c17d196a6",
    "sessionId": 14,
    "motivation": ""
  }      


  # ── 1) Parse source files ──────────────────────────────
  python3 infra/exam-prep/parse-bsa.py            # → out/parsed.json      
  python3 infra/exam-prep/parse-committees.py     # → out/committees-source.json
  # ── 2) Build the import JSONs ──────────────────────────
  python3 infra/exam-prep/build-experts-json.py   # → out/external-experts.json
  python3 infra/exam-prep/build-jsons.py          # → out/topics.json, out/grades.json
  python3 infra/exam-prep/build-stage-jsons.py    # → out/committees-{PROGRESS_2,PRE_DEFENSE,FINAL_DEFENSE}.json
  # ── 3) Optional manual edits to the stage JSONs ──────── 
  #  - Fix "Э.Цог-" → "Э.Цог-Эрдэнэ" wherever it appears
  #  - Move any guest into externalExperts → members if you want them as MEMBER instead
  #  - Adjust head/secretary if any short-name didn't match
  nano infra/exam-prep/out/external-experts.json                  
  nano infra/exam-prep/out/committees-PROGRESS_2.json
  nano infra/exam-prep/out/committees-PRE_DEFENSE.json
  nano infra/exam-prep/out/committees-FINAL_DEFENSE.json

  # ── 4) Register external experts FIRST so the committee  
  #       importer can resolve them by their new emails ─── 
  infra/exam-prep/import-experts.sh
  # ── 5) Topics + auto-select students (idempotent on empty topic_service DB) ──
  infra/import-topics.sh infra/exam-prep/out/topics.json
  # ── 6) Per-stage phase scores (progress1 / phase2 / pre) ─
  infra/exam-prep/import-grades.sh
  # ── 7) Committees + students + sessions + grades + closure, per stage ─
  infra/exam-prep/import-committees.sh PROGRESS_2     # closes after seeding phase2 score
  infra/exam-prep/import-committees.sh PRE_DEFENSE    # closes after seeding pre score
  infra/exam-prep/import-committees.sh FINAL_DEFENSE  # stays ACTIVE (live event) 
```
```bash
  {
    "createdBy":   "amgalan.a",
    "createdByType": "TEACHER",
    "requestedById": "22B1NUM6150",
    "motivation": ""
    "supervisor":  "amgalan.a",
    "reviewer": "bilguun.o",
    "title":         "Холимог микрофронтенд архитектур",
    "titleEn":       "Hybrid microfrontend architecture",
    "description":   "<p>-</p>",
    "researchGoal":  "<p>-</p>",
    "keywords":      "react, jsf, microfrontend",
    "program":       "Программ Хангамж",
    "status":        "APPROVED",
    "visibility":    "PUBLIC",
    "maxStudents":   1
  }  
```