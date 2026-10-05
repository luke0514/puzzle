'use client';

import { useMemo, useState } from 'react';
import { CURVE } from '@/data/chapter05';
import { Curve, type Point } from '@/lib/math';

/**
 * Two halves.
 *
 * Left: the curve drawn over the reals, purely so the group law has a picture — three
 * collinear points summing to zero is the whole definition and it deserves to be seen.
 *
 * Right: a working calculator on the ACTUAL curve over F_p, with BigInt arithmetic.
 * It computes kG for any k you give it.  The attack itself lives in CurveWorkbench.
 */

const p = BigInt(CURVE.p);
const a = BigInt(CURVE.a);
const b = BigInt(CURVE.b);
const E = new Curve(a, b, p);
const G: Point = { x: BigInt(CURVE.G.x), y: BigInt(CURVE.G.y) };
const Q: Point = { x: BigInt(CURVE.Q.x), y: BigInt(CURVE.Q.y) };

/** A small illustrative curve over ℝ, for the drawing only. */
function realCurvePath(A: number, B: number, w: number, h: number) {
  const xs: string[] = [];
  const top: [number, number][] = [];
  const scale = 42;
  for (let px = -2.6; px <= 3.2; px += 0.008) {
    const y2 = px * px * px + A * px + B;
    if (y2 < 0) continue;
    top.push([px, Math.sqrt(y2)]);
  }
  const toScreen = ([x, y]: [number, number]) => [w / 2 + x * scale, h / 2 - y * scale];
  if (top.length) {
    xs.push(`M ${toScreen(top[0]).map((n) => n.toFixed(1)).join(' ')}`);
    for (const pt of top.slice(1)) xs.push(`L ${toScreen(pt).map((n) => n.toFixed(1)).join(' ')}`);
    for (let i = top.length - 1; i >= 0; i -= 1) {
      const [x, y] = top[i];
      xs.push(`L ${toScreen([x, -y]).map((n) => n.toFixed(1)).join(' ')}`);
    }
  }
  return xs.join(' ');
}

function fmt(P: Point): string {
  if (P === null) return 'O  (point at infinity)';
  return `(${P.x.toString()},\n ${P.y.toString()})`;
}

export default function EllipticCurveVisualizer() {
  const [k, setK] = useState('2');
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    setError(null);
    const trimmed = k.trim();
    if (!/^-?\d+$/.test(trimmed)) return null;
    try {
      return E.mul(BigInt(trimmed), G);
    } catch {
      setError('arithmetic failed');
      return null;
    }
  }, [k]);

  const path = useMemo(() => realCurvePath(-2.2, 2.4, 300, 240), []);

  return (
    <div className="my-10 grid gap-px border border-ink-600 bg-ink-600 md:grid-cols-2">
      {/* ------------------------------------------------ the picture */}
      <div className="bg-ink-850/60 p-5">
        <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          The group law, over ℝ
        </h3>
        <svg viewBox="0 0 300 240" className="w-full" role="img" aria-label="An elliptic curve over the reals, with a chord through two points meeting the curve at a third">
          <line x1="0" y1="120" x2="300" y2="120" stroke="#1E2A38" />
          <line x1="150" y1="0" x2="150" y2="240" stroke="#1E2A38" />
          <path d={path} fill="none" stroke="#8FA8C4" strokeWidth="1.2" strokeOpacity="0.85" />
          {/* P, Q, and the third intersection, drawn schematically */}
          <line x1="88" y1="52" x2="248" y2="176" stroke="#41576F" strokeWidth="0.9" strokeDasharray="3 4" />
          <circle cx="88" cy="52" r="3" fill="#B8CBE0" />
          <circle cx="188" cy="130" r="3" fill="#B8CBE0" />
          <circle cx="232" cy="164" r="3" fill="#7C8A9C" />
          <line x1="232" y1="164" x2="232" y2="76" stroke="#41576F" strokeWidth="0.9" strokeDasharray="2 4" />
          <circle cx="232" cy="76" r="3.4" fill="#B8CBE0" stroke="#B8CBE0" />
          <text x="76" y="46" fill="#7C8A9C" fontSize="10" fontFamily="var(--font-mono), monospace">P</text>
          <text x="178" y="124" fill="#7C8A9C" fontSize="10" fontFamily="var(--font-mono), monospace">Q</text>
          <text x="240" y="72" fill="#7C8A9C" fontSize="10" fontFamily="var(--font-mono), monospace">P+Q</text>
        </svg>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-500">
          A line meets a cubic in three points. Declare their sum to be zero and associativity
          falls out of nowhere. Over a finite field the picture disappears and the group stays.
        </p>
      </div>

      {/* ------------------------------------------------ the calculator */}
      <div className="bg-ink-850/60 p-5">
        <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Scalar multiplication on E(F<tspan>p</tspan>)
        </h3>

        <label
          htmlFor="ec-k"
          className="block font-mono text-[10px] uppercase tracking-widest2 text-ink-500"
        >
          k
        </label>
        <input
          id="ec-k"
          value={k}
          onChange={(e) => setK(e.target.value)}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="mt-2 w-full border border-ink-600 bg-ink-900/70 px-3 py-2 font-mono text-[13px] text-parchment focus:border-steel-dim focus:outline-none"
        />

        <div className="mt-5">
          <div className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">kG</div>
          <pre className="tnum mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-parchment/85">
            {error ?? (result !== undefined ? fmt(result) : '—')}
          </pre>
          {result && Q && result.x === Q.x && result.y === Q.y && (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest2 text-signal">= Q ✓</p>
          )}
        </div>

        <dl className="mt-6 space-y-2 border-t border-ink-700 pt-4 font-mono text-[11px]">
          <div className="flex gap-3">
            <dt className="w-14 shrink-0 text-ink-500">on E</dt>
            <dd className="text-haze">
              G {E.contains(G) ? '✓' : '✗'} · Q {E.contains(Q) ? '✓' : '✗'}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-14 shrink-0 text-ink-500">Δ ≠ 0</dt>
            <dd className="text-haze">
              {((4n * a * a * a + 27n * b * b) % p) !== 0n ? 'non-singular' : 'singular'}
            </dd>
          </div>
        </dl>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-500">
          Try a few small k to get a feel for it. Once the workbench below has found the real
          k, you can paste it here and watch kG land exactly on Q.
        </p>
      </div>
    </div>
  );
}
