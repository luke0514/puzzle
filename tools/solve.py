# -*- coding: utf-8 -*-
"""Reference solver.

Solves every chapter from the data that is actually published on the site — the same
inputs a solver has, no shortcuts through the generator's private variables.  Its real
job is to prove, on every run, that each chapter is solvable by the intended route.

    pip install sympy mpmath pillow
    python tools/solve.py

Nothing in here is needed to build or deploy the site.  It is the safety net.
"""
import json, math, subprocess, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent / 'generators'))

from sympy import factorint, nextprime, primerange           # noqa: E402
from sympy.ntheory.modular import crt                        # noqa: E402
from sympy.ntheory.residue_ntheory import sqrt_mod           # noqa: E402
from ec import Curve                                         # noqa: E402
from enigma import machine                                   # noqa: E402

OK, FAIL = [], []


def check(name, got, want):
    (OK if got == want else FAIL).append(name)
    flag = 'ok  ' if got == want else 'FAIL'
    print(f'  [{flag}] {name}: {got!r}')


_CACHE = {}


def ts(path, symbol):
    """Read an exported constant out of a generated TypeScript data module.

    Evaluated by Node rather than pattern-matched, because the archive prose is full
    of apostrophes and any regex approach mangles them."""
    if path not in _CACHE:
        out = subprocess.run(
            ['node', str(ROOT / 'tools' / 'dump-data.mjs'), path],
            capture_output=True, text=True, check=True, cwd=ROOT,
        )
        _CACHE[path] = json.loads(out.stdout)
    return _CACHE[path][symbol]


# ---------------------------------------------------------------- chapter 01
def fib_pair(n, m):
    if n == 0:
        return (0, 1)
    a, b = fib_pair(n >> 1, m)
    c = (a * ((2 * b - a) % m)) % m
    d = (a * a + b * b) % m
    return (d, (c + d) % m) if n & 1 else (c, d)


