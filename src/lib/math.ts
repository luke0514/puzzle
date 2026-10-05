/**
 * The mathematics the site itself needs to run: modular arithmetic, Fibonacci by
 * fast doubling, Gaussian-integer decomposition, and short-Weierstrass elliptic
 * curve arithmetic for the Chapter 05 visualiser.
 *
 * Everything is BigInt where a Number would overflow.  None of this is a shortcut
 * for the solver — it is what the interactive components use to draw and to check.
 */

// ---------------------------------------------------------------- modular
export function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

export function powMod(base: bigint, exp: bigint, m: bigint): bigint {
  let result = 1n;
  let b = mod(base, m);
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return result;
}

/** Extended Euclid; throws when the inverse does not exist. */
export function invMod(a: bigint, m: bigint): bigint {
  let [old_r, r] = [mod(a, m), m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) throw new Error(`${a} is not invertible mod ${m}`);
  return mod(old_s, m);
}

export function gcd(a: bigint, b: bigint): bigint {
  let [x, y] = [a < 0n ? -a : a, b < 0n ? -b : b];
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Integer square root by Newton's method (exact for BigInt). */
export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new Error('isqrt of negative');
  if (n < 2n) return n;
  // Start just above the root (2^⌈bits/2⌉ ≥ √n) rather than at n itself, so Newton
  // converges in a handful of steps instead of first halving its way down for hundreds.
  const bits = n.toString(16).length * 4;
  let x = 1n << BigInt(Math.ceil(bits / 2));
  let y = (x + n / x) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}

// -------------------------------------------------------------- Fibonacci
/**
 * Fast doubling: returns [F(n) mod m, F(n+1) mod m] in O(log n).
 * This is exactly the Q-matrix exponentiation of Chapter 01, written without
 * the matrix — the identities F(2k) = F(k)(2F(k+1) - F(k)) and
 * F(2k+1) = F(k)^2 + F(k+1)^2 are what A^n gives you when you expand it.
 */
export function fibPair(n: bigint, m: bigint): [bigint, bigint] {
  if (n === 0n) return [0n, 1n % m];
  const [a, b] = fibPair(n >> 1n, m);
  const c = mod(a * mod(2n * b - a, m), m);
  const d = mod(a * a + b * b, m);
  return n & 1n ? [d, mod(c + d, m)] : [c, d];
}

export function fibMod(n: bigint, m: bigint): bigint {
  return fibPair(n, m)[0];
}

/** The Q-matrix raised to n, reduced mod m: [[F(n+1), F(n)], [F(n), F(n-1)]]. */
export function qMatrixPow(n: bigint, m: bigint): [bigint, bigint, bigint, bigint] {
  const [fn, fn1] = fibPair(n, m);
  const fnm1 = mod(fn1 - fn, m);
  return [fn1, fn, fn, fnm1];
}

// ------------------------------------------------------- Gaussian integers
/** Unique 0 < a < b with a^2 + b^2 = p, for a prime p = 1 (mod 4).  Null otherwise. */
export function twoSquares(p: number): [number, number] | null {
  if (p % 4 !== 1) return null;
  const limit = Math.floor(Math.sqrt(p));
  for (let a = 1; a <= limit; a += 1) {
    const r = p - a * a;
    const b = Math.round(Math.sqrt(r));
    if (b * b === r && a < b) return [a, b];
  }
  return null;
}

// -------------------------------------------------------- elliptic curves
export type Point = { x: bigint; y: bigint } | null; // null is the point at infinity

export class Curve {
  constructor(
    readonly a: bigint,
    readonly b: bigint,
    readonly p: bigint,
  ) {}

  contains(P: Point): boolean {
    if (P === null) return true;
    return mod(P.y * P.y - (P.x * P.x * P.x + this.a * P.x + this.b), this.p) === 0n;
  }

  negate(P: Point): Point {
    return P === null ? null : { x: P.x, y: mod(-P.y, this.p) };
  }

  add(P: Point, Q: Point): Point {
    if (P === null) return Q;
    if (Q === null) return P;
    const { p } = this;
    if (P.x === Q.x && mod(P.y + Q.y, p) === 0n) return null;
    const lambda =
      P.x === Q.x && P.y === Q.y
        ? mod((3n * P.x * P.x + this.a) * invMod(2n * P.y, p), p)
        : mod((Q.y - P.y) * invMod(Q.x - P.x, p), p);
    const x = mod(lambda * lambda - P.x - Q.x, p);
    return { x, y: mod(lambda * (P.x - x) - P.y, p) };
  }

  /** Double-and-add. */
  mul(k: bigint, P: Point): Point {
    if (k < 0n) return this.mul(-k, this.negate(P));
    let result: Point = null;
    let addend = P;
    let n = k;
    while (n > 0n) {
      if (n & 1n) result = this.add(result, addend);
      addend = this.add(addend, addend);
      n >>= 1n;
    }
    return result;
  }
}

// ------------------------------------------------------------------ misc
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) {
    if (n % p === 0) return n === p;
  }
  let d = n - 1;
  let r = 0;
  while (d % 2 === 0) {
    d /= 2;
    r += 1;
  }
  const N = BigInt(n);
  witness: for (const aa of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) {
    let x = powMod(BigInt(aa), BigInt(d), N);
    if (x === 1n || x === N - 1n) continue;
    for (let i = 1; i < r; i += 1) {
      x = (x * x) % N;
      if (x === N - 1n) continue witness;
    }
    return false;
  }
  return true;
}

export function primesUpTo(limit: number): number[] {
  const sieve = new Uint8Array(limit + 1);
  const out: number[] = [];
  for (let i = 2; i <= limit; i += 1) {
    if (!sieve[i]) {
      out.push(i);
      for (let j = i * i; j <= limit; j += i) sieve[j] = 1;
    }
  }
  return out;
}

/** Letter index (A = 0) as a letter. */
export function toLetter(n: number): string {
  return String.fromCharCode(65 + ((n % 26) + 26) % 26);
}
