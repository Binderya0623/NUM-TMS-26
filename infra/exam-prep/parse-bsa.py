#!/usr/bin/env python3
"""
parse-bsa.py — read the four reference files into a single normalized JSON.

Inputs (paths relative to <repo-root>):
  prototype/БСА1.xlsx                  — sheet `zaagdaj_bga`, row 4 = header
  prototype/БСА-Оноо.pdf               — table: ID, phase1, phase2, pre, reviewer
  prototype/БСА-Хуваарь-progress-2.pdf — committee schedule per stage
  prototype/БСА-Хуваарь-pre.pdf
  prototype/БСА-Хуваарь-final.pdf

Output:
  infra/exam-prep/out/parsed.json
  {
    "students":   [ { sisiId, lastName, firstName, program, topic, topicEn,
                      supervisorShort, reviewerShort, phone } ... ],
    "grades":     [ { sisiId, phase1, phase2, pre, reviewerShort } ... ],
    "schedules":  {
      "PROGRESS_2": [ { name, date, time, location, students:[sisiId,...] } ... ],
      "PRE_DEFENSE": [...],
      "FINAL_DEFENSE": [...]
    }
  }
"""
from __future__ import annotations
import json, re, pathlib, sys
import openpyxl, pypdf

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "infra/exam-prep/out/parsed.json"

# ── 1) Students + topics from Excel ──────────────────────────────────────────
def load_students():
    wb = openpyxl.load_workbook(ROOT / "БСА1.xlsx", data_only=True)
    ws = wb["zaagdaj_bga"]
    rows = list(ws.iter_rows(values_only=True))
    # row index 3 is the header; data starts at index 4
    out = []
    for r in rows[4:]:
        if not r or r[1] is None:
            continue
        # column layout (1-based as in the file):
        # 1 None | 2 № | 3 School | 4 Program | 5 Index | 6 Level | 7 Form
        # 8 LastName | 9 FirstName | 10 sisiId | 11 MN title | 12 EN title
        # 13 Supervisor | 14 Reviewer | 15 Status | 16 Level | 17 Phone | 18 Schedule
        sid = r[9]
        if not sid:
            continue
        out.append({
            "sisiId":          str(sid).strip(),
            "lastName":        (r[7] or "").strip(),
            "firstName":       (r[8] or "").strip(),
            "program":         (r[3] or "").strip(),
            "topic":           (r[10] or "").strip(),
            "topicEn":         (r[11] or "").strip(),
            "supervisorShort": (r[12] or "").strip(),
            "reviewerShort":   (r[13] or "").strip(),
            "phone":           str(r[16] or "").strip() if r[16] is not None else "",
        })
    return out

# ── 2) Grades from PDF ──────────────────────────────────────────────────────
GRADE_RE = re.compile(
    r"^([0-9]{2}[A-Z][0-9][A-Z]+\d+)\s+"   # sisiId, e.g. 22B1NUM4505
    r"([0-9]+(?:\.\d+)?)\s+"               # phase1
    r"([0-9]+(?:\.\d+)?)\s+"               # phase2
    r"([0-9]+(?:\.\d+)?)\s+"               # pre
    r"(.+?)\s*$"                           # reviewer name
)
def load_grades():
    pdf = pypdf.PdfReader(str(ROOT / "БСА-Оноо.pdf"))
    out = []
    for p in pdf.pages:
        for line in (p.extract_text() or "").splitlines():
            line = line.strip()
            if not line:
                continue
            m = GRADE_RE.match(line)
            if not m:
                continue
            out.append({
                "sisiId":        m.group(1),
                "phase1":        float(m.group(2)),
                "phase2":        float(m.group(3)),
                "pre":           float(m.group(4)),
                "reviewerShort": m.group(5).strip(),
            })
    return out

# ── 3) Committee schedules from PDF ─────────────────────────────────────────
# Body line: "<num> [<innerNum>] <program> <lastName> <firstName> <sisiId>"
# innerNum resets when a new committee block begins (some PDFs).
SCHED_BODY_RE = re.compile(
    r"^(\d+)\s+(?:(\d+)\s+)?(.+?)\s+(\S+)\s+(\S+)\s+([0-9]{2}[A-Z][0-9][A-Z]+\d+)\s*$"
)
SCHED_HDR_RE = re.compile(
    r"(\d{4}\.\d{2}\.\d{2})[^\d]*?(\d{1,2}:\d{2})\s*цаг\s*(.+?тоотод)\s*(КОМИСС\s*\d+)",
    re.IGNORECASE,
)

def load_schedule(path: pathlib.Path):
    pdf = pypdf.PdfReader(str(path))
    body_lines = []
    headers    = []  # in order of appearance
    for p in pdf.pages:
        text = p.extract_text() or ""
        # Pull out header lines first; they sit at the bottom of page 1 in some PDFs.
        for hdr in SCHED_HDR_RE.finditer(text.replace("\n", " ")):
            headers.append({
                "date":     hdr.group(1),
                "time":     hdr.group(2),
                "location": hdr.group(3).strip(),
                "name":     hdr.group(4).strip(),
            })
        for line in text.splitlines():
            line = line.strip()
            if not line: continue
            m = SCHED_BODY_RE.match(line)
            if not m: continue
            outer, inner, program, last, first, sid = m.groups()
            body_lines.append({
                "outer":   int(outer),
                "inner":   int(inner) if inner else None,
                "program": program.strip(),
                "lastName": last,
                "firstName": first,
                "sisiId":  sid,
            })

    # Group bodies. We use the inner counter when present (it resets per block).
    # Otherwise, fall back to outer numbers and a static block size of 19.
    blocks = []
    cur = []
    prev = None
    for r in body_lines:
        key = r["inner"] if r["inner"] is not None else r["outer"]
        if prev is not None and key <= prev:
            blocks.append(cur)
            cur = []
        cur.append(r)
        prev = key
    if cur: blocks.append(cur)

    # Pair each block with the corresponding header.
    out = []
    for i, block in enumerate(blocks):
        hdr = headers[i] if i < len(headers) else {"name": f"Бүлэг {i+1}", "date": "", "time": "", "location": ""}
        out.append({
            **hdr,
            "students": [b["sisiId"] for b in block],
        })
    return out

def main():
    parsed = {
        "students": load_students(),
        "grades":   load_grades(),
        "schedules": {
            "PROGRESS_2":    load_schedule(ROOT / "БСА-Хуваарь-progress-2.pdf"),
            "PRE_DEFENSE":   load_schedule(ROOT / "БСА-Хуваарь-pre.pdf"),
            "FINAL_DEFENSE": load_schedule(ROOT / "БСА-Хуваарь-final.pdf"),
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(parsed, ensure_ascii=False, indent=2))
    print(f"wrote {OUT}")
    print(f"  students: {len(parsed['students'])}")
    print(f"  grades:   {len(parsed['grades'])}")
    for st, blocks in parsed["schedules"].items():
        print(f"  {st}: {len(blocks)} committees, "
              f"{sum(len(b['students']) for b in blocks)} students")

if __name__ == "__main__":
    main()
