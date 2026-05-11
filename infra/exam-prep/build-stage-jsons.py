#!/usr/bin/env python3
"""
build-stage-jsons.py — turn committees-source.json + parsed.json into one
JSON per defense stage. Invariants per file:
  PROGRESS_2.json    → status=CLOSED, score = phase2 (max 20)
  PRE_DEFENSE.json   → status=CLOSED, score = pre    (max 25)
  FINAL_DEFENSE.json → status=ACTIVE, score = null   (event hasn't run yet)

Each row carries everything the importer needs:
  {
    "stageType":      "PROGRESS_2",
    "name":           "Комисс 1",
    "scheduledDate":  "2026-04-20T09:20:00",
    "location":       "8-р байр 204 тоот",
    "status":         "CLOSED" | "ACTIVE",
    "head":           "<email-prefix>" | null,   // resolved via teachers.json
    "secretary":      "<email-prefix>" | null,
    "members":        ["<email-prefix>", ...],   // resolved teachers
    "externalExperts":["<short>", ...],          // unresolved shorts — user fills in
    "students": [
      { "sisiId": "22B1NUM4505", "score": 18.0 }, ...
    ]
  }

Outputs:
  infra/exam-prep/out/committees-PROGRESS_2.json
  infra/exam-prep/out/committees-PRE_DEFENSE.json
  infra/exam-prep/out/committees-FINAL_DEFENSE.json
"""
from __future__ import annotations
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "infra/exam-prep/out"
SRC  = OUT / "committees-source.json"
GRADES_RAW = OUT / "parsed.json"
TEACHERS   = ROOT / "teachers.json"

STAGES = [
    ("PROGRESS_2",    "phase2", "CLOSED"),
    ("PRE_DEFENSE",   "pre",    "CLOSED"),
    ("FINAL_DEFENSE", None,     "ACTIVE"),
]

def teacher_shortname_map() -> dict[str, str]:
    """short ('Ч.Алтангэрэл') → email-prefix ('altangerel')."""
    teachers = json.loads(TEACHERS.read_text())
    m: dict[str, str] = {}
    for t in teachers:
        first = (t.get("firstName") or "").strip()
        last  = (t.get("lastName")  or "").strip()
        email = (t.get("email")     or "").strip()
        if not first or not last or "@" not in email: continue
        prefix = email.split("@")[0]
        m[f"{last[0]}.{first}"]  = prefix
        m[f"{last[0]}. {first}"] = prefix
    return m

def resolve(short: str | None, smap: dict[str, str]) -> tuple[str | None, bool]:
    """Returns (mapped, found). If found is False the caller should treat
    the short as an external expert."""
    if not short: return None, True
    s = re.sub(r"\s+", " ", short).strip()
    if s in smap: return smap[s], True
    return None, False

def main():
    committees = json.loads(SRC.read_text())
    parsed     = json.loads(GRADES_RAW.read_text())
    smap       = teacher_shortname_map()
    by_sisi    = {g["sisiId"]: g for g in parsed["grades"]}

    for stage, score_key, status in STAGES:
        rows = []
        for c in committees:
            ext: list[str] = []

            head, ok = resolve(c.get("headShort"), smap)
            if not ok and c.get("headShort"): ext.append(c["headShort"])
            sec, ok  = resolve(c.get("secretaryShort"), smap)
            if not ok and c.get("secretaryShort"): ext.append(c["secretaryShort"])

            members: list[str] = []
            for ms in c.get("memberShorts", []):
                v, ok = resolve(ms, smap)
                if ok and v:  members.append(v)
                elif ms:      ext.append(ms)

            students = []
            for sid in c["students"]:
                g = by_sisi.get(sid)
                score = g.get(score_key) if (g and score_key) else None
                students.append({"sisiId": sid, "score": score})

            rows.append({
                "stageType":       stage,
                "name":            c["name"],
                "scheduledDate":   c["scheduledDate"],
                "location":        c["location"],
                "status":          status,
                "head":            head,
                "secretary":       sec,
                "members":         members,
                "externalExperts": ext,
                "students":        students,
            })
        target = OUT / f"committees-{stage}.json"
        target.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
        graded = sum(1 for r in rows for s in r["students"] if s["score"] is not None)
        unresolved = sum(len(r["externalExperts"]) for r in rows)
        print(f"wrote {target.name}  ({len(rows)} committees, "
              f"{sum(len(r['students']) for r in rows)} students, "
              f"{graded} graded, status={status}, externalExperts pending={unresolved})")

if __name__ == "__main__":
    main()
