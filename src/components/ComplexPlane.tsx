'use client';

import { useMemo, useRef, useState } from 'react';
import { PLANE_POINTS, type PlanePoint } from '@/data/chapter04';
import { ActionButton } from '@/components/Workbench';
import { ZERO_THRESHOLD, zetaAbs } from '@/lib/zeta';

/**
 * The Chapter 04 scatter.
 *
 * Horizontal axis: real part, magnified about Re = 1/2 by an adjustable factor.
 * Vertical axis: imaginary part, the full range, in a scrolling column.
 *
 * At 1x every point sits on the critical line, which is the point of the chapter —
 * the eye is not an instrument.  Turn the magnification up and some of them leave.
 * The ones that stay are still not necessarily zeros — which is why, in the easier
 * edition, selecting a point also measures |ζ| there (see src/lib/zeta.ts).
 */

/** |ζ| at a point, formatted the same way everywhere on the page. */
export function formatZeta(v: number): string {
  return v < ZERO_THRESHOLD ? '0  (a zero)' : v.toFixed(4);
}

const IM_MIN = Math.min(...PLANE_POINTS.map((p) => p.im)) - 6;
const IM_MAX = Math.max(...PLANE_POINTS.map((p) => p.im)) + 6;
const VIEW_H = 2600;
const VIEW_W = 760;

