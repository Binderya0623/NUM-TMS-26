#!/usr/bin/env python3
"""
build-jsons.py — turn parsed.json into the various import-ready JSONs.

Produces under infra/exam-prep/out/:
  topics.json            → infra/import-topics.sh
  grades.json            → infra/exam-prep/import-grades.sh
  committees-PROGRESS_2.json
  committees-PRE_DEFENSE.json
  committees-FINAL_DEFENSE.json    → infra/exam-prep/import-committees.sh

Also writes:
  unmapped-teachers.txt  → shortnames we couldn't resolve to an email prefix
"""
from __future__ import annotations
import json, pathlib, sys, re

ROOT     = pathlib.Path(__file__).resolve().parents[2]
OUT      = ROOT / "infra/exam-prep/out"
PARSED   = OUT / "parsed.json"
TEACHERS = ROOT / "teachers.json"

def teacher_shortname_map() -> dict[str, str]:
    """short ('Ч.Алтангэрэл') → email-prefix ('altangerel'). Convention:
    short = lastName[0] + '.' + firstName, lower-cased + dotted-out spaces."""
    teachers = json.loads(TEACHERS.read_text())
    m: dict[str, str] = {}
    for t in teachers:
        first = (t.get("firstName") or "").strip()
        last  = (t.get("lastName")  or "").strip()
        email = (t.get("email")     or "").strip()
        if not first or not last or "@" not in email:
            continue
        prefix = email.split("@")[0]
        # Common form: <Я>.<Firstname>  (e.g. Ч.Алтангэрэл)
        short_a = f"{last[0]}.{first}"
        # Some sources write the dot+space form: <Я>. <Firstname>
        short_b = f"{last[0]}. {first}"
        m[short_a] = prefix
        m[short_b] = prefix
    return m

def main():
    parsed = json.loads(PARSED.read_text())
    smap   = teacher_shortname_map()

    OUT.mkdir(parents=True, exist_ok=True)

    # ── 1) topics.json ────────────────────────────────────────────────────
    topics, unmapped = [], set()
    sup_lookup = {s["sisiId"]: s for s in parsed["students"]}
    for s in parsed["students"]:
        sup = smap.get(s["supervisorShort"])
        if not sup:
            unmapped.add(s["supervisorShort"]); continue
        topics.append({
            "createdBy":     sup,
            "createdByType": "TEACHER",
            "supervisor":    sup,
            "requestedById": s["sisiId"],
            "motivation":    "",
            "title":         s["topic"],
            "titleEn":       s["topicEn"],
            "description":   "<p>-</p>",
            "researchGoal":  "<p>-</p>",
            "keywords":      "",
            "program":       s["program"],
            "status":        "APPROVED",
            "visibility":    "PUBLIC",
            "maxStudents":   1,
        })
    (OUT / "topics.json").write_text(json.dumps(topics, ensure_ascii=False, indent=2))

    # ── 2) grades.json ────────────────────────────────────────────────────
    # Shape consumed by import-grades.sh: per-stage points + a final-grade
    # confirmation (head can publish later via the UI).
    grades = []
    for g in parsed["grades"]:
        rev = smap.get(g["reviewerShort"])
        if not rev:
            unmapped.add(g["reviewerShort"])
        grades.append({
            "studentId":  g["sisiId"],
            "phase1":     g["phase1"],   # max 15
            "phase2":     g["phase2"],   # max 20
            "pre":        g["pre"],      # max 25
            "reviewer":   rev,           # email-prefix or null if unmapped
        })
    (OUT / "grades.json").write_text(json.dumps(grades, ensure_ascii=False, indent=2))

    # ── 3) committees-<stage>.json ────────────────────────────────────────
    for stage, blocks in parsed["schedules"].items():
        committees = []
        for b in blocks:
            committees.append({
                "stageType":     stage,
                "name":          b.get("name", "КОМИСС"),
                "scheduledDate": b.get("date", "") + " " + b.get("time", ""),
                "location":      b.get("location", ""),
                "students":      b["students"],
            })
        (OUT / f"committees-{stage}.json").write_text(
            json.dumps(committees, ensure_ascii=False, indent=2)
        )

    # ── 4) report unmapped teacher shortnames ─────────────────────────────
    if unmapped:
        rep = OUT / "unmapped-teachers.txt"
        rep.write_text("\n".join(sorted(unmapped)) + "\n")
        print(f"  WARNING: {len(unmapped)} teacher shortnames unmapped → {rep}")
        print(f"           Edit teachers.json (firstName/lastName) and rerun.")
    else:
        (OUT / "unmapped-teachers.txt").unlink(missing_ok=True)

    print(f"wrote topics.json   ({len(topics)} entries)")
    print(f"wrote grades.json   ({len(grades)} entries)")
    for stage, blocks in parsed["schedules"].items():
        print(f"wrote committees-{stage}.json  ({len(blocks)} committees)")

if __name__ == "__main__":
    main()
