/**
 * |ζ(s)| for s = σ + it in the critical strip, by Euler–Maclaurin summation.
 *
 * Used by the Chapter 04 probe so the zero test can be done in the browser instead of
 * in mpmath.  Double precision is plenty for what the chapter needs: at a genuine zero
 * the result is around 1e-11, and the nearest impostor on this page sits at about 0.026,
 * so the two populations are separated by nine orders of magnitude.
 *
 *   ζ(s) ≈ Σ_{n<N} n^{-s} + N^{1-s}/(s-1) + N^{-s}/2
 *          + Σ_{k=1}^{M} B_{2k}/(2k)! · s(s+1)…(s+2k-2) · N^{-s-2k+1}
 */

type C = { re: number; im: number };

const add = (a: C, b: C): C => ({ re: a.re + b.re, im: a.im + b.im });
const mul = (a: C, b: C): C => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const scale = (a: C, k: number): C => ({ re: a.re * k, im: a.im * k });
const div = (a: C, b: C): C => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};

/** n^{-s} = e^{-σ ln n} · (cos(t ln n) − i sin(t ln n)). */
function powNeg(n: number, s: C): C {
  const ln = Math.log(n);
  const mag = Math.exp(-s.re * ln);
  const ang = -s.im * ln;
  return { re: mag * Math.cos(ang), im: mag * Math.sin(ang) };
}

/** B_{2k} / (2k)! for k = 1..10. */
const BERNOULLI_OVER_FACTORIAL: number[] = [
  1 / 6 / 2,
  -1 / 30 / 24,
  1 / 42 / 720,
  -1 / 30 / 40320,
  5 / 66 / 3628800,
  -691 / 2730 / 479001600,
  7 / 6 / 87178291200,
  -3617 / 510 / 20922789888000,
  43867 / 798 / 6402373705728000,
  -174611 / 330 / 2432902008176640000,
];

export function zeta(sigma: number, t: number): C {
  const s: C = { re: sigma, im: t };
  const N = Math.ceil(Math.abs(t)) + 20;

  let sum: C = { re: 0, im: 0 };
  for (let n = 1; n < N; n += 1) sum = add(sum, powNeg(n, s));

  const Ns = powNeg(N, s); // N^{-s}
  // N^{1-s}/(s-1)
  sum = add(sum, div(scale(Ns, N), { re: s.re - 1, im: s.im }));
  // N^{-s}/2
  sum = add(sum, scale(Ns, 0.5));

  // Bernoulli tail
  let rising: C = s; // s(s+1)…(s+2k-2), starting at k = 1
  let Npow = 1 / N; // N^{-2k+1}
  for (let k = 1; k <= BERNOULLI_OVER_FACTORIAL.length; k += 1) {
    const term = scale(mul(rising, Ns), BERNOULLI_OVER_FACTORIAL[k - 1] * Npow);
    sum = add(sum, term);
    rising = mul(mul(rising, { re: s.re + 2 * k - 1, im: s.im }), { re: s.re + 2 * k, im: s.im });
    Npow /= N * N;
  }
  return sum;
}

export function zetaAbs(sigma: number, t: number): number {
  const z = zeta(sigma, t);
  return Math.hypot(z.re, z.im);
}

/** Below this, the probe calls it a zero.  Genuine zeros here come out near 1e-11. */
export const ZERO_THRESHOLD = 1e-6;
