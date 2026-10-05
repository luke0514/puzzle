"""Chapter 02: primes p = a^2 + b^2, read in order of increasing argument arg(a+bi)."""
import json, math
from sympy import primerange
from sympy.ntheory.residue_ntheory import sqrt_mod

MSG = "PRIMESHAVETWOFACES"
targets = [ord(c) - 65 for c in MSG]

def two_squares(p):
    """Hermite-Serret: x^2 = -1 mod p, then Euclid down to remainders < sqrt(p)."""
    x = sqrt_mod(-1, p)
    if x is None:
        return None
    a, b = p, x
    lim = math.isqrt(p)
    while b > lim:
        a, b = b, a % b
    c = math.isqrt(p - b * b)
    if c * c + b * b != p:
        return None
    lo, hi = min(b, c), max(b, c)
    return (lo, hi) if lo < hi else None

cands = []
for p in primerange(5, 2_000_000):
    if p % 4 != 1:
        continue
    ab = two_squares(p)
    if ab:
        a, b = ab
        cands.append((b / a, p, a, b))
cands.sort()
print("candidates:", len(cands))

# 18 equal-count blocks in argument order -> guarantees a strictly increasing spread
n, k = len(cands), len(targets)
chosen = []
for i, t in enumerate(targets):
    block = cands[i * n // k:(i + 1) * n // k]
    hit = next((c for c in block if c[2] % 26 == t), None)
    if hit is None:
        raise SystemExit(f"block {i} has no residue {t}")
    chosen.append(hit)

assert all(chosen[i][0] < chosen[i + 1][0] for i in range(k - 1)), "argument order not strict"
assert "".join(chr(65 + a % 26) for _, p, a, b in chosen) == MSG
rows = [{"p": p, "a": a, "b": b, "arg": round(math.atan2(b, a), 9), "letter": chr(65 + a % 26)}
        for _, p, a, b in chosen]
byval = sorted(rows, key=lambda r: r["p"])
print("argument order:", "".join(r["letter"] for r in rows))
print("numeric  order:", "".join(r["letter"] for r in byval))
for r in rows:
    print(f'  p={r["p"]:>7} = {r["a"]:>4}^2+{r["b"]:>4}^2  arg={r["arg"]:.6f}  a%26={r["a"]%26:>3}  {r["letter"]}')
print("\ndisplayed ascending:", [r["p"] for r in byval])
json.dump(rows, open('/home/claude/gen/ch02_final.json', 'w'), indent=1)
