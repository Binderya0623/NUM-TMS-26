#!/usr/bin/env python3
"""
parse-committees.py — extract Комисс 1..N from БСА-Хуваарь-with-committee.pdf
into a structured JSON.

Output: infra/exam-prep/out/committees-source.json
[
  {
    "name":          "Комисс 1",
    "scheduledDate": "2026-04-20T09:20:00",
    "location":      "8-р байр 204",
    "headShort":     "Б.Сувдаа",
    "secretaryShort":"О.Билгүүн",
    "memberShorts":  ["Г.Гантулга","Н.Гантулга"],
    "students":      ["22B1NUM4505","22B1NUM1281", ...]
  },
  ...
]

`headShort` / `secretaryShort` / `memberShorts` are written *as they appear*
in the PDF. build-jsons.py maps them via teachers.json + writes any unresolved
short into externalExperts (since the PDF mixes guests in with the members
line).
"""
from __future__ import annotations
import json, pathlib, re, sys
import pypdf

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC  = ROOT / "БСА-Хуваарь-with-committee.pdf"
OUT  = ROOT / "infra/exam-prep/out/committees-source.json"

# ── header regexes ────────────────────────────────────────────────────────────
HDR_RE = re.compile(
    r"(\d{4}\.\d{2}\.\d{2})\s*-?\s*ны?\s+\S+\s+\S+\s+"   # date + weekday
    r"(\d{1,2}:\d{2})\s*цаг\s+"                          # time
    r"(\d+\s*-р\s+байр\s+\d+\s*тоот[а-я]*)\s*"           # location
    r"(КОМИСС\s*\d+)",                                   # name
    re.IGNORECASE,
)

# Members are written as one or two run-on text lines after the header,
# always in this rough order:
#   Ахлагч: <head> [,]  Гишүүд: <m1>, <m2>[, ...]  [,]  Нарийн бичиг: <secretary>
MEMBER_RE = re.compile(
    r"Ахлагч\s*:\s*(?P<head>.+?)\s*[,\s]\s*"
    r"Гишүүд\s*:\s*(?P<members>.+?)\s*[,\s]?\s*"
    r"Нарийн\s*бичиг\s*:\s*(?P<secretary>.+?)\s*$",
    re.IGNORECASE | re.DOTALL,
)

# Body line: "<outer> <inner> <program-words…> <lastName> <firstName> <sisiId>"
BODY_RE = re.compile(
    r"^(\d+)\s+(\d+)\s+(.+?)\s+\S+\s+\S+\s+([0-9]{2}[A-Z][0-9][A-Z]+\d+)\s*$"
)

def normalise_short(s: str) -> str:
    """Trim, collapse internal whitespace, strip a trailing comma."""
    s = re.sub(r"\s+", " ", (s or "")).strip().rstrip(",").strip()
    return s

def parse_members_block(line: str):
    m = MEMBER_RE.search(line)
    if not m: return None, None, []
    head = normalise_short(m["head"])
    secretary = normalise_short(m["secretary"])
    raw_members = m["members"].strip()

    # Split on commas first; each chunk may itself contain space-separated
    # extras (the PDF mixes "А.Б, В.Г Д.Е" forms). Normalise everything.
    out = []
    for chunk in raw_members.split(","):
        for piece in chunk.strip().split():
            piece = normalise_short(piece)
            # crude validity: at least one Cyrillic letter + a dot
            if "." in piece and any("а" <= ch.lower() <= "я" or ch in "өүё" for ch in piece):
                out.append(piece)
    # dedupe preserving order, drop the head and secretary if duplicated.
    seen, dedup = set(), []
    for n in out:
        if n in (head, secretary): continue
        if n in seen: continue
        seen.add(n); dedup.append(n)
    return head, secretary, dedup

