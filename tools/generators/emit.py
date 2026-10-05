# -*- coding: utf-8 -*-
"""Emit the TypeScript data modules from the verified generator output."""
import json, os, random, sys
sys.path.insert(0, '/home/claude/gen')
from folios import FOLIOS

OUT = '/home/claude/pz/src/data'
PUB = '/home/claude/pz/public/puzzles'
os.makedirs(OUT, exist_ok=True)
os.makedirs(PUB, exist_ok=True)
HEAD = "// GENERATED FILE — produced by tools/generate.py.  Do not edit by hand.\n"


def w(name, body):
    open(os.path.join(OUT, name), 'w').write(HEAD + body)
    print('wrote', name)


# ------------------------------------------------------------------ ch01
ch01 = json.load(open('/home/claude/gen/ch01_final.json'))
rows = sorted(ch01, key=lambda r: r['p'])
lines = ",\n".join(
    f"  {{ run: {r['run']}, p: {r['p']}, alpha: {r['alpha']}, pi: {r['pi']} }}" for r in rows)
w('chapter01.ts', f"""
/** The Chapter 01 search log: fifteen primes tested, displayed in ASCENDING VALUE.
 *  `run` is the order in which they were actually tested — that order is the payload. */
export interface SearchRow {{ run: number; p: number; alpha: number; pi: number; }}

export const SEARCH_LOG: SearchRow[] = [
{lines},
];
""")

# ------------------------------------------------------------------ ch02
ch02 = json.load(open('/home/claude/gen/ch02_final.json'))
byval = sorted(ch02, key=lambda r: r['p'])
lines = ",\n".join(f"  {r['p']}" for r in byval)
w('chapter02.ts', f"""
/** Eighteen primes, every one congruent to 1 mod 4, listed in ascending value.
 *  The decomposition p = a^2 + b^2 and the ordering are left to the solver. */
export const MIRROR_PRIMES: number[] = [
{lines},
];
""")

# ------------------------------------------------------------------ ch03
ch03 = json.load(open('/home/claude/gen/ch03_final.json'))
w('chapter03.ts', f"""
/** A real 1024-bit RSA modulus, a real ciphertext, textbook (unpadded) RSA.
 *  m = int.from_bytes(plaintext_ascii, 'big');  c = m^e mod n. */
export const RSA = {{
  n: '{ch03['n']}',
  e: {ch03['e']},
  c: '{ch03['c']}',
  nHex: '{ch03['n_hex']}',
  cHex: '{ch03['c_hex']}',
  bits: 1024,
}};
""")
open(os.path.join(PUB, 'key-03.pub'), 'w').write(
    "# A PUZZLE FOR ZOSIA — chapter 03 public key\n"
    "# textbook RSA, no padding.  m = int.from_bytes(ascii, 'big'), c = m^e mod n\n"
    f"e = {ch03['e']}\n\nn = {ch03['n']}\n\nn_hex = {ch03['n_hex']}\n")
open(os.path.join(PUB, 'message-03.enc'), 'w').write(
    "# A PUZZLE FOR ZOSIA — chapter 03 ciphertext\n"
    f"c = {ch03['c']}\n\nc_hex = {ch03['c_hex']}\n")

# ------------------------------------------------------------------ ch04
true_zeros = json.load(open('/home/claude/gen/ch04_true.json'))
rng = random.Random(31415)
pts = [{'re': '0.5', 'im': z['gamma'][:20], 'idx': z['index'], 'real': True} for z in true_zeros]
gammas = [float(z['gamma']) for z in true_zeros]
lo, hi = min(gammas) - 4, max(gammas) + 4
# decoys A: on the critical line, but not zeros
for _ in range(17):
    g = rng.uniform(lo, hi)
    if min(abs(g - x) for x in gammas) < 0.25:
        g += 0.7
    pts.append({'re': '0.5', 'im': f'{g:.15f}', 'idx': None, 'real': False})
# decoys B: genuine ordinates, but nudged off the critical line
for z in rng.sample(true_zeros, 13):
    off = rng.choice([-0.041, -0.028, -0.017, 0.019, 0.033, 0.047])
    pts.append({'re': f'{0.5 + off:.3f}', 'im': z['gamma'][:20], 'idx': None, 'real': False})
rng.shuffle(pts)
lines = ",\n".join(
    f"  {{ re: {p['re']}, im: {p['im']}, id: '{i:02d}' }}" for i, p in enumerate(pts, 1))
