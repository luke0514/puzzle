'use client';

import { useState } from 'react';
import ChapterLayout, { Aside, Epigraph } from '@/components/ChapterLayout';
import ArchiveViewer, { ConcordanceCard, Lens, type Target } from '@/components/ArchiveViewer';
import { CHAPTERS } from '@/chapters/registry';
import { ARCHIVE, CONCORDANCE } from '@/data/archive';

const meta = CHAPTERS[8];

const wordCount = ARCHIVE.reduce(
  (n, f) => n + f.lines.reduce((m, l) => m + l.split(/\s+/).filter(Boolean).length, 0),
  0,
);
const lineCount = ARCHIVE.reduce((n, f) => n + f.lines.length, 0);

export default function Chapter09() {
  const [open, setOpen] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(() => new Set());
  const [highlight, setHighlight] = useState<Target | null>(null);

  const pick = (i: number) => {
    const c = CONCORDANCE[i];
    setSelected(i);
    setVisited((v) => new Set(v).add(i));
    setHighlight({ folio: c.folio, line: c.line, word: c.word });
    const idx = ARCHIVE.findIndex((f) => f.code === c.folio);
    if (idx >= 0) setOpen(idx);
  };

  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        The archive is not the puzzle.
        <br />
        The card is the puzzle.
      </Epigraph>

      <p>
        Fourteen folios: {wordCount.toLocaleString('en-US')} words over {lineCount} numbered
        lines. Working notes, a research diary, two tables kept for reference, and a certain
        amount of argument with myself. Every folio is about something you have already had to
        do, and you are welcome to read them — but none of it is the answer.
      </p>

      <p>
        A book cipher does not encrypt. It <em>points</em>. The text is public, the pointing is
        unambiguous, and the only secret is which coordinates somebody chose to write down.
      </p>

      <ArchiveViewer open={open} onOpen={setOpen} highlight={highlight} />

      <p>
        Loose in the same folder was this card. Twenty-six entries, each one three numbers:
        which folio, which line, which word — all counted from one, exactly as printed.
      </p>

      <ConcordanceCard selected={selected} visited={visited} onPick={pick} />

      <Lens index={selected} />

      <Aside>
        Three numbers find a word. To get a single letter out of a word you would need a fourth
        number — which letter — and the card does not give one, because it is the same for every
        entry: the very first. One word, one first letter, twenty-six times, in the order the
        card lists them.
      </Aside>

      <p>
        Keep a pencil handy, or a note on your phone. Work down the card in order and write each
        first letter as you find it; the entries you have already looked up turn a different
        colour, so you will not lose your place.
      </p>

      <p className="!mb-0">
        What comes out is five words. It is a sentence, and it is also an instruction, and the
        thing it instructs you to do is the last thing this puzzle asks of you.
      </p>
    </ChapterLayout>
  );
}
