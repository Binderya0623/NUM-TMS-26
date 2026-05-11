#!/usr/bin/env python3
"""
build-experts-json.py — collect every unique `externalExperts` short-name
out of the three stage JSONs and emit a registration-ready file.

Output: infra/exam-prep/out/external-experts.json

Each row follows the user_service `POST /api/users/external-experts` body:
  {
    "firstName":    "Гантулга",
    "lastName":     "Н.",                  // only the initial is in the PDF
    "email":        "guest.gantulga.n@num.edu.mn",
    "password":     "Num2026!",
    "organization": "",                    // edit this before posting
    "expertise":    "",                    // edit this before posting
    "_short":       "Н.Гантулга"           // for traceability; importer ignores
  }

The auto-derived `email` is just a deterministic slug — it's the field used
by the FE/back-end as the login id. Edit it freely.
"""
from __future__ import annotations
import json, pathlib, re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "infra/exam-prep/out"
TARGETS = [OUT / f"committees-{s}.json" for s in ("PROGRESS_2", "PRE_DEFENSE", "FINAL_DEFENSE")]

# ── crude Cyrillic → Latin transliteration for slugging ─────────────────────
CYR2LAT = {
    "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"j","з":"z",
    "и":"i","й":"i","к":"k","л":"l","м":"m","н":"n","о":"o","ө":"u","п":"p",
    "р":"r","с":"s","т":"t","у":"u","ү":"u","ф":"f","х":"kh","ц":"ts","ч":"ch",
    "ш":"sh","щ":"sh","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya",
}
def slug(s: str) -> str:
    s = (s or "").strip().lower()
    out = []
    for ch in s:
        if ch in CYR2LAT: out.append(CYR2LAT[ch])
        elif ch.isalnum(): out.append(ch)
        elif ch in " -": out.append("-")
    raw = "".join(out)
    return re.sub(r"-+", "-", raw).strip("-")

def split_short(short: str) -> tuple[str, str]:
    """ 'Н.Гантулга' → (firstName='Гантулга', lastInitial='Н.') """
    s = (short or "").strip().rstrip("-")
    if "." in s:
        last_init, first = s.split(".", 1)
        return first.strip(), (last_init.strip() + ".")
    return s, ""

def main():
    shorts: set[str] = set()
    for p in TARGETS:
        if not p.exists(): continue
        for cmt in json.loads(p.read_text()):
            for ex in cmt.get("externalExperts", []) or []:
                shorts.add(ex.strip())

    rows = []
    for sh in sorted(shorts):
        first, last = split_short(sh)
        if not first: continue
        slug_first = slug(first)
        slug_last  = slug(last.rstrip(".")) or "x"
        local      = f"{slug_first}.{slug_last}".strip(".")

        rows.append({
            "firstName":    first,
            "lastName":     last or "—",
            "email":        f"{local}@num.edu.mn",
            "password":     "Num2026!",
            "organization": "",
            "expertise":    "",
            "_short":       sh,
        })

    target = OUT / "external-experts.json"
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    print(f"wrote {target}  ({len(rows)} experts)")
    for r in rows:
        print(f"  {r['_short']:<14} → {r['email']}")

if __name__ == "__main__":
    main()