def main():
    if not SRC.exists():
        print(f"missing {SRC}", file=sys.stderr); sys.exit(1)

    pdf = pypdf.PdfReader(str(SRC))

    # ── 1) Independently extract all headers AND all Ахлагч blocks across
    #       the whole document, then pair them by document-order index.
    #       This handles the page-1 case where Комисс 1's membership block
    #       is rendered *before* its header line.
    full_text = "\n".join((p.extract_text() or "") for p in pdf.pages)

    # 1a) All header occurrences with names + schedule + location.
    headers_seq: list[dict] = []
    seen_h = set()
    for mh in HDR_RE.finditer(full_text):
        name = re.sub(r"\s+", " ", mh.group(4)).strip()
        if name in seen_h:
            continue
        seen_h.add(name)
        date = mh.group(1).replace(".", "-")
        time = mh.group(2)
        location = re.sub(r"\s+", " ", mh.group(3)).strip()
        headers_seq.append({
            "name":          name,
            "scheduledDate": f"{date}T{time}:00",
            "location":      location,
            "_pos":          mh.start(),
        })

    # 1b) All membership blocks. Match anything that looks like
    #     "Ахлагч: ... Нарийн бичиг: <name>" with the secretary name as
    #     the terminator, then dedup by content.
    BLOCK_RE = re.compile(
        r"Ахлагч\s*:.+?Нарийн\s*бичиг\s*:\s*[^\n\r,]+",
        re.IGNORECASE | re.DOTALL,
    )
    blocks_seq: list[dict] = []
    seen_b = set()
    for mb in BLOCK_RE.finditer(full_text):
        chunk_one = re.sub(r"\s+", " ", mb.group(0)).strip()
        if chunk_one in seen_b:
            continue
        seen_b.add(chunk_one)
        head, secretary, members = parse_members_block(chunk_one)
        blocks_seq.append({
            "headShort":      head,
            "secretaryShort": secretary,
            "memberShorts":   members,
            "_pos":           mb.start(),
        })

    # 1c) Pair: for each header, find the closest membership block in the
    #     full text (forward or backward) that hasn't been claimed yet.
    headers: dict[str, dict] = {}
    used_blocks: set[int] = set()
    for h in headers_seq:
        best_i, best_d = None, None
        for i, b in enumerate(blocks_seq):
            if i in used_blocks: continue
            d = abs(b["_pos"] - h["_pos"])
            if best_d is None or d < best_d:
                best_i, best_d = i, d
        if best_i is None:
            headers[h["name"]] = {
                **h, "headShort": None, "secretaryShort": None,
                "memberShorts": [], "students": [],
            }
            continue
        used_blocks.add(best_i)
        b = blocks_seq[best_i]
        headers[h["name"]] = {
            "name":           h["name"],
            "scheduledDate":  h["scheduledDate"],
            "location":       h["location"],
            "headShort":      b["headShort"],
            "secretaryShort": b["secretaryShort"],
            "memberShorts":   b["memberShorts"],
            "students":       [],
        }

    # ── 2) walk every body line, group by inner-counter resets ───────────────
    body_lines = []
    for p in pdf.pages:
        for line in (p.extract_text() or "").splitlines():
            line = line.strip()
            m = BODY_RE.match(line)
            if not m: continue
            outer, inner, program, sid = m.groups()
            body_lines.append({
                "outer": int(outer),
                "inner": int(inner),
                "program": program.strip(),
                "sisiId": sid,
            })

    blocks: list[list] = []
    cur, prev = [], None
    for r in body_lines:
        if prev is not None and r["inner"] <= prev:
            blocks.append(cur); cur = []
        cur.append(r); prev = r["inner"]
    if cur: blocks.append(cur)

    # ── 3) match blocks to committee headers in numeric order ────────────────
    sorted_names = sorted(headers.keys(),
                          key=lambda n: int(re.search(r"\d+", n).group()))
    for i, block in enumerate(blocks):
        if i >= len(sorted_names):
            print(f"  WARN block {i+1} ({len(block)} students) has no matching committee header", file=sys.stderr)
            continue
        nm = sorted_names[i]
        headers[nm]["students"] = [b["sisiId"] for b in block]

    # Final list, ordered.
    out = [headers[n] for n in sorted_names]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f"wrote {OUT}")
    for c in out:
        print(f"  {c['name']:<10} {c['scheduledDate']}  "
              f"{len(c['students']):2d} students | "
              f"head={c['headShort']!r} sec={c['secretaryShort']!r} "
              f"members={c['memberShorts']}")

if __name__ == "__main__":
    main()
