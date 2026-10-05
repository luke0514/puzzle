'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CHAPTERS, CHAPTER_IDS } from '@/chapters/registry';
import ProgressIndicator from '@/components/ProgressIndicator';
import { furthestUnlocked, isSolved, loadState, resetAll, exportState } from '@/lib/puzzleState';

/**
 * The index.  Chapters you have not reached are shown as a rule and a numeral only —
 * no title, no theme.  You should not be able to see the shape of the road ahead.
 */
export default function PuzzleIndex() {
  const [reach, setReach] = useState(1);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const read = () => {
      const s = loadState();
      setReach(furthestUnlocked(s, CHAPTER_IDS));
      setSolved(CHAPTER_IDS.map((id) => isSolved(s, id)));
    };
    read();
    window.addEventListener('zosia:state', read);
    return () => window.removeEventListener('zosia:state', read);
  }, []);

  const download = () => {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zosia-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-10 sm:px-8 lg:pt-16">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
        >
          ← Title
        </Link>
        <ProgressIndicator />
      </header>

      <h1 className="mt-16 font-serif text-[clamp(2rem,6vw,3rem)] font-light tracking-tight text-parchment">
        Contents
      </h1>

      <ol className="mt-12">
        {CHAPTERS.map((c) => {
          const open = c.order <= reach;
          const done = solved[c.order - 1];
          if (!open) {
            return (
              <li
                key={c.id}
                className="flex items-center gap-6 border-b border-ink-700/60 py-6 text-ink-500"
              >
                <span className="font-mono text-[12px] tracking-widest2">{c.numeral}</span>
                <span aria-hidden className="h-px flex-1 bg-ink-700/60" />
                <span className="font-mono text-[10px] uppercase tracking-widest2">sealed</span>
              </li>
            );
          }
          return (
            <li key={c.id} className="border-b border-ink-700/60">
              <Link
                href={`/puzzle/${c.slug}/`}
                className="group flex items-baseline gap-6 py-6 transition-colors"
              >
                <span className="font-mono text-[12px] tracking-widest2 text-steel-dim">
                  {c.numeral}
                </span>
                <span className="flex-1">
                  <span className="block font-serif text-[24px] font-light text-parchment transition-colors group-hover:text-signal">
                    {c.title}
                  </span>
                  {c.theme !== '—' && (
                    <span className="mt-1 block font-serif text-[16px] italic text-haze">
                      {c.theme}
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
                  {done ? 'closed' : 'open'}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <section className="mt-20 border-t border-ink-700 pt-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <button
            type="button"
            onClick={download}
            className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
          >
            Export progress
          </button>
          {confirmReset ? (
            <span className="flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-haze">
                Erase everything?
              </span>
              <button
                type="button"
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                }}
                className="font-mono text-[10px] uppercase tracking-widest2 text-steel underline underline-offset-4"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500"
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
            >
              Start over
            </button>
          )}
        </div>
        <p className="mt-4 max-w-prose font-mono text-[11px] leading-relaxed text-ink-500/80">
          Progress is kept in this browser only. Nothing is sent anywhere, and nothing here
          knows who you are.
        </p>
      </section>
    </main>
  );
}
