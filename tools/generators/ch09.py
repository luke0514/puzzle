# -*- coding: utf-8 -*-
"""Chapter 09: build the concordance (FOLIO . LINE . WORD) that spells the message.

   Convention, stated openly in folio MS-M-13: everything is 1-indexed, a word is a
   whitespace-delimited token exactly as printed, and the letter taken is the first
   ASCII letter appearing in that token."""
import json, random, sys
sys.path.insert(0, '/home/claude/gen')
from folios import FOLIOS

MSG = "THEFIRSTLETTEROFEVERYTHING"
rng = random.Random(20260907)


def first_letter(tok):
    for ch in tok:
        if ch.isalpha() and ch.isascii():
            return ch.upper()
    return None


# index every (folio, line, word) whose token begins with each letter
index = {}
for fi, (code, title, date, lines) in enumerate(FOLIOS, start=1):
    for li, line in enumerate(lines, start=1):
        for wi, tok in enumerate(line.split(), start=1):
            L = first_letter(tok)
            if L:
                index.setdefault(L, []).append((fi, li, wi, tok))

missing = [c for c in set(MSG) if c not in index]
assert not missing, f"letters unavailable in archive: {missing}"

used, concordance = set(), []
folio_load = {}
for ch in MSG:
    pool = [c for c in index[ch] if c[:3] not in used]
    # prefer folios used least so far, so the coordinates range over the whole archive
    pool.sort(key=lambda c: (folio_load.get(c[0], 0), rng.random()))
    pick = pool[0]
    used.add(pick[:3])
    folio_load[pick[0]] = folio_load.get(pick[0], 0) + 1
    concordance.append(pick)

# --- verify by re-reading the archive exactly as a solver would -------------
def lookup(f, l, w):
    return FOLIOS[f - 1][3][l - 1].split()[w - 1]

rec = "".join(first_letter(lookup(f, l, w)) for f, l, w, _ in concordance)
assert rec == MSG, rec
print("recovered:", rec)
print("folio spread:", sorted(folio_load.items()))
print()
for (f, l, w, tok), ch in zip(concordance, MSG):
    print(f"  {FOLIOS[f-1][0]} . {l:2d} . {w:2d}   -> {tok!r:22} {ch}")

json.dump({
    "message": MSG,
    "concordance": [{"folio": FOLIOS[f - 1][0], "folioIndex": f, "line": l, "word": w}
                    for f, l, w, _ in concordance],
    "total_words": sum(len(line.split()) for _, _, _, ls in FOLIOS for line in ls),
    "total_lines": sum(len(ls) for _, _, _, ls in FOLIOS),
}, open('/home/claude/gen/ch09_final.json', 'w'), indent=1)
print("\narchive size:", sum(len(line.split()) for _, _, _, ls in FOLIOS for line in ls), "words,",
      sum(len(ls) for _, _, _, ls in FOLIOS), "lines")
