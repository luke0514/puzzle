'use client';

import { useEffect, useState } from 'react';
import { CHAPTERS } from '@/chapters/registry';
import { chapterOf, loadState } from '@/lib/puzzleState';

/**
 * The solver's own notebook: the sentences she has already recovered, read back out of
 * this browser's progress.  Nothing here comes from the bundle — a chapter she has not
 * solved on this device simply shows as missing — so it spoils nothing.
 */
export default function Notebook({ orders, title = 'Your notebook' }: { orders: number[]; title?: string }) {
  const [entries, setEntries] = useState<Array<{ numeral: string; title: string; text: string | null }> | null>(null);

  const key = orders.join(',');

  useEffect(() => {
    const wanted = key.split(',').map(Number);
    const read = () => {
      const s = loadState();
      setEntries(
        wanted.map((o) => {
          const meta = CHAPTERS[o - 1];
          const c = chapterOf(s, meta.id);
          return { numeral: meta.numeral, title: meta.title, text: c.typed ?? c.answer ?? null };
        }),
      );
    };
    read();
    window.addEventListener('zosia:state', read);
    return () => window.removeEventListener('zosia:state', read);
  }, [key]);

  if (!entries) return null;

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby="notebook-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id="notebook-h" className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          {title}
        </h3>
        <span className="font-mono text-[10px] text-ink-500">what you have already found</span>
      </div>
      <ol className="px-5 py-4">
        {entries.map((e) => (
          <li key={e.numeral} className="flex flex-col gap-1 border-b border-ink-700/40 py-2 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-5">
            <span className="w-44 shrink-0 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
              {e.numeral} · {e.title}
            </span>
            {e.text ? (
              <span className="break-words font-mono text-[14px] tracking-[0.14em] text-parchment/90">
                {e.text.toUpperCase()}
              </span>
            ) : (
              <span className="font-mono text-[11px] italic text-ink-500">
                not on this device — you will remember it
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
