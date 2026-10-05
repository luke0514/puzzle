"""Chapter 05: authentic ECDLP over F_p, deliberately confined to a smooth subgroup.

   The intended attack is Pohlig-Hellman: ord(G) factors entirely into primes < 2^20,
   so the logarithm splits into a handful of tiny BSGS problems.  Naive BSGS on the
   full subgroup would need ~2^21 steps, which is enough to punish brute force but
   not enough to make the chapter unfair."""
import json, math, random, sys, time
sys.path.insert(0, '/home/claude/gen')
from ec import Curve
from sympy import nextprime, factorint
from sympy.ntheory.residue_ntheory import sqrt_mod

rng = random.Random(1932)
p = nextprime(1 << 52)


def point_order(C, P):
    """Order of P via BSGS across the Hasse interval, then reduced prime by prime."""
    q = C.p
    lo = q + 1 - 2 * math.isqrt(q)
    m = math.isqrt(4 * math.isqrt(q)) + 1
    tbl, R = {}, None
    for j in range(m + 1):                       # baby steps  j*P,  j = 0..m
        tbl.setdefault(R[0] if R else 'O', []).append(j)
        R = C.add(R, P)
    mP = C.mul(m, P)
    cur = C.mul(lo, P)
    for i in range(m + 3):                       # giant steps (lo + i*m)*P, walking UP
        key = cur[0] if cur else 'O'
        if key in tbl:
            for j in tbl[key]:
                # an x-collision means (lo + i*m)P = +-jP
                for cand in (lo + i * m - j, lo + i * m + j):
                    if cand > 0 and C.mul(cand, P) is None:
                        N = cand
                        for pr in factorint(N):
                            while N % pr == 0 and C.mul(N // pr, P) is None:
                                N //= pr
                        return N
        cur = C.add(cur, mP)
    return None


def rand_point(C):
    while True:
        x = rng.randrange(C.p)
        y = sqrt_mod((x ** 3 + C.a * x + C.b) % C.p, C.p)
        if y is not None:
            return (x, y)


SMOOTH_BOUND = 1 << 20
best, t0 = None, time.time()
for trial in range(20000):
    a, b = rng.randrange(p), rng.randrange(p)
    try:
        C = Curve(a, b, p)
    except AssertionError:
        continue
    P = rand_point(C)
    N = point_order(C, P)
    if N is None:
        continue
    f = factorint(N)
    smooth = 1
    for q, e in f.items():
        if q < SMOOTH_BOUND:
            smooth *= q ** e
    if smooth >= (1 << 42):                      # big enough that brute force hurts
        best = (a, b, P, N, smooth)
        print(f"trial {trial} in {time.time()-t0:.1f}s  ord={N}  smooth={smooth}  {dict(f)}", flush=True)
        break
    if trial % 100 == 0:
        print("trial", trial, f"{time.time()-t0:.0f}s", flush=True)

a, b, P0, N, s = best
C = Curve(a, b, p)
G = C.mul(N // s, P0)                            # generator of the smooth subgroup, order s
assert C.mul(s, G) is None
for q in factorint(s):
    assert C.mul(s // q, G) is not None, "G does not have full order s"

k = rng.randrange(1 << 30, s)
Q = C.mul(k, G)
assert C.on(G) and C.on(Q)

digits, t = [], k
while t:
    digits.append(t % 26)
    t //= 26
KEY = "".join(chr(65 + d) for d in reversed(digits))
MSG = "NOTEVERYTHINGISFLAT"
CT = "".join(chr(65 + (ord(m) - 65 + ord(KEY[i % len(KEY)]) - 65) % 26) for i, m in enumerate(MSG))
back = "".join(chr(65 + (ord(c) - 65 - ord(KEY[i % len(KEY)]) + 65) % 26) for i, c in enumerate(CT))
assert back == MSG, back

print(f"p = {p}\na = {a}\nb = {b}\nG = {G}\nQ = {Q}")
print(f"ord(G) = {s} = {dict(factorint(s))}\nk = {k}\nkey = {KEY}\nCT = {CT} -> {back}")
json.dump({"p": p, "a": a, "b": b, "G": list(G), "Q": list(Q), "order": s,
           "order_factors": {str(q): e for q, e in factorint(s).items()},
           "k": k, "key": KEY, "ciphertext": CT, "plaintext": MSG},
          open('/home/claude/gen/ch05_final.json', 'w'), indent=1)
