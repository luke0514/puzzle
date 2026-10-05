'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CHAPTERS, CHAPTER_IDS } from '@/chapters/registry';
import { loadState, isSolved, furthestUnlocked } from '@/lib/puzzleState';

/**
 * The row of dots.  Deliberately unlabelled: a solved chapter is filled, the chapter
 * you can reach is ringed, everything beyond is a bare dot.  Reachable chapters are
 * links; the rest are inert and carry no title text, because a tooltip listing ten
 * chapter names would give away the shape of the whole thing on the first page.
 */
export default function ProgressIndicator({ current }: { current?: number }) {
  const [solved, setSolved] = useState<boolean[]>(() => CHAPTER_IDS.map(() => false));
  const [reach, setReach] = useState(1);

  useEffect(() => {
    const read = () => {
      const s = loadState();
      setSolved(CHAPTER_IDS.map((id) => isSolved(s, id)));
      setReach(furthestUnlocked(s, CHAPTER_IDS));
    };
    read();
    window.addEventListener('zosia:state', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('zosia:state', read);
      window.removeEventListener('storage', read);
    };
  }, []);

  return (
    <nav
      aria-label="Chapters"
      className="flex select-none items-center gap-[0.4rem] font-mono text-[13px] text-haze"
    >
      <span aria-hidden className="text-ink-500">
        [
      </span>
      {CHAPTERS.map((c) => {
        const done = solved[c.order - 1];
        const open = c.order <= reach;
        const here = c.order === current;
        const glyph = done ? '●' : open ? '◉' : '○';
        const cls = here
          ? 'text-signal'
          : done
            ? 'text-steel'
            : open
              ? 'text-steel-dim'
              : 'text-ink-500';
        if (!open) {
          return (
            <span key={c.id} aria-hidden className={cls}>
              {glyph}
            </span>
          );
        }
        return (
          <Link
            key={c.id}
            href={`/puzzle/${c.slug}/`}
            className={`transition-colors hover:text-signal ${cls}`}
            aria-label={`Chapter ${c.numeral}${done ? ', solved' : ''}`}
            aria-current={here ? 'page' : undefined}
          >
            {glyph}
          </Link>
        );
      })}
      <span aria-hidden className="text-ink-500">
        ]
      </span>
    </nav>
  );
}
