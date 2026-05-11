# БСА exam-prep pipeline

Reads the four reference files in the repo root and produces import-ready
JSONs for the running services.

## Inputs (must already exist)

| file                                    | what it is                                       |
|----------------------------------------|--------------------------------------------------|
| `БСА1.xlsx` (sheet `zaagdaj_bga`)       | Student → topic + supervisor + reviewer roster   |
| `БСА-Оноо.pdf`                          | Per-student `phase1 / phase2 / pre` scores       |
| `БСА-Хуваарь-with-committee.pdf`        | Authoritative committee structure: name, schedule, head, secretary, members, students per Комисс |
| `teachers.json`                         | Used to map "Ч.Алтангэрэл" → email-prefix        |

## Run

```bash
# 1) Parse the XLSX + grades + (optionally) older schedule PDFs.
python3 infra/exam-prep/parse-bsa.py
# → infra/exam-prep/out/parsed.json

# 2) Parse the authoritative "with-committee" PDF (committee names + members).
python3 infra/exam-prep/parse-committees.py
# → infra/exam-prep/out/committees-source.json

# 3) Build the per-purpose JSONs.
python3 infra/exam-prep/build-jsons.py        # → topics.json, grades.json
python3 infra/exam-prep/build-stage-jsons.py  # → committees-{PROGRESS_2,PRE_DEFENSE,FINAL_DEFENSE}.json

# 4) (optional) Edit the stage JSONs by hand:
#      - move misclassified shortnames between `members` ↔ `externalExperts`
#      - add any guests the PDF parser missed
#      - adjust `head` / `secretary` if their shortname didn't match
#    The builder leaves unresolved shortnames in `externalExperts` so you can see them.

# 5) Push them through the running services.

# 5a) Topics + per-student selection (idempotent: empty DB → 100% one-shot).
infra/import-topics.sh infra/exam-prep/out/topics.json

# 5b) Per-stage phase scores (progress1, progress2, pre).
infra/exam-prep/import-grades.sh

# 5c) Committees + students + defense sessions, per stage.
infra/exam-prep/import-committees.sh PROGRESS_2
infra/exam-prep/import-committees.sh PRE_DEFENSE
infra/exam-prep/import-committees.sh FINAL_DEFENSE
```

## What's automated, and what isn't

| step                                                | automated? |
|----------------------------------------------------|-----------|
| Create topic + auto-select for the right student   | ✓ (import-topics.sh) |
| Seed phase1 / phase2 / pre scores per student      | ✓ (import-grades.sh — partial final-grade record, head publishes from UI) |
| Create per-stage committees + assign students      | ✓ (import-committees.sh) |
| Create the matching defense_sessions               | ✓ (import-committees.sh — schedule + location) |
| **Add teacher members (HEAD/SECRETARY/MEMBER)**    | ✗ (do it from /admin/committees — teacher pool is small) |
| **Reviewer score (5 pt) on final-grade**           | ✗ (uploaded with review document during pre-defense) |
| **Final committee score (35 pt)**                  | ✗ (entered via the actual final defense workflow) |

## Prerequisites in the running system

- `user_service` must already have all teachers + students from
  `teachers.json` / `students.json` (run the existing register/import scripts
  first if not).
- An **active selection session** is needed for `import-topics.sh` to
  auto-approve student selections — open one in `/admin/evaluation-process`.

## Tweaking

- `parse-bsa.py` — selectors / column indices are inline; adjust if the
  source files change shape.
- `build-jsons.py` — `teacher_shortname_map()` produces the `Я.Имя` form
  (`lastName[0] + "." + firstName`). If a teacher's display name differs in
  the PDF, edit `teachers.json` so the derivation lines up.
