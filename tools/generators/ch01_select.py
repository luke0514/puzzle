import json, random
from sympy import factorint, legendre_symbol
exec(open('/home/claude/gen/ch01.py').read().split('MSG =')[0].split('"""Chapter')[1].split('"""')[1] if False else '')

def fib_pair(n, m):
    if n == 0: return (0, 1)
    a, b = fib_pair(n >> 1, m)
    c = (a * ((2 * b - a) % m)) % m
    d = (a * a + b * b) % m
    return (d, (c + d) % m) if n & 1 else (c, d)

def rank_of_apparition(p):
    N = p - legendre_symbol(5, p)
    divs = [1]
    for q, e in factorint(N).items():
        divs = [d * q**i for d in divs for i in range(e + 1)]
    for d in sorted(divs):
        if fib_pair(d, p)[0] == 0: return d

def pisano(p):
    a = rank_of_apparition(p)
    t = fib_pair(a, p)[1]
    for k in (1, 2, 4):
        if pow(t, k, p) == 1: return a * k

buckets = {int(k): v for k, v in json.load(open('/home/claude/gen/ch01_buckets.json')).items()}
MSG = "LOOKATTHEMIRROR"
rng = random.Random(1932)   # Rejewski's year — a quiet nod
chosen, used = [], set()
# spread the 15 primes across the search band so the log looks like a real sweep
bands = [(400_000 + i * 33_000, 400_000 + (i + 1) * 33_000 + 20_000) for i in range(15)]
for i, ch in enumerate(MSG):
    t = ord(ch) - 65
    lo, hi = bands[i]
    cands = [pq for pq in buckets[t] if lo <= pq[0] <= hi and pq[0] not in used]
    if not cands:
        cands = [pq for pq in buckets[t] if pq[0] not in used]
    p, a = rng.choice(cands)
    used.add(p)
    chosen.append({"run": i + 1, "p": p, "alpha": a, "pi": pisano(p), "letter": ch})

# verify
assert "".join(chr(65 + c["alpha"] % 26) for c in sorted(chosen, key=lambda r: r["run"])) == MSG
display = sorted(chosen, key=lambda r: r["p"])
print("run order  :", "".join(c["letter"] for c in chosen))
print("value order:", "".join(chr(65 + c["alpha"] % 26) for c in display))
for c in display:
    print(f'  run {c["run"]:02d}  p={c["p"]:>7}  alpha={c["alpha"]:>7}  pi={c["pi"]:>8}  a%26={c["alpha"]%26:2d} -> {c["letter"]}')
json.dump(chosen, open('/home/claude/gen/ch01_final.json', 'w'), indent=1)
