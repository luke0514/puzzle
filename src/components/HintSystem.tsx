'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Hint } from '@/chapters/registry';
import { chapterOf, loadState, mutate } from '@/lib/puzzleState';

/**
 * Earned hints.
 *
 * A hint becomes "earned" after enough time on the chapter or enough wrong answers.
 * An unearned hint is still openable — it just says so first.  The one thing this
 * component will not do is take the choice away, because a puzzle that decides for
 * you how much help you deserve is not respecting you.
 */

const ROMAN = ['I', 'II', 'III', 'IV'];

function minutesOn(openedAt: number | undefined): number {
  if (!openedAt) return 0;
  return (Date.now() - openedAt) / 60000;
}

export default function HintSystem({ chapterId, hints }: { chapterId: string; hints: Hint[] }) {
  const [opened, setOpened] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const read = () => {
      const c = chapterOf(loadState(), chapterId);
      setOpened(c.hints);
      setAttempts(c.attempts);
      setElapsed(minutesOn(c.openedAt));
    };
    read();
    const t = window.setInterval(read, 20000);
    window.addEventListener('zosia:state', read);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('zosia:state', read);
    };
  }, [chapterId]);

  const earned = (h: Hint) => elapsed >= h.afterMinutes || attempts >= h.afterAttempts;

  const reveal = (level: number) => {
    mutate(chapterId, (c) => {
      if (!c.hints.includes(level)) c.hints.push(level);
    });
    setOpened((prev) => (prev.includes(level) ? prev : [...prev, level]));
    setConfirming(null);
  };

  return (
    <section aria-labelledby="hints-heading" className="mt-14">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="group flex w-full items-baseline justify-between border-t border-ink-600 pt-4 text-left"
      >
        <h2
          id="hints-heading"
          className="font-mono text-[11px] uppercase tracking-widest2 text-haze transition-colors group-hover:text-steel"
        >
          Assistance
        </h2>
        <span className="font-mono text-[11px] text-ink-500 transition-colors group-hover:text-haze">
          {opened.length > 0 ? `${opened.length}/4 opened` : 'closed'} {expanded ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-5 max-w-prose font-serif text-[17px] italic leading-relaxed text-haze">
              Some answers are more satisfying when discovered alone.
            </p>

            <ul className="mt-6 space-y-px">
              {hints.map((h, i) => {
                const isOpen = opened.includes(h.level);
                const ready = earned(h);
                return (
                  <li key={h.level} className="border-b border-ink-700/70 last:border-b-0">
                    {isOpen ? (
                      <div className="py-4">
                        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
                          Hint {ROMAN[i]}
                        </div>
                        <p className="max-w-prose font-serif text-[17px] leading-relaxed text-parchment/90">
                          {h.text}
                        </p>
                      </div>
                    ) : confirming === h.level ? (
                      <div className="py-4">
                        <p className="mb-3 max-w-prose font-serif text-[16px] italic text-haze">
                          {ready
                            ? 'This one is yours to open.'
                            : 'You have not been here very long. Open it anyway?'}
                        </p>
                        <div className="flex gap-5">
                          <button
                            type="button"
                            onClick={() => reveal(h.level)}
                            className="font-mono text-[11px] uppercase tracking-widest2 text-steel underline underline-offset-4 hover:text-signal"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirming(null)}
                            className="font-mono text-[11px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
                          >
                            Not yet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(h.level)}
                        className="flex w-full items-baseline justify-between py-4 text-left"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-widest2 text-haze hover:text-steel">
                          Hint {ROMAN[i]}
                        </span>
                        <span className="font-mono text-[10px] text-ink-500">
                          {ready ? 'available' : 'sealed'}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
