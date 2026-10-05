'use client';

import { useMemo } from 'react';

/**
 * Numbers in, letters out.  Each number is rounded down, reduced modulo 26, and read
 * with A = 0.  Paste a column, or let a chapter's table send one in.
 *
 * It does exactly the reduction and nothing else: which numbers, and in which order,
 * is still the chapter.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function lettersFor(text: string): Array<{ raw: string; whole: number; r: number; letter: string }> {
  return text
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((raw) => {
      const value = Number(raw.replace(/_/g, ''));
      if (!Number.isFinite(value)) return { raw, whole: NaN, r: NaN, letter: '?' };
      const whole = Math.floor(value);
      const r = ((whole % 26) + 26) % 26;
      return { raw, whole, r, letter: ALPHABET[r] };
    });
}

export default function LetterTool({
  value,
  onChange,
  id = 'letter-tool',
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const rows = useMemo(() => lettersFor(value), [value]);
  const word = rows.map((r) => r.letter).join('');

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id={`${id}-h`} className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Numbers → letters
        </h3>
        <span className="font-mono text-[10px] text-ink-500">⌊x⌋ mod 26 · A = 0</span>
      </div>

      <div className="px-5 py-5">
        <div
          className="mb-5 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-px overflow-hidden border border-ink-700 bg-ink-700 text-center font-mono"
          aria-label="The alphabet numbered from zero"
        >
          {ALPHABET.split('').map((l, i) => (
            <div key={l} className="bg-ink-900/70 py-1">
              <div className="text-[12px] text-parchment/85">{l}</div>
              <div className="tnum text-[9px] text-ink-500">{i}</div>
            </div>
          ))}
        </div>

        <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
          numbers, in the order you want to read them
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="e.g.  27  104.9  51"
          className="mt-2 w-full resize-y border border-ink-600 bg-ink-900/70 px-3 py-2 font-mono text-[13px] leading-relaxed text-parchment placeholder:text-ink-500 focus:border-steel-dim focus:outline-none"
        />

        {rows.length > 0 && (
          <>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-500">
              {rows.map((r, i) => (
                <span key={`${r.raw}-${i}`} className="tnum">
                  {Number.isFinite(r.whole) ? `${r.whole} → ${r.r} → ` : `${r.raw} → `}
                  <span className="text-parchment/85">{r.letter}</span>
                </span>
              ))}
            </div>
            <p
              aria-live="polite"
              className="mt-5 break-all font-mono text-[clamp(15px,4vw,20px)] tracking-[0.3em] text-signal"
            >
              {word}
            </p>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onChange('')}
            className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
          >
            clear
          </button>
        </div>
      </div>
    </section>
  );
}
