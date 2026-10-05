"""Chapter 07: a sheet of doubled indicators, exactly as the Biuro Szyfrow saw them in 1932.

Every operator encrypts his 3-letter message key TWICE at a common ground setting, so
positions 1&4, 2&5, 3&6 of each 6-letter group are the same plaintext letter enciphered
at steps (1,4), (2,5), (3,6).  Composing gives permutations AD, BE, CF.

Rejewski's theorem: because the Enigma is reciprocal (a product of 13 transpositions),
AD, BE and CF each decompose into cycles that come in PAIRS OF EQUAL LENGTH, and the
cycle-length multiset is invariant under the plugboard.  That invariance is the whole
point: it lets you attack the wheels without knowing a single plug.
"""
import json, random, sys
sys.path.insert(0, '/home/claude/gen')
from enigma import machine

CFG = dict(rotors=['II', 'III', 'I'], rings='AAA', positions='RTZ',
           plugboard='AH BL CX DI ER FK GU NP OQ TY', reflector='B')

rng = random.Random(19320115)          # the Bureau received its first Enigma material in Dec 1932
alpha = [chr(65 + i) for i in range(26)]

# One indicator = ground setting fixed, message key repeated twice.
# 26 keys forming a covering design (every letter appears once in every position),
# plus ~50 further keys for realism.  A real day's traffic looked much like this.
p1, p2, p3 = (rng.sample(alpha, 26) for _ in range(3))
keys = {p1[i] + p2[i] + p3[i] for i in range(26)}
while len(keys) < 78:
    keys.add(''.join(rng.choice(alpha) for _ in range(3)))
keys = sorted(keys)

indicators = []
for k in keys:
    m = machine(**CFG)
    indicators.append(m.encrypt(k + k))

# Rebuild the three permutations from the sheet alone (what the solver does).
perm = [{}, {}, {}]
for g in indicators:
    for i in range(3):
        a, b = g[i], g[i + 3]
        if a in perm[i]:
            assert perm[i][a] == b, "inconsistent sheet"
        perm[i][a] = b
for i in range(3):
    assert len(perm[i]) == 26, f"permutation {i} incomplete: {len(perm[i])}/26"


def cycles(p):
    seen, out = set(), []
    for s in alpha:
        if s in seen:
            continue
        c, x = [], s
        while x not in seen:
            seen.add(x); c.append(x); x = p[x]
        out.append(c)
    return sorted(out, key=len)


names = ['AD', 'BE', 'CF']
report = {}
for i in range(3):
    cyc = cycles(perm[i])
    lengths = sorted(len(c) for c in cyc)
    # Rejewski: lengths must pair up
    from collections import Counter
    assert all(v % 2 == 0 for v in Counter(lengths).values()), f"{names[i]} lengths do not pair: {lengths}"
    half = sorted(Counter(lengths).elements())[::2]
    report[names[i]] = {
        'cycles': [''.join(c) for c in cyc],
        'lengths': lengths,
        'characteristic': half,
        'pairs': len(cyc) // 2,
    }
    print(f"{names[i]}: lengths {lengths}   characteristic {half}   ({len(cyc)//2} pairs)")

json.dump({'config': CFG, 'indicators': indicators, 'analysis': report},
          open('/home/claude/gen/ch07_final.json', 'w'), indent=1)
print("\nfirst 10 indicators:", indicators[:10])
print("total:", len(indicators))