export default function ComplexPlane() {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);

  const yOf = (im: number) => VIEW_H - ((im - IM_MIN) / (IM_MAX - IM_MIN)) * VIEW_H;
  // Re = 0.5 sits at the centre; one unit of Re spans `zoom` * 300 px.
  const xOf = (re: number) => VIEW_W / 2 + (re - 0.5) * 300 * zoom;

  const chosen = useMemo(
    () => PLANE_POINTS.find((p) => p.id === selected) ?? null,
    [selected],
  );

  return (
    <div className="my-10 border border-ink-600 bg-ink-850/40">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 px-5 py-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Critical strip — {PLANE_POINTS.length} points
        </h3>
        <label className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
          magnification
          <input
            type="range"
            min={1}
            max={400}
            step={1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Real-axis magnification"
            className="h-[2px] w-24 cursor-pointer appearance-none bg-ink-600 accent-steel sm:w-40"
          />
          <span className="tnum w-12 text-right text-haze">{zoom}×</span>
        </label>
      </div>

      <div
        ref={scroller}
        className="max-h-[520px] overflow-auto"
        tabIndex={0}
        aria-label="Scatter of points in the critical strip; scroll vertically"
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={VIEW_W}
          height={VIEW_H}
          className="block"
          role="img"
          aria-label={`${PLANE_POINTS.length} plotted points`}
        >
          {/* the critical line */}
          <line
            x1={xOf(0.5)}
            y1={0}
            x2={xOf(0.5)}
            y2={VIEW_H}
            stroke="#41576F"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
          {/* Re = 0 and Re = 1, the edges of the strip, only visible when zoomed out */}
          {[0, 1].map((re) => (
            <line
              key={re}
              x1={xOf(re)}
              y1={0}
              x2={xOf(re)}
              y2={VIEW_H}
              stroke="#1E2A38"
              strokeWidth={1}
            />
          ))}
          {/* horizontal rules every 25 in the imaginary direction */}
          {Array.from({ length: Math.ceil((IM_MAX - IM_MIN) / 25) + 1 }, (_, i) => {
            const im = Math.ceil(IM_MIN / 25) * 25 + i * 25;
            if (im > IM_MAX) return null;
            return (
              <g key={im}>
                <line x1={0} y1={yOf(im)} x2={VIEW_W} y2={yOf(im)} stroke="#141d27" />
                <text
                  x={8}
                  y={yOf(im) - 5}
                  fill="#3a4a5e"
                  fontSize={10}
                  fontFamily="var(--font-mono), monospace"
                >
                  {im}
                </text>
              </g>
            );
          })}

          {PLANE_POINTS.map((p) => {
            const isSel = p.id === selected;
            return (
              <g key={p.id}>
                <circle
                  cx={xOf(p.re)}
                  cy={yOf(p.im)}
                  r={isSel ? 5.5 : 3.2}
                  fill={isSel ? '#B8CBE0' : '#8FA8C4'}
                  fillOpacity={isSel ? 1 : 0.7}
                  stroke={isSel ? '#B8CBE0' : 'none'}
                  strokeWidth={1}
                />
                <circle
                  cx={xOf(p.re)}
                  cy={yOf(p.im)}
                  r={13}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => setSelected(isSel ? null : p.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Point ${p.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(isSel ? null : p.id);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-ink-700 px-5 py-4">
        {chosen ? (
          <dl className="tnum grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-[12px]">
            <dt className="text-ink-500">id</dt>
            <dd className="text-parchment/85">{chosen.id}</dd>
            <dt className="text-ink-500">Re</dt>
            <dd className="text-parchment/85">{chosen.re}</dd>
            <dt className="text-ink-500">Im</dt>
            <dd className="text-parchment/85">{chosen.im}</dd>
            <dt className="text-ink-500">|ζ(s)|</dt>
            <dd className={zetaAbs(chosen.re, chosen.im) < ZERO_THRESHOLD ? 'text-signal' : 'text-parchment/85'}>
              {formatZeta(zetaAbs(chosen.re, chosen.im))}
            </dd>
          </dl>
        ) : (
          <p className="font-mono text-[11px] text-ink-500">
            Select a point to read its coordinates and measure ζ there. The picture alone is not
            evidence of anything.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The same data as a table — and, in the easier edition, the instrument the chapter
 * needs: measure |ζ| at every point, keep the zeros, put them in order, send the
 * ordinates to the letter tool.
 */
export function PlaneTable({ onSend }: { onSend?: (numbers: string) => void }) {
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const [onlyZeros, setOnlyZeros] = useState(false);
  const [byIm, setByIm] = useState(false);

  const measure = (p: PlanePoint) =>
    setMeasured((m) => (p.id in m ? m : { ...m, [p.id]: zetaAbs(p.re, p.im) }));
  const measureAll = () =>
    setMeasured(Object.fromEntries(PLANE_POINTS.map((p) => [p.id, zetaAbs(p.re, p.im)])));

  const allMeasured = Object.keys(measured).length === PLANE_POINTS.length;
  const zeroCount = Object.values(measured).filter((v) => v < ZERO_THRESHOLD).length;

  const rows = useMemo(() => {
    let r = [...PLANE_POINTS];
    if (onlyZeros) r = r.filter((p) => p.id in measured && measured[p.id] < ZERO_THRESHOLD);
    if (byIm) r.sort((a, b) => a.im - b.im);
    return r;
  }, [byIm, measured, onlyZeros]);

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby="zeta-table-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id="zeta-table-h" className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          The points, and the test
        </h3>
        <span className="font-mono text-[10px] text-ink-500" aria-live="polite">
          {Object.keys(measured).length} / {PLANE_POINTS.length} measured
          {Object.keys(measured).length > 0 && ` · ${zeroCount} zeros`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-ink-700 px-5 py-4">
        <ActionButton onClick={measureAll} disabled={allMeasured}>
          measure |ζ| everywhere
        </ActionButton>
        <ActionButton
          onClick={() => setOnlyZeros((v) => !v)}
          disabled={Object.keys(measured).length === 0}
          pressed={onlyZeros}
        >
          keep only the zeros
        </ActionButton>
        <ActionButton onClick={() => setByIm((v) => !v)} pressed={byIm}>
          order by Im(s)
        </ActionButton>
      </div>

      <div className="max-h-[380px] overflow-auto px-5 py-4">
        <table className="tnum w-full border-collapse text-left font-mono text-[12px]">
          <caption className="sr-only">Plotted points with exact coordinates and the measured size of zeta</caption>
          <thead>
            <tr className="text-[10px] uppercase tracking-widest2 text-ink-500">
              <th scope="col" className="pb-2 pr-5 font-normal">id</th>
              <th scope="col" className="pb-2 pr-5 font-normal">Re(s)</th>
              <th scope="col" className="pb-2 pr-5 font-normal">Im(s)</th>
              <th scope="col" className="pb-2 font-normal">|ζ(s)|</th>
            </tr>
          </thead>
          <tbody className="text-parchment/80">
            {rows.map((p) => {
              const v = measured[p.id];
              const isZero = v !== undefined && v < ZERO_THRESHOLD;
              return (
                <tr key={p.id} className="border-t border-ink-700/40">
                  <td className="py-[5px] pr-5 text-ink-500">{p.id}</td>
                  <td className="py-[5px] pr-5">{p.re}</td>
                  <td className="py-[5px] pr-5">{p.im}</td>
                  <td className="py-[5px]">
                    {v === undefined ? (
                      <button
                        type="button"
                        onClick={() => measure(p)}
                        className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim underline underline-offset-4 hover:text-signal"
                      >
                        measure
                      </button>
                    ) : (
                      <span className={isZero ? 'text-signal' : 'text-haze'}>{formatZeta(v)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onSend && (
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-700 px-5 py-4">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
            send the rows shown, in this order, to the letter tool →
          </span>
          <ActionButton onClick={() => onSend(rows.map((p) => String(p.im)).join(' '))}>
            Im(s) column
          </ActionButton>
        </div>
      )}
    </section>
  );
}
