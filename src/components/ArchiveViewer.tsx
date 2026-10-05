'use client';

import { useEffect, useRef } from 'react';
import { ARCHIVE, CONCORDANCE } from '@/data/archive';

/**
 * The archive reader, the concordance card, and (in the easier edition) the lens that
 * joins them.
 *
 * Lines are numbered from one, exactly as they are printed — that is a promise the
 * text itself makes in folio MS-M-13, and the whole chapter depends on it being kept.
 * A word is a whitespace-delimited run with its punctuation attached, also numbered
 * from one.  Hovering any word shows its number.
 */

export type Target = { folio: string; line: number; word: number };

/** Split a line into tokens, numbering the words (not the spaces) from one. */
function tokens(line: string): Array<{ text: string; word: number | null }> {
  let n = 0;
  return line
    .split(/(\s+)/)
    .filter((t) => t !== '')
    .map((t) => (/^\s+$/.test(t) ? { text: t, word: null } : { text: t, word: (n += 1) }));
}

function FolioText({
  lines,
  highlight,
}: {
  lines: string[];
  highlight?: { line: number; word: number } | null;
}) {
  return (
    <div className="font-serif text-[17.5px] leading-[1.95] text-parchment/90">
      {lines.map((line, li) => (
        <div
          key={`${li}-${line.slice(0, 12)}`}
          className="group flex gap-4"
          data-line={li + 1}
        >
          <span
            aria-hidden
            className={`tnum w-7 shrink-0 select-none pt-[3px] text-right font-mono text-[10px] ${
              highlight?.line === li + 1 ? 'text-signal' : 'text-ink-500'
            }`}
          >
            {li + 1}
          </span>
          <p className="min-w-0 flex-1 whitespace-pre-wrap break-words">
            {tokens(line).map((tok, ti) => {
              if (tok.word === null) return <span key={ti}>{tok.text}</span>;
              const hit = highlight?.line === li + 1 && highlight.word === tok.word;
              return (
                <span
                  key={ti}
                  className={`relative rounded-[2px] transition-colors ${
                    hit ? 'bg-steel/25 text-signal outline outline-1 outline-steel-dim' : 'hover:bg-steel/10'
                  }`}
                  title={`line ${li + 1}, word ${tok.word}`}
                >
                  {tok.text}
                </span>
              );
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ArchiveViewer({
  open,
  onOpen,
  highlight,
}: {
  open: number;
  onOpen: (i: number) => void;
  highlight?: Target | null;
}) {
  const folio = ARCHIVE[open];
  const scroller = useRef<HTMLDivElement | null>(null);
  const local = highlight && highlight.folio === folio.code ? highlight : null;

  // Bring the highlighted line into view inside the reader only — never scroll the page.
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    if (!local) {
      box.scrollTop = 0;
      return;
    }
    const row = box.querySelector<HTMLElement>(`[data-line="${local.line}"]`);
    if (row) box.scrollTop = Math.max(0, row.offsetTop - box.clientHeight / 3);
  }, [open, local]);

  return (
    <div className="my-10 border border-ink-600 bg-ink-850/40">
      <div className="grid gap-px bg-ink-700 lg:grid-cols-[15rem_1fr]">
        {/* ------------------------------------------------- shelf */}
        <nav aria-label="Folios" className="bg-ink-850/70">
          <p className="border-b border-ink-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
            Fourteen folios
          </p>
          <ul className="max-h-[560px] overflow-y-auto">
            {ARCHIVE.map((f, i) => (
              <li key={f.code}>
                <button
                  type="button"
                  onClick={() => onOpen(i)}
                  aria-current={i === open ? 'true' : undefined}
                  className={`block w-full border-b border-ink-700/50 px-4 py-3 text-left transition-colors ${
                    i === open ? 'bg-ink-800' : 'hover:bg-ink-800/50'
                  }`}
                >
                  <span
                    className={`block font-mono text-[10px] tracking-widest2 ${
                      i === open ? 'text-steel' : 'text-ink-500'
                    }`}
                  >
                    {f.code}
                  </span>
                  <span
                    className={`mt-1 block font-serif text-[15px] leading-snug ${
                      i === open ? 'text-parchment' : 'text-haze'
                    }`}
                  >
                    {f.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ------------------------------------------------- reader */}
        <article className="min-w-0 bg-ink-850/70">
          <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-6 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-widest2 text-steel-dim">{folio.code}</p>
              <h3 className="mt-1 font-serif text-[21px] font-light text-parchment">
                {folio.title}
              </h3>
            </div>
            <span className="font-mono text-[10px] text-ink-500">{folio.date}</span>
          </header>
          <div ref={scroller} className="relative max-h-[560px] overflow-y-auto px-6 py-6">
            <FolioText lines={folio.lines} highlight={local} />
          </div>
        </article>
      </div>
    </div>
  );
}

/** The loose card.  In the easier edition every entry can be clicked. */
export function ConcordanceCard({
  selected,
  visited,
  onPick,
}: {
  selected?: number | null;
  visited?: Set<number>;
  onPick?: (i: number) => void;
}) {
  return (
    <div className="my-10 border border-ink-600 bg-ink-850/40">
      <div className="flex items-baseline justify-between border-b border-ink-700 px-5 py-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Concordance — loose leaf, undated
        </h3>
        <span className="font-mono text-[10px] text-ink-500">
          {CONCORDANCE.length} entries{visited && visited.size > 0 ? ` · ${visited.size} looked up` : ''}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-[2px] px-4 py-4 font-mono text-[12.5px] sm:grid-cols-3 lg:grid-cols-4">
        {CONCORDANCE.map((c, i) => {
          const isSel = selected === i;
          const seen = visited?.has(i);
          return (
            <button
              key={`${c.folio}-${c.line}-${c.word}-${i}`}
              type="button"
              onClick={() => onPick?.(i)}
              aria-pressed={isSel}
              className={`tnum flex items-baseline gap-3 rounded-[2px] px-1 py-[3px] text-left transition-colors ${
                isSel ? 'bg-steel/15' : 'hover:bg-ink-800'
              }`}
            >
              <span className={`w-5 shrink-0 text-right text-[10px] ${seen ? 'text-steel' : 'text-ink-500'}`}>
                {i + 1}
              </span>
              <span className={isSel ? 'text-signal' : seen ? 'text-haze' : 'text-parchment/85'}>
                {c.folio}
                <span className="text-ink-500"> · </span>
                {c.line}
                <span className="text-ink-500"> · </span>
                {c.word}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The lens: one coordinate, followed to its line, with every word numbered. */
export function Lens({ index }: { index: number | null }) {
  if (index === null) {
    return (
      <div className="my-10 border border-dashed border-ink-600 px-5 py-6 font-mono text-[11px] text-ink-500">
        Click any entry on the card and it will be looked up for you — here, and in the reader
        above.
      </div>
    );
  }
  const c = CONCORDANCE[index];
  const folio = ARCHIVE.find((f) => f.code === c.folio);
  const line = folio?.lines[c.line - 1] ?? '';

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Entry {index + 1} — {c.folio} · line {c.line} · word {c.word}
        </h3>
        <span className="font-mono text-[10px] text-ink-500">{folio?.title}</span>
      </div>
      <p className="flex flex-wrap items-end gap-x-[0.45em] gap-y-2 px-5 py-5 font-serif text-[18px] text-parchment/85">
        {tokens(line)
          .filter((tok) => tok.word !== null)
          .map((tok) => {
            const hit = tok.word === c.word;
            return (
              <span key={tok.word} className="inline-flex flex-col items-center">
                <span
                  aria-hidden
                  className={`tnum font-mono text-[9px] leading-none ${hit ? 'text-signal' : 'text-ink-500'}`}
                >
                  {tok.word}
                </span>
                <span
                  data-lens-hit={hit ? '' : undefined}
                  className={`mt-1 leading-snug ${hit ? 'rounded-[2px] bg-steel/25 px-[3px] text-signal' : ''}`}
                >
                  {tok.text}
                </span>
              </span>
            );
          })}
      </p>
    </section>
  );
}
