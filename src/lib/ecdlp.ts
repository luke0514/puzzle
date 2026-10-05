/**
 * The Chapter 05 attack, as plain functions: the order of G (verified), Pohlig–Hellman
 * with baby-step giant-step in each prime-order subgroup, and the CRT that glues the
 * pieces back together.  Used by the Chapter 05 workbench.
 */
import { CURVE } from '@/data/chapter05';
import { Curve, invMod, mod, type Point } from '@/lib/math';

export const E = new Curve(BigInt(CURVE.a), BigInt(CURVE.b), BigInt(CURVE.p));
export const G: Point = { x: BigInt(CURVE.G.x), y: BigInt(CURVE.G.y) };
export const Q: Point = { x: BigInt(CURVE.Q.x), y: BigInt(CURVE.Q.y) };

/** ord(G).  Verified, not assumed: the workbench's first step checks ORDER·G = O and
 *  (ORDER/q)·G ≠ O for every prime q dividing it. */
export const ORDER = 1125899915898850n;

const key = (P: Point) => (P === null ? 'O' : `${P.x}:${P.y}`);

export function factor(n: bigint): Array<[bigint, number]> {
  const out: Array<[bigint, number]> = [];
  let r = n;
  for (let d = 2n; d * d <= r; d += d === 2n ? 1n : 2n) {
    let e = 0;
    while (r % d === 0n) {
      r /= d;
      e += 1;
    }
    if (e) out.push([d, e]);
  }
  if (r > 1n) out.push([r, 1]);
  return out;
}

/** Baby-step giant-step in a subgroup of prime order q: find d with d·P = H. */
export function bsgs(P: Point, H: Point, q: bigint): bigint {
  let m = 1n;
  while (m * m < q) m += 1n;
  const table = new Map<string, bigint>();
  let R: Point = null;
  for (let j = 0n; j < m; j += 1n) {
    if (!table.has(key(R))) table.set(key(R), j);
    R = E.add(R, P);
  }
  const giant = E.negate(E.mul(m, P));
  let gamma = H;
  for (let i = 0n; i <= m; i += 1n) {
    const j = table.get(key(gamma));
    if (j !== undefined) return mod(i * m + j, q);
    gamma = E.add(gamma, giant);
  }
  throw new Error('no logarithm in subgroup');
}

export type Piece = { q: bigint; e: number; modulus: bigint; residue: bigint };

export function pohligHellman(factors: Array<[bigint, number]>): Piece[] {
  return factors.map(([q, e]) => {
    const gamma = E.mul(ORDER / q, G); // a point of order q
    let x = 0n;
    let qj = 1n;
    for (let j = 0; j < e; j += 1) {
      const H = E.mul(ORDER / (qj * q), E.add(Q, E.negate(E.mul(x, G))));
      x += bsgs(gamma, H, q) * qj;
      qj *= q;
    }
    return { q, e, modulus: qj, residue: mod(x, qj) };
  });
}

export function crt(pieces: Piece[]): bigint {
  let x = 0n;
  let M = 1n;
  for (const { modulus, residue } of pieces) {
    const t = mod((residue - x) * invMod(M, modulus), modulus);
    x += M * t;
    M *= modulus;
  }
  return mod(x, M);
}

