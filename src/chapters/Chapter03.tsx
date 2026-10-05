'use client';

import ChapterLayout, { Aside, Epigraph, Panel } from '@/components/ChapterLayout';
import MathBlock, { M } from '@/components/MathBlock';
import RsaWorkbench from '@/components/RsaWorkbench';
import { CHAPTERS } from '@/chapters/registry';
import { RSA } from '@/data/chapter03';
import { asset } from '@/lib/paths';

const meta = CHAPTERS[2];

/** Break a very long integer into readable groups without letting it widen the page. */
function Digits({ value }: { value: string }) {
  const groups = value.match(/.{1,10}/g) ?? [value];
  return (
    <span className="tnum break-all font-mono text-[12px] leading-[1.9] text-parchment/85">
      {groups.map((g, i) => (
        <span key={`${g}-${i}`} className="mr-2 inline-block">
          {g}
        </span>
      ))}
    </span>
  );
}

export default function Chapter03() {
  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        The mathematics of RSA is sound.
        <br />
        The mathematics is not usually what fails.
      </Epigraph>

      <p>
        RSA in one breath: pick two large primes <M>{'p'}</M> and <M>{'q'}</M>, publish their
        product <M>{'n'}</M>, keep the primes secret. Anyone can lock a message with{' '}
        <M>{'n'}</M>; only someone who knows <M>{'p'}</M> and <M>{'q'}</M> can unlock it.
      </p>

      <MathBlock display>{'c \\equiv m^{e} \\pmod n , \\qquad e = 65537 .'}</MathBlock>

      <p>
        What follows is a real key and a real ciphertext — a 1024-bit modulus, the size that
        protected real traffic for years. Its security rests entirely on one assumption: that
        nobody can split <M>{'n'}</M> back into <M>{'p'}</M> and <M>{'q'}</M>. For two primes
        chosen at random, nobody can.
      </p>

      <Panel title="Public key" note="e = 65537 · 1024-bit modulus">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">n</div>
        <Digits value={RSA.n} />
      </Panel>

      <Panel title="Ciphertext" note="single block">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">c</div>
        <Digits value={RSA.c} />
      </Panel>

      <div className="my-10 flex flex-wrap gap-x-8 gap-y-3">
        <a
          href={asset('/puzzles/key-03.pub')}
          download
          className="font-mono text-[11px] uppercase tracking-widest2 text-steel underline underline-offset-[6px] hover:text-signal"
        >
          ↓ key-03.pub
        </a>
        <a
          href={asset('/puzzles/message-03.enc')}
          download
          className="font-mono text-[11px] uppercase tracking-widest2 text-steel underline underline-offset-[6px] hover:text-signal"
        >
          ↓ message-03.enc
        </a>
      </div>

      <div className="rule my-12" />

      <p>
        These two were not chosen at random. Whoever generated them took a shortcut, and the
        shortcut left the primes standing almost shoulder to shoulder. Two numbers that close
        together multiply to something that is <em>nearly a perfect square</em> — and a number
        that is nearly a square can be taken apart with an idea Fermat wrote in a letter in 1643.
      </p>

      <MathBlock display>{'n = a^{2} - b^{2} = (a-b)(a+b)'}</MathBlock>

      <p>
        Start at the square root of <M>{'n'}</M> and step upward until <M>{'a^2 - n'}</M> is
        itself a perfect square. When it is, you have both primes. Then the rest is the ordinary
        machinery of RSA, run by the person it was supposed to keep out.
      </p>

      <RsaWorkbench />

      <Aside>
        There is a second door, for later curiosity. The shortcut the key&rsquo;s owner took has
        its fingerprints on the first chapter of this puzzle: the smaller prime is simply the next
        prime after the golden ratio, written out to 511 binary places.
      </Aside>

      <p className="!mb-0">
        Five words fall out. They are a sentence about this key, and about a great many keys that
        are still in service.
      </p>
    </ChapterLayout>
  );
}
