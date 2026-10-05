'use client';

import { useMemo, useState } from 'react';
import { MIRROR_PRIMES } from '@/data/chapter02';
import { twoSquares } from '@/lib/math';
import { ActionButton } from '@/components/Workbench';

/**
 * Chapter 02, the easier edition.
 *
 * The splitting p = a² + b² is done for you — that is arithmetic, not insight.  What
 * is left is the chapter's actual idea: there are two ways to order these primes and
 * two numbers in each split, and only one of the four combinations says anything.
 */

type Row = { p: number; a: number; b: number; deg: number };

const ROWS: Row[] = MIRROR_PRIMES.map((p) => {
  const [a, b] = twoSquares(p) ?? [0, 0];
  return { p, a, b, deg: (Math.atan2(b, a) * 180) / Math.PI };
});

const MAX = Math.max(...ROWS.map((r) => r.b)) * 1.06;

export default function GaussianPlane({ onSend }: { onSend: (numbers: string) => void }) {
  const [split, setSplit] = useState(false);
  const [order, setOrder] = useState<'size' | 'angle'>('size');

  const rows = useMemo(
    () => [...ROWS].sort((x, y) => (order === 'size' ? x.p - y.p : x.deg - y.deg)),
    [order],
  );

  const W = 320;
  const H = 320;
  const px = (v: number) => 24 + (v / MAX) * (W - 40);
  const py = (v: number) => H - 24 - (v / MAX) * (H - 40);

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby="gp-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id="gp-h" className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Eighteen primes, in the plane
        </h3>
        <span className="font-mono text-[10px] text-ink-500">p ≡ 1 (mod 4)</span>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-ink-700 px-5 py-4">
        <ActionButton onClick={() => setSplit(true)} disabled={split}>
          {split ? 'split' : 'split each p into a² + b²'}
        </ActionButton>
        <ActionButton onClick={() => setOrder('size')} disabled={!split} pressed={split && order === 'size'}>
          order by size
        </ActionButton>
        <ActionButton onClick={() => setOrder('angle')} disabled={!split} pressed={split && order === 'angle'}>
          order by angle
        </ActionButton>
      </div>

      <div className={`grid gap-px bg-ink-700 ${split ? 'md:grid-cols-[1fr_auto]' : ''}`}>
        <div className="min-w-0 overflow-x-auto bg-ink-850/70 px-5 py-4">
          <table className="tnum w-full border-collapse text-left font-mono text-[12.5px]">
            <caption className="sr-only">
              The eighteen primes{split ? ', with their split a² + b² and the angle of a + bi' : ''}
            </caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-widest2 text-ink-500">
                <th scope="col" className="pb-2 pr-4 font-normal">#</th>
                <th scope="col" className="pb-2 pr-4 font-normal">p</th>
                {split && (
                  <>
                    <th scope="col" className="pb-2 pr-4 font-normal">a</th>
                    <th scope="col" className="pb-2 pr-4 font-normal">b</th>
                    <th scope="col" className="pb-2 font-normal">angle</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="text-parchment/85">
              {rows.map((r, i) => (
                <tr key={r.p} className="border-t border-ink-700/40">
                  <td className="py-[4px] pr-4 text-ink-500">{i + 1}</td>
                  <td className="py-[4px] pr-4">{r.p.toLocaleString('en-US')}</td>
                  {split && (
                    <>
                      <td className="py-[4px] pr-4">{r.a}</td>
                      <td className="py-[4px] pr-4">{r.b}</td>
                      <td className="py-[4px] text-haze">{r.deg.toFixed(2)}°</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {split && (
          <div className="bg-ink-850/70 p-4">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto block w-full max-w-[320px]"
              role="img"
              aria-label="Each prime drawn as the point a + bi; they fan out at evenly spaced angles"
            >
              <line x1={px(0)} y1={py(0)} x2={px(MAX)} y2={py(0)} stroke="#1E2A38" />
              <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(MAX)} stroke="#1E2A38" />
              <line x1={px(0)} y1={py(0)} x2={px(MAX)} y2={py(MAX)} stroke="#1E2A38" strokeDasharray="2 5" />
              {rows.map((r, i) => (
                <g key={r.p}>
                  <line
                    x1={px(0)}
                    y1={py(0)}
                    x2={px(r.a)}
                    y2={py(r.b)}
                    stroke="#41576F"
                    strokeWidth={0.7}
                    strokeOpacity={0.6}
                  />
                  <circle cx={px(r.a)} cy={py(r.b)} r={3} fill="#8FA8C4" />
                  {order === 'angle' && (
                    <text
                      x={px(r.a) + 5}
                      y={py(r.b) - 4}
                      fill="#7C8A9C"
                      fontSize={9}
                      fontFamily="var(--font-mono), monospace"
                    >
                      {i + 1}
                    </text>
                  )}
                </g>
              ))}
              <text x={px(MAX) - 6} y={py(0) - 6} textAnchor="end" fill="#3a4a5e" fontSize={9} fontFamily="var(--font-mono), monospace">
                a (real)
              </text>
              <text x={px(0) + 6} y={py(MAX) + 10} fill="#3a4a5e" fontSize={9} fontFamily="var(--font-mono), monospace">
                b (imaginary)
              </text>
            </svg>
          </div>
        )}
      </div>

      {split && (
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-700 px-5 py-4">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
            send to the letter tool, in this order →
          </span>
          <ActionButton onClick={() => onSend(rows.map((r) => r.a).join(' '))}>column a</ActionButton>
          <ActionButton onClick={() => onSend(rows.map((r) => r.b).join(' '))}>column b</ActionButton>
        </div>
      )}
    </section>
  );
}
