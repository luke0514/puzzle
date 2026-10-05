'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { chapterByOrder } from '@/chapters/registry';
import { normalise, verifyAnswer } from '@/lib/crypto';
import { chapterOf, loadState, mutate } from '@/lib/puzzleState';

type Status = 'idle' | 'checking' | 'wrong' | 'right';

/**
 * The answer field.  Submitting hashes the normalised input and compares it with the
 * digest baked into the bundle; nothing is ever sent anywhere, and the correct answer
 * is never present in plaintext for the failure path to leak.
 *
 * A wrong answer is not scolded.  It just does not open.
 */
export default function PuzzleInput({
  chapterId,
  order,
  answerHash,
  placeholder,
  onSolved,
}: {
  chapterId: string;
  order: number;
  answerHash: string;
  placeholder: string;
  onSolved?: (answer: string) => void;
}) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // The "Not that." message clears itself after a moment.  If the next answer is
  // correct before that timer fires, the timer would reset the state out from under
  // the success screen — so it is always cancelled first.
  const resetTimer = useRef<number | null>(null);
  const router = useRouter();
  const next = chapterByOrder(order + 1);

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  useEffect(() => {
    const c = chapterOf(loadState(), chapterId);
    setAlreadySolved(Boolean(c.solvedAt));
    setAttempts(c.attempts);
  }, [chapterId]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!normalise(value) || status === 'checking') return;
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
      setStatus('checking');
      // A short, constant pause: it reads as deliberation rather than as a lookup,
      // and it takes the twitchiness out of guessing.
      await new Promise((r) => setTimeout(r, 420));
      const ok = await verifyAnswer(chapterId, value, answerHash);
      if (ok) {
        mutate(chapterId, (c) => {
          c.solvedAt = c.solvedAt ?? Date.now();
          c.answer = normalise(value);
          c.typed = value.trim().replace(/\s+/g, ' ');
        });
        setStatus('right');
        setAlreadySolved(true);
        onSolved?.(normalise(value));
      } else {
        mutate(chapterId, (c) => {
          c.attempts += 1;
        });
        setAttempts((a) => a + 1);
        setStatus('wrong');
        resetTimer.current = window.setTimeout(() => setStatus('idle'), 1600);
      }
    },
    [answerHash, chapterId, onSolved, status, value],
  );

  if (alreadySolved && status !== 'right') {
    return (
      <div className="mt-12 border-t border-ink-600 pt-6">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-steel-dim">Answered</p>
        {next && (
          <Link
            href={`/puzzle/${next.slug}/`}
            className="mt-3 inline-block font-mono text-[12px] uppercase tracking-widest2 text-steel underline underline-offset-[6px] hover:text-signal"
          >
            Continue to {next.numeral}
          </Link>
        )}
      </div>
    );
  }

  if (status === 'right') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 border-t border-ink-600 pt-8"
      >
        <p className="font-serif text-[22px] italic text-signal">Yes.</p>
        {next ? (
          <button
            type="button"
            onClick={() => router.push(`/puzzle/${next.slug}/`)}
            className="mt-5 border border-ink-600 px-6 py-3 font-mono text-[11px] uppercase tracking-widest2 text-steel transition-colors hover:border-steel-dim hover:text-signal"
          >
            Chapter {next.numeral} — {next.title}
          </button>
        ) : null}
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-12 border-t border-ink-600 pt-6">
      <label
        htmlFor={`answer-${chapterId}`}
        className="block font-mono text-[11px] uppercase tracking-widest2 text-haze"
      >
        Answer
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          id={`answer-${chapterId}`}
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-describedby={`answer-note-${chapterId}`}
          className={`w-full flex-1 border bg-ink-850/60 px-4 py-3 font-mono text-[15px] tracking-[0.14em] text-parchment placeholder:text-ink-500 focus:outline-none ${
            status === 'wrong' ? 'border-steel-dim/70' : 'border-ink-600 focus:border-steel-dim'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'checking'}
          className="shrink-0 border border-ink-600 px-7 py-3 font-mono text-[11px] uppercase tracking-widest2 text-haze transition-colors hover:border-steel-dim hover:text-signal disabled:opacity-40"
        >
          {status === 'checking' ? '···' : 'Submit'}
        </button>
      </div>
      <p
        id={`answer-note-${chapterId}`}
        aria-live="polite"
        className="mt-3 min-h-[1.25rem] font-mono text-[11px] text-ink-500"
      >
        {status === 'wrong' ? (
          <span className="text-haze">Not that.</span>
        ) : (
          <>Spacing, case and diacritics are ignored.{attempts > 0 && ` ${attempts} tried.`}</>
        )}
      </p>
    </form>
  );
}