w('chapter04.ts', f"""
/** Fifty-three points offered to the solver.  Exactly twenty-three of them are
 *  genuine nontrivial zeros of the zeta function; the rest sit either off the
 *  critical line or on it at ordinates where zeta does not vanish.  Which is which
 *  is not recorded here — that is the chapter. */
export interface PlanePoint {{ re: number; im: number; id: string; }}

export const PLANE_POINTS: PlanePoint[] = [
{lines},
];
""")

# ------------------------------------------------------------------ ch05
ch05 = json.load(open('/home/claude/gen/ch05_final.json'))
w('chapter05.ts', f"""
/** A genuine curve over F_p with a deliberately smooth base-point order. */
export const CURVE = {{
  p: '{ch05['p']}',
  a: '{ch05['a']}',
  b: '{ch05['b']}',
  G: {{ x: '{ch05['G'][0]}', y: '{ch05['G'][1]}' }},
  Q: {{ x: '{ch05['Q'][0]}', y: '{ch05['Q'][1]}' }},
  ciphertext: '{ch05['ciphertext']}',
}};
""")

# ------------------------------------------------------------------ ch07 / ch08
ch07 = json.load(open('/home/claude/gen/ch07_final.json'))
inds = ch07['indicators']
grid = ",\n".join("  " + ", ".join(f"'{g}'" for g in inds[i:i + 6]) for i in range(0, len(inds), 6))
w('chapter07.ts', f"""
/** {len(inds)} doubled indicators from one day's traffic, one ground setting.
 *  Positions 1&4, 2&5, 3&6 are the same plaintext letter enciphered six steps apart. */
export const INDICATORS: string[] = [
{grid},
];

/** The cycle-length characteristic the solver should arrive at, for self-checking.
 *  Rejewski's theorem forces the lengths to pair up; these are the half-multisets. */
export const CHARACTERISTIC = {json.dumps({k: v['characteristic'] for k, v in ch07['analysis'].items()})};
""")

w('chapter08.ts', f"""
/** The intercept.  Reflector and plugboard were recovered from the day's key sheet;
 *  the wheel order, the ring setting and the ground setting were not. */
export const INTERCEPT = {{
  ciphertext: 'OLQVJSHBEPPJZIOMFGEARAWB',
  reflector: 'B',
  plugboard: 'AV BS CG DL FU HZ IN KM OW RX',
  length: 24,
}};
""")

# ------------------------------------------------------------------ ch09
ch09 = json.load(open('/home/claude/gen/ch09_final.json'))
folio_ts = ",\n".join(
    "  {\n"
    f"    code: {json.dumps(code)},\n"
    f"    title: {json.dumps(title)},\n"
    f"    date: {json.dumps(date)},\n"
    "    lines: [\n" + ",\n".join(f"      {json.dumps(l)}" for l in ls) + ",\n    ],\n"
    "  }"
    for code, title, date, ls in FOLIOS)
conc_ts = ",\n".join(
    f"  {{ folio: '{c['folio']}', line: {c['line']}, word: {c['word']} }}"
    for c in ch09['concordance'])
w('archive.ts', f"""
export interface Folio {{ code: string; title: string; date: string; lines: string[]; }}

/** The archive.  {ch09['total_words']} words over {ch09['total_lines']} numbered lines in fourteen folios. */
export const ARCHIVE: Folio[] = [
{folio_ts},
];

export interface Coordinate {{ folio: string; line: number; word: number; }}

/** The concordance card found loose in the archive.  Twenty-six coordinates. */
export const CONCORDANCE: Coordinate[] = [
{conc_ts},
];
""")

# ------------------------------------------------------------------ sealed
ch10 = json.load(open('/home/claude/gen/ch10_final.json'))
h = ch10['hashes']
hash_ts = ",\n".join(f"  {k}: '{v}'" for k, v in h.items())
w('sealed.ts', f"""
/** Answer digests.  SHA-256('zosia/<id>/<normalised answer>').
 *  These are the only representation of the answers anywhere in the bundle. */
export const ANSWER_HASHES: Record<string, string> = {{
{hash_ts},
}};

/** The closing text of Chapter 10, sealed under AES-256-GCM.
 *  The key is PBKDF2-SHA256 over all nine answers plus the final passphrase,
 *  so this blob is inert until the puzzle has actually been solved. */
export const SEALED = {{
  salt: '{ch10['payload']['salt']}',
  iv: '{ch10['payload']['iv']}',
  ciphertext: '{ch10['payload']['ciphertext']}',
  iterations: {ch10['payload']['iterations']},
}};
""")
print('\nall data modules emitted')
