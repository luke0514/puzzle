'use client';

import ChapterLayout, { Aside, Epigraph, Panel } from '@/components/ChapterLayout';
import CycleBuilder from '@/components/CycleBuilder';
import { CHAPTERS } from '@/chapters/registry';
import { INDICATORS } from '@/data/chapter07';

const meta = CHAPTERS[6];

export default function Chapter07() {
  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        The part everyone assumed was hopeless
        <br />
        turned out to be the part that did not matter.
      </Epigraph>

      <p>
        In the 1930s the German army enciphered its radio traffic on a machine that offered
        about <span className="tnum">1.6 × 10²⁰</span> possible settings. Britain and France
        had looked at it and filed it under impossible. Poland, with Germany on two sides of it,
        could not afford to.
      </p>

      <p>
        What follows is one day&rsquo;s traffic — {INDICATORS.length} six-letter groups, all sent
        from the same starting position. Each group is a three-letter key that the operator typed{' '}
        <em>twice</em>, because the procedure demanded it, because radio was unreliable and a
        garbled key wasted a whole message. That repetition was the crack in the wall.
      </p>

      <Panel title="Intercepts" note={`${INDICATORS.length} groups, one ground setting`}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-[5px] font-mono text-[13px] tracking-[0.18em] text-parchment/85 sm:grid-cols-3 md:grid-cols-4">
          {INDICATORS.map((g, i) => (
            <div key={`${g}-${i}`} className="flex items-baseline gap-3">
              <span className="tnum w-6 shrink-0 text-right text-[10px] tracking-normal text-ink-500">
                {i + 1}
              </span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      </Panel>

      <CycleBuilder />

      <p>
        The plugboard — the tangle of cables at the front of the machine — supplied almost all of
        those settings. And it turns out to be powerless here: it can shuffle which letters sit in
        which cycle, but it cannot change <em>how long</em> the cycles are. Those lengths depend
        only on the wheels. So a mathematician could catalogue the lengths for every wheel
        position, once, and then simply look the day&rsquo;s traffic up.
      </p>

      <Aside>
        Roughly 10¹⁴ plugboard settings, and none of them touch the numbers you just saw. The
        wheels have nowhere left to hide.
      </Aside>

      <div className="rule my-12" />

      <p>
        The man who noticed this was twenty-seven. He had studied mathematics at Poznań, had been
        recruited out of a secret cryptology course for students who spoke German, and was given
        the problem in the autumn of 1932. He solved it in about ten weeks, with permutation
        theory and a stolen key sheet, and then his colleagues built machines to do it faster.
      </p>

      <p>
        Their work went to Paris and to London in July 1939, five weeks before the invasion, and
        everything that happened afterwards at Bletchley Park started from it. His name was Marian
        Rejewski.
      </p>

      <p className="!mb-0">
        You are not being asked for his name. You are being asked for the name of the machine he
        broke — six letters, painted on its lid, and almost certainly a word you already know.
      </p>
    </ChapterLayout>
  );
}
