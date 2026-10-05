'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CHAPTER_IDS, chapterByOrder } from '@/chapters/registry';
import { furthestUnlocked, loadState } from '@/lib/puzzleState';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Landing() {
  const [resume, setResume] = useState<{ slug: string; numeral: string } | null>(null);

  useEffect(() => {
    const n = furthestUnlocked(loadState(), CHAPTER_IDS);
    if (n > 1) {
      const c = chapterByOrder(n);
      if (c) setResume({ slug: c.slug, numeral: c.numeral });
    }
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease }}
        className="font-mono text-[12px] tracking-widest3 text-steel-dim"
      >
        001
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.25, ease }}
        className="mt-10 text-center font-serif font-light leading-[0.92] tracking-[-0.02em] text-parchment"
        style={{ fontSize: 'clamp(2.6rem, 11vw, 6.5rem)' }}
      >
        A&nbsp;PUZZLE
        <br />
        FOR&nbsp;ZOSIA
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.9, ease }}
        className="mt-12 max-w-md text-center font-serif text-[19px] italic leading-relaxed text-haze"
      >
        Somewhere inside this puzzle, there is something meant only for you.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.35, ease }}
        className="mt-9 text-center font-mono text-[12px] leading-[2] tracking-wide text-ink-500"
      >
        There is no time limit.
        <br />
        Every answer leads somewhere.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.9, ease }}
        className="mt-16 flex flex-col items-center gap-5"
      >
        <Link
          href={resume ? `/puzzle/${resume.slug}/` : '/puzzle/the-beginning/'}
          className="group relative border border-ink-600 px-14 py-4 font-mono text-[11px] uppercase tracking-widest3 text-haze transition-all duration-500 hover:border-steel-dim hover:text-signal"
        >
          {resume ? 'Continue' : 'Begin'}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: '0 0 40px -14px rgba(143,168,196,0.5) inset' }}
          />
        </Link>
        {resume && (
          <Link
            href="/puzzle/"
            className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
          >
            index — you are at {resume.numeral}
          </Link>
        )}
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 2.6, ease }}
        className="absolute bottom-10 text-center font-mono text-[10px] leading-[2.2] tracking-widest2 text-ink-500/80"
      >
        CREATED FOR ONE.
        <br />
        SOLVED BY ONE.
      </motion.footer>
    </main>
  );
}
