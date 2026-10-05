'use client';

import ChapterLayout, { Aside, Epigraph } from '@/components/ChapterLayout';
import PlateReader from '@/components/PlateReader';
import { CHAPTERS } from '@/chapters/registry';
import { asset } from '@/lib/paths';

const meta = CHAPTERS[5];

export default function Chapter06() {
  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        People read the photograph.
        <br />
        Almost nobody reads the file.
      </Epigraph>

      <p>
        This is plate VII. It is a night sky: fifteen hundred stars, a survey grid, four
        registration marks at the corners. There is nothing wrong with it and there is nothing
        clever in it. It is a picture of nothing in particular.
      </p>

      <figure className="my-10">
        <img
          src={asset('/puzzles/plate-vii.png')}
          alt="An astrometric plate: a dark night sky scattered with stars, overlaid with a faint survey grid and four corner registration marks."
          width={1400}
          height={900}
          className="w-full border border-ink-600"
          loading="lazy"
        />
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
          <span>plate VII — 1400 × 900, PNG, 24-bit</span>
          <a
            href={asset('/puzzles/plate-vii.png')}
            download
            className="text-steel underline underline-offset-[6px] hover:text-signal"
          >
            ↓ download the original
          </a>
        </figcaption>
      </figure>

      <p>
        An image is a very large list of numbers wearing a picture. Every pixel is three numbers
        — how much red, how much green, how much blue — and every one of those numbers is eight
        bits. Change the <em>last</em> of those eight bits and the colour shifts by one part in
        two hundred and fifty-six. No eye on earth can see that. So the last bit of every pixel
        is a place to hide things: one bit per pixel, eight pixels to a letter.
      </p>

      <PlateReader />

      <Aside>
        Read the text inside the file before you start flipping switches. It is not the answer.
        One field is a fraction — one bit out of every eight — and two of them are pointing at a
        chapter you have not reached yet. Then there are only three channels to try.
      </Aside>

      <p>
        What comes out is a sentence, and it is not in English. Leave it in the language it is in
        — the diacritics are correct and they are part of the answer. Type it however your
        keyboard allows; accents and spacing are ignored when it is checked.
      </p>

      <p className="!mb-0">
        It is four words. It is a statement of fact, and it is where this puzzle stops being
        about mathematics in the abstract.
      </p>
    </ChapterLayout>
  );
}
