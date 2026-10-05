'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ChapterMeta } from '@/chapters/registry';
import HintSystem from '@/components/HintSystem';
import ProgressIndicator from '@/components/ProgressIndicator';
import PuzzleInput from '@/components/PuzzleInput';
import { CHAPTER_IDS } from '@/chapters/registry';
import { isUnlocked, loadState, markOpened } from '@/lib/puzzleState';

/**
 * The frame every chapter sits in: masthead, body, answer field, hints.
 * Also the lock — a chapter you have not reached renders a closed door instead of
 * its content, so its data never enters the DOM at all.
 */
export default function ChapterLayout({
  meta,
  children,
  hideAnswer = false,
  hideHints = false,
}: {
  meta: ChapterMeta;
  children: React.ReactNode;
  hideAnswer?: boolean;
  /** The last chapter closes this once the text is open; nothing there needs a hint. */
  hideHints?: boolean;
}) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const state = loadState();
    const open = isUnlocked(state, meta.order, CHAPTER_IDS);
    setUnlocked(open);
    if (open) markOpened(meta.id);
  }, [meta.id, meta.order]);

  if (unlocked === null) {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest3 text-ink-500">
          {meta.numeral}
        </p>
        <p className="mt-8 font-serif text-[26px] italic leading-snug text-haze">
          This one is not open yet.
        </p>
        <p className="mt-4 max-w-sm font-mono text-[12px] leading-relaxed text-ink-500">
          Doors here open in order. There is no way around, and there is no hurry.
        </p>
        <Link
          href="/puzzle/"
          className="mt-10 font-mono text-[11px] uppercase tracking-widest2 text-steel-dim underline underline-offset-[6px] hover:text-steel"
        >
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-10 sm:px-8 lg:pt-16">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <Link
          href="/puzzle/"
          className="font-mono text-[11px] uppercase tracking-widest2 text-ink-500 transition-colors hover:text-haze"
        >
          ← Index
        </Link>
        <ProgressIndicator current={meta.order} />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mt-16">
          <p className="font-mono text-[11px] tracking-widest3 text-steel-dim">
            CHAPTER {meta.numeral}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2rem,6vw,3.4rem)] font-light leading-[1.05] tracking-tight text-parchment">
            {meta.title}
          </h1>
          {meta.theme !== '—' && (
            <p className="mt-4 font-serif text-[19px] italic text-haze">{meta.theme}</p>
          )}
          {meta.dependsOn && meta.dependsOn.length > 0 && (
            <p className="mt-6 font-mono text-[11px] text-ink-500">
              Requires what you took from{' '}
              {meta.dependsOn.map((d) => String(d).padStart(2, '0')).join(', ')}.
            </p>
          )}
        </div>

        <div className="rule mt-10" />

        <div className="doc mt-12 font-serif text-[19px] leading-[1.75] text-parchment/90">
          {children}
        </div>

        {!hideAnswer && (
          <PuzzleInput
            chapterId={meta.id}
            order={meta.order}
            answerHash={meta.answerHash}
            placeholder={meta.placeholder}
          />
        )}

        {!hideHints && <HintSystem chapterId={meta.id} hints={meta.hints} />}
      </motion.div>
    </main>
  );
}

/** Small shared pieces the chapter bodies use, kept here so they stay consistent. */

export function Epigraph({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l border-ink-600 pl-6 font-serif text-[21px] italic leading-relaxed text-haze">
      {children}
    </blockquote>
  );
}

export function Panel({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40">
      <div className="flex items-baseline justify-between border-b border-ink-700 px-5 py-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">{title}</h2>
        {note && <span className="font-mono text-[10px] text-ink-500">{note}</span>}
      </div>
      <div className="overflow-x-auto px-5 py-5">{children}</div>
    </section>
  );
}

export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-8 font-mono text-[12px] leading-relaxed text-haze/80">{children}</p>
  );
}