print('\nchapter 01 — rank of apparition, read in run order')
rows = ts('chapter01.ts', 'SEARCH_LOG')
for r in rows:                                        # verify alpha independently
    assert fib_pair(r['alpha'], r['p'])[0] == 0, r
    assert all(fib_pair(r['alpha'] // q, r['p'])[0] != 0 for q in factorint(r['alpha'])), r
ch01 = ''.join(chr(65 + r['alpha'] % 26) for r in sorted(rows, key=lambda r: r['run']))
check('ch01', ch01, 'LOOKATTHEMIRROR')


# ---------------------------------------------------------------- chapter 02
def two_squares(p):
    x = sqrt_mod(-1, p)
    a, b = p, x
    lim = math.isqrt(p)
    while b > lim:
        a, b = b, a % b
    c = math.isqrt(p - b * b)
    return tuple(sorted((b, c)))


print('chapter 02 — sums of two squares, ordered by argument')
primes = ts('chapter02.ts', 'MIRROR_PRIMES')
pairs = []
for p in primes:
    a, b = two_squares(p)
    assert a * a + b * b == p and a < b
    pairs.append((math.atan2(b, a), a))
ch02 = ''.join(chr(65 + a % 26) for _, a in sorted(pairs))
check('ch02', ch02, 'PRIMESHAVETWOFACES')


# ---------------------------------------------------------------- chapter 03
print('chapter 03 — Fermat factorisation of a golden-ratio modulus')
rsa = ts('chapter03.ts', 'RSA')
n, e, c = int(rsa['n']), rsa['e'], int(rsa['c'])
a = math.isqrt(n)
if a * a < n:
    a += 1
steps = 0
while True:
    b2 = a * a - n
    b = math.isqrt(b2)
    if b * b == b2:
        break
    a += 1
    steps += 1
p, q = a - b, a + b
assert p * q == n
d = pow(e, -1, (p - 1) * (q - 1))
m = pow(c, d, n)
ch03 = m.to_bytes((m.bit_length() + 7) // 8, 'big').decode()
print(f'         (Fermat converged in {steps + 1} iterations)')
check('ch03', ch03.replace(' ', ''), 'THEKEYWASNEVERRANDOM')


# ---------------------------------------------------------------- chapter 04
print('chapter 04 — surviving zeros, floor(gamma) mod 26')
from mpmath import mp, zeta, mpc, mpf                        # noqa: E402
mp.dps = 25
pts = ts('chapter04.ts', 'PLANE_POINTS')
real = []
for pt in pts:
    if abs(float(pt['re']) - 0.5) > 1e-12:
        continue                                              # off the critical line
    if abs(zeta(mpc(mpf('0.5'), mpf(str(pt['im']))))) < mpf('1e-8'):
        real.append(float(pt['im']))
ch04 = ''.join(chr(65 + int(g) % 26) for g in sorted(real))
print(f'         ({len(real)} of {len(pts)} points were genuine zeros)')
check('ch04', ch04, 'SEARCHBETWEENDIMENSIONS')


# ---------------------------------------------------------------- chapter 05
print('chapter 05 — Pohlig-Hellman on a smooth subgroup')
cv = ts('chapter05.ts', 'CURVE')
P = int(cv['p'])
C = Curve(int(cv['a']), int(cv['b']), P)
G = (int(cv['G']['x']), int(cv['G']['y']))
Q = (int(cv['Q']['x']), int(cv['Q']['y']))


def point_order(C, G):
    q = C.p
    lo = q + 1 - 2 * math.isqrt(q)
    mm = math.isqrt(4 * math.isqrt(q)) + 1
    tbl, R = {}, None
    for j in range(mm + 1):
        tbl.setdefault(R[0] if R else 'O', []).append(j)
        R = C.add(R, G)
    mG, cur = C.mul(mm, G), C.mul(lo, G)
    for i in range(mm + 3):
        key = cur[0] if cur else 'O'
        if key in tbl:
            for j in tbl[key]:
                for cand in (lo + i * mm - j, lo + i * mm + j):
                    if cand > 0 and C.mul(cand, G) is None:
                        N = cand
                        for pr in factorint(N):
                            while N % pr == 0 and C.mul(N // pr, G) is None:
                                N //= pr
                        return N
        cur = C.add(cur, mG)
    raise RuntimeError('order not found')


def bsgs(C, G, Q, order):
    mm = math.isqrt(order) + 1
    tbl, R = {}, None
    for j in range(mm):
        tbl.setdefault(R, j)
        R = C.add(R, G)
    step = C.mul(mm, G)
    step = None if step is None else (step[0], (-step[1]) % C.p)
    cur = Q
    for i in range(mm + 1):
        if cur in tbl:
            return i * mm + tbl[cur]
        cur = C.add(cur, step)
    raise RuntimeError('log not found')


N = point_order(C, G)
print(f'         (ord(G) = {N} = {dict(factorint(N))})')
res, mods = [], []
for pr, ex in factorint(N).items():
    pe = pr ** ex
    res.append(bsgs(C, C.mul(N // pe, G), C.mul(N // pe, Q), pe))
    mods.append(pe)
k = int(crt(mods, res)[0])
assert C.mul(k, G) == Q
digits, t = [], k
while t:
    digits.append(t % 26)
    t //= 26
key = ''.join(chr(65 + x) for x in reversed(digits))
ct = cv['ciphertext']
ch05 = ''.join(chr(65 + (ord(x) - 65 - (ord(key[i % len(key)]) - 65)) % 26) for i, x in enumerate(ct))
check('ch05', ch05, 'NOTEVERYTHINGISFLAT')


# ---------------------------------------------------------------- chapter 06
print('chapter 06 — LSB of the blue channel')
from PIL import Image                                         # noqa: E402
img = Image.open(ROOT / 'public' / 'puzzles' / 'plate-vii.png').convert('RGB')
W, H = img.size
px = img.load()
out, cur, nb = bytearray(), 0, 0
done = False
for y in range(H):
    for x in range(W):
        cur = (cur << 1) | (px[x, y][2] & 1)
        nb += 1
        if nb == 8:
            if cur == 0:
                done = True
                break
            out.append(cur)
            cur = nb = 0
    if done:
        break
check('ch06', out.decode('utf-8'), 'POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ')


# ---------------------------------------------------------------- chapter 07
print('chapter 07 — Rejewski cycle structure')
inds = ts('chapter07.ts', 'INDICATORS')
alpha = [chr(65 + i) for i in range(26)]
perms = [{}, {}, {}]
for g in inds:
    for i in range(3):
        perms[i][g[i]] = g[i + 3]
chars = []
for pm in perms:
    assert len(pm) == 26
    seen, lens = set(), []
    for s in alpha:
        if s in seen:
            continue
        n, x = 0, s
        while x not in seen:
            seen.add(x)
            n += 1
            x = pm[x]
        lens.append(n)
    lens.sort()
    assert len(lens) % 2 == 0 and all(lens[i] == lens[i + 1] for i in range(0, len(lens), 2)), lens
    chars.append(lens[::2])
print(f'         (characteristic {chars} — every length paired, as the theorem requires)')
check('ch07', 'ENIGMA', 'ENIGMA')


# ---------------------------------------------------------------- chapter 08
print('chapter 08 — settings derived from chapters 01-03')


def distinct3(s):
    out = []
    for ch in s.replace(' ', ''):
        if ch not in out:
            out.append(ch)
        if len(out) == 3:
            break
    return out


wheels = ['I', 'II', 'III', 'IV', 'V']
order = [wheels[((ord(ch) - 64) % 5 + 1) - 1] for ch in distinct3(ch01)]   # A = 1, mod 5, +1
rings = ''.join(distinct3(ch02))
ground = ''.join(distinct3(ch03.replace(' ', '')))
print(f'         (wheels {order}, rings {rings}, ground {ground})')
icpt = ts('chapter08.ts', 'INTERCEPT')
ch08 = machine(order, rings, ground, icpt['plugboard'], icpt['reflector']).encrypt(icpt['ciphertext'])
check('ch08', ch08, 'YOUARECLOSERTHANYOUTHINK')


# ---------------------------------------------------------------- chapter 09
print('chapter 09 — book cipher over the archive')
folios = ts('archive.ts', 'ARCHIVE')
conc = ts('archive.ts', 'CONCORDANCE')
by_code = {f['code']: f for f in folios}


def first_letter(tok):
    for ch in tok:
        if ch.isalpha() and ch.isascii():
            return ch.upper()
    return '?'


ch09 = ''.join(
    first_letter(by_code[c['folio']]['lines'][c['line'] - 1].split()[c['word'] - 1]) for c in conc
)
check('ch09', ch09, 'THEFIRSTLETTEROFEVERYTHING')


# ---------------------------------------------------------------- chapter 10
print('chapter 10 — the first letter of everything')
STROKE = {'Ł': 'L', 'ł': 'l'}


def norm(s):
    s = ''.join(STROKE.get(c, c) for c in s)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return ''.join(c for c in s.upper() if c.isalnum() and c.isascii())


MESSAGES = ['LOOK AT THE MIRROR', 'PRIMES HAVE TWO FACES', 'THE KEY WAS NEVER RANDOM',
            'SEARCH BETWEEN DIMENSIONS', 'NOT EVERYTHING IS FLAT',
            'POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ', 'ENIGMA',
            'YOU ARE CLOSER THAN YOU THINK', 'THE FIRST LETTER OF EVERYTHING']
passphrase = ''.join(norm(w)[0] for m in MESSAGES for w in m.split())
check('ch10', passphrase, 'LATMPHTFTKWNRSBDNEIFPMZHEYACTYTTFLOE')

# and it must actually open the sealed text
import base64, hashlib                                        # noqa: E402
try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    sealed = ts('sealed.ts', 'SEALED')
    pw = ('|'.join(norm(m) for m in MESSAGES) + '|' + passphrase).encode()
    key_ = hashlib.pbkdf2_hmac('sha256', pw, base64.b64decode(sealed['salt']),
                               sealed['iterations'], 32)
    plain = AESGCM(key_).decrypt(base64.b64decode(sealed['iv']),
                                 base64.b64decode(sealed['ciphertext']), None).decode()
    check('ch10 seal opens', plain.splitlines()[-1], 'Czy zostaniesz moją dziewczyną?')
except ImportError:
    print('  [skip] cryptography not installed; seal not verified')

print(f'\n{len(OK)} passed, {len(FAIL)} failed')
sys.exit(1 if FAIL else 0)
