'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChapterLayout from '@/components/ChapterLayout';
import Notebook from '@/components/Notebook';
import { CHAPTERS, CHAPTER_IDS } from '@/chapters/registry';
import { SEALED } from '@/data/sealed';
import { normalise, unseal, verifyAnswer } from '@/lib/crypto';
import { chapterOf, loadState, mutate, saveState } from '@/lib/puzzleState';

const meta = CHAPTERS[9];
const ease = [0.16, 1, 0.3, 1] as const;

type Phase = 'overture' | 'asking' | 'opening' | 'revealed' | 'answered';

/** The three sentences, then the paragraph.  Each waits for the one before it. */
const OVERTURE = [
  'There is no final equation.',
  'There is no final cipher.',
  'There is only one question.',
];

const PREAMBLE = [
  'You have followed numbers.',
  'Broken keys.',
  'Looked where nothing seemed to exist.',
  'Learned things you never needed to learn.',
  'And somehow…',
  'you are still here.',
];

export default function Chapter10() {
  const [phase, setPhase] = useState<Phase>('overture');
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'wrong'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[] | null>(null);
  const [manual, setManual] = useState<string[]>(Array(9).fill(''));
  const [reply, setReply] = useState<'tak' | 'nie' | null>(null);
  const resetTimer = useRef<number | null>(null);
  const reduced = useReducedMotion();

  // ---------------------------------------------------------------- overture
  useEffect(() => {
    if (phase !== 'overture') return undefined;
    const total = OVERTURE.length + PREAMBLE.length;
    if (step >= total) {
      const t = window.setTimeout(() => setPhase('asking'), reduced ? 300 : 2600);
      return () => window.clearTimeout(t);
    }
    const delay = reduced ? 220 : step < OVERTURE.length ? 2100 : 1250;
    const t = window.setTimeout(() => setStep((s) => s + 1), delay);
    return () => window.clearTimeout(t);
  }, [phase, step, reduced]);

  useEffect(() => {
    const s = loadState();
    const gaps = CHAPTER_IDS.slice(0, 9).filter((id) => !chapterOf(s, id).answer);
    setMissing(gaps.length ? gaps : null);
  }, []);

  // ---------------------------------------------------------------- unsealing
  const attempt = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!normalise(value) || status === 'checking') return;
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
      setStatus('checking');
      await new Promise((r) => setTimeout(r, 500));

      const ok = await verifyAnswer('ch10', value, meta.answerHash);
      if (!ok) {
        mutate('ch10', (c) => {
          c.attempts += 1;
        });
        setStatus('wrong');
        resetTimer.current = window.setTimeout(() => setStatus('idle'), 1800);
        return;
      }

      const state = loadState();
      const stored = CHAPTER_IDS.slice(0, 9).map((id) => chapterOf(state, id).answer ?? '');
      const answers = stored.every(Boolean) ? stored : manual.map(normalise);
      const text = await unseal(SEALED, answers, value);
      if (!text) {
        setStatus('wrong');
        resetTimer.current = window.setTimeout(() => setStatus('idle'), 1800);
        return;
      }

      mutate('ch10', (c) => {
        c.solvedAt = c.solvedAt ?? Date.now();
        c.answer = normalise(value);
      });
      const s2 = loadState();
      s2.finished = Date.now();
      saveState(s2);

      setMessage(text);
      setPhase('opening');
      window.setTimeout(() => setPhase('revealed'), reduced ? 400 : 3400);
    },
    [manual, reduced, status, value],
  );

  // already finished on a previous visit
  useEffect(() => {
    const s = loadState();
    if (s.finished && chapterOf(s, 'ch10').answer) {
      const stored = CHAPTER_IDS.slice(0, 9).map((id) => chapterOf(s, id).answer ?? '');
      if (stored.every(Boolean)) {
        unseal(SEALED, stored, chapterOf(s, 'ch10').answer as string).then((t) => {
          if (t) {
            setMessage(t);
            setPhase(s.reply ? 'answered' : 'revealed');
            setReply(s.reply ?? null);
          }
        });
      }
    }
  }, []);

  const choose = (r: 'tak' | 'nie') => {
    setReply(r);
    const s = loadState();
    s.reply = r;
    saveState(s);
    setPhase('answered');
  };

  return (
    <ChapterLayout
      meta={meta}
      hideAnswer
      hideHints={phase === 'opening' || phase === 'revealed' || phase === 'answered'}
    >
      {/* ------------------------------------------------------- overture */}
      {(phase === 'overture' || phase === 'asking') && (
        <div className="min-h-[16rem]">
          {OVERTURE.map((line, i) =>
            step > i ? (
              <motion.p
                key={line}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0.2 : 1.8, ease }}
                className="mb-6 font-serif text-[clamp(1.4rem,4vw,2rem)] font-light leading-snug text-parchment"
              >
                {line}
              </motion.p>
            ) : null,
          )}

          {step > OVERTURE.length && <div className="rule my-12" />}

          {PREAMBLE.map((line, i) =>
            step > OVERTURE.length + i ? (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.2 : 1.4, ease }}
                className="mb-2 font-serif text-[20px] leading-relaxed text-haze"
              >
                {line}
              </motion.p>
            ) : null,
          )}
        </div>
      )}

      {/* -------------------------------------------------------- the key */}
      {phase === 'asking' && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 2, delay: reduced ? 0 : 0.6, ease }}
          className="mt-16 border-t border-ink-600 pt-8"
        >
          <p className="mb-6 max-w-prose font-serif text-[19px] italic leading-relaxed text-haze">
            What is left is sealed, and it was sealed with everything you have already found.
            Nine sentences. Read only their beginnings.
          </p>
          <p className="mb-8 max-w-prose font-serif text-[18px] leading-relaxed text-parchment/85">
            Take the first letter of every word of all nine sentences, in chapter order — from
            the first word of chapter 01 to the last word of chapter 09 — and write them together
            with no spaces. Thirty-six letters.
          </p>

          {!missing && <Notebook orders={[1, 2, 3, 4, 5, 6, 7, 8, 9]} title="The nine sentences" />}

          {missing && (
            <div className="mb-8 border border-ink-600 bg-ink-850/50 p-5">
              <p className="mb-4 font-mono text-[11px] leading-relaxed text-haze">
                This browser is missing {missing.length} of the nine answers — a different device,
                or storage that was cleared. Type them back in and nothing is lost.
              </p>
              <div className="grid gap-2">
                {manual.map((m, i) => (
                  <input
                    key={CHAPTER_IDS[i]}
                    value={m}
                    onChange={(e) => {
                      const next = [...manual];
                      next[i] = e.target.value;
                      setManual(next);
                    }}
                    placeholder={`chapter ${String(i + 1).padStart(2, '0')}`}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full border border-ink-700 bg-ink-900/70 px-3 py-1.5 font-mono text-[12px] text-parchment placeholder:text-ink-500 focus:border-steel-dim focus:outline-none"
                  />
                ))}
              </div>
            </div>
          )}

          <form onSubmit={attempt}>
            <label
              htmlFor="final-key"
              className="block font-mono text-[11px] uppercase tracking-widest2 text-haze"
            >
              The key
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="final-key"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={meta.placeholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`w-full flex-1 border bg-ink-850/60 px-4 py-3 font-mono text-[15px] tracking-[0.16em] text-parchment placeholder:text-ink-500 focus:outline-none ${
                  status === 'wrong' ? 'border-steel-dim/70' : 'border-ink-600 focus:border-steel-dim'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'checking'}
                className="shrink-0 border border-ink-600 px-8 py-3 font-mono text-[11px] uppercase tracking-widest2 text-haze transition-colors hover:border-steel-dim hover:text-signal disabled:opacity-40"
              >
                {status === 'checking' ? '···' : 'Open'}
              </button>
            </div>
            <p aria-live="polite" className="mt-3 min-h-[1.25rem] font-mono text-[11px] text-ink-500">
              {status === 'wrong' ? (
                <span className="text-haze">Not that.</span>
              ) : normalise(value) ? (
                <span className={normalise(value).length === 36 ? 'text-steel' : ''}>
                  {normalise(value).length} / 36 letters
                </span>
              ) : null}
            </p>
          </form>
        </motion.section>
      )}

      {/* ------------------------------------------------------- the pause */}
      {phase === 'opening' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[22rem] items-center justify-center"
        >
          <motion.span
            animate={reduced ? {} : { opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="font-mono text-[11px] tracking-widest3 text-steel-dim"
          >
            ·
          </motion.span>
        </motion.div>
      )}

      {/* ------------------------------------------------------ the message */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'answered') && message && (
          <motion.section
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.25 : 3.2, ease }}
            className="py-8"
            lang="pl"
          >
            {message.split('\n').map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: reduced ? 0.2 : 2.4,
                  delay: reduced ? 0 : 0.8 + i * 1.5,
                  ease,
                }}
                className={
                  i === 3
                    ? 'mt-10 font-serif text-[clamp(1.5rem,4.4vw,2.2rem)] font-light leading-snug text-parchment'
                    : 'mb-3 font-serif text-[clamp(1.1rem,2.6vw,1.4rem)] font-light leading-relaxed text-haze'
                }
              >
                {line}
              </motion.p>
            ))}

            {phase === 'revealed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0.2 : 2, delay: reduced ? 0.1 : 7.5, ease }}
                className="mt-20 flex flex-wrap items-center gap-10"
              >
                <button
                  type="button"
                  onClick={() => choose('tak')}
                  className="border border-ink-600 px-12 py-4 font-serif text-[20px] tracking-[0.3em] text-parchment transition-colors hover:border-steel hover:text-signal"
                >
                  TAK
                </button>
                <EvasiveNo onChoose={() => choose('nie')} reduced={Boolean(reduced)} />
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------- the answer */}
      {phase === 'answered' && reply && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 2.2, ease }}
          className="mt-16 border-t border-ink-600 pt-10"
        >
          <p className="max-w-prose font-serif text-[clamp(1.2rem,3vw,1.6rem)] font-light leading-relaxed text-parchment">
            {reply === 'tak'
              ? 'Then perhaps this was the correct answer all along.'
              : 'Then the puzzle still gave me something worth keeping: you solved it.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setPhase('revealed');
              const s = loadState();
              delete s.reply;
              saveState(s);
              setReply(null);
            }}
            className="mt-10 font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
          >
            change your answer
          </button>
        </motion.div>
      )}
    </ChapterLayout>
  );
}

/**
 * NIE.
 *
 * It drifts a little when the pointer approaches, and now and then it forgets what it
 * is called.  It never runs away, it never becomes unclickable, and it never moves
 * under keyboard focus — because the joke stops being funny the moment it takes the
 * choice away, and the choice is hers.
 */
function EvasiveNo({ onChoose, reduced }: { onChoose: () => void; reduced: boolean }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState('NIE');
  const dodges = useRef(0);

  const wander = () => {
    if (reduced) return;
    dodges.current += 1;
    // it gets tired: after five it more or less settles down
    const amp = Math.max(0, 26 - dodges.current * 5);
    setOffset({ x: (Math.random() - 0.5) * amp * 2, y: (Math.random() - 0.5) * amp });
    const masks = ['¬TAK', '∅', 'Undefined', 'NIE?', '⊥'];
    setLabel(dodges.current % 3 === 0 ? masks[dodges.current % masks.length] : 'NIE');
  };

  return (
    <motion.button
      type="button"
      onMouseEnter={wander}
      onClick={onChoose}
      onFocus={() => setLabel('NIE')}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 210, damping: 17 }}
      aria-label="Nie"
      className="border border-ink-700 px-12 py-4 font-serif text-[20px] tracking-[0.3em] text-haze transition-colors hover:border-ink-600 hover:text-parchment"
    >
      {label}
    </motion.button>
  );
}
