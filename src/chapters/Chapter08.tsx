'use client';

import ChapterLayout, { Aside, Epigraph, Panel } from '@/components/ChapterLayout';
import EnigmaMachine from '@/components/EnigmaMachine';
import Notebook from '@/components/Notebook';
import { CHAPTERS } from '@/chapters/registry';
import { INTERCEPT } from '@/data/chapter08';

const meta = CHAPTERS[7];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function Chapter08() {
  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        Anyone can turn the wheels.
        <br />
        Knowing where to start is the whole problem.
      </Epigraph>

      <p>
        The machine below is real. Enigma I, as the German army used it: three wheels chosen from
        five, a reflector, a ring setting on each wheel, a starting position for each wheel, and a
        plugboard. Press a key and the wheels turn, so the same letter never comes out the same
        way twice in a row.
      </p>

      <Panel title="Key sheet fragment" note="recovered — partial">
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 font-mono text-[13px]">
          <dt className="text-ink-500">Umkehrwalze</dt>
          <dd className="text-parchment/85">{INTERCEPT.reflector}</dd>
          <dt className="text-ink-500">Steckerbrett</dt>
          <dd className="tracking-[0.14em] text-parchment/85">{INTERCEPT.plugboard}</dd>
          <dt className="text-ink-500">Walzenlage</dt>
          <dd className="text-haze">— torn — <span className="text-ink-500">see chapter 01</span></dd>
          <dt className="text-ink-500">Ringstellung</dt>
          <dd className="text-haze">— torn — <span className="text-ink-500">see chapter 02</span></dd>
          <dt className="text-ink-500">Grundstellung</dt>
          <dd className="text-haze">— torn — <span className="text-ink-500">see chapter 03</span></dd>
        </dl>
      </Panel>

      <Panel title="Intercept" note={`${INTERCEPT.length} letters`}>
        <p className="break-all font-mono text-[clamp(14px,4vw,19px)] leading-relaxed tracking-[0.24em] text-signal">
          {INTERCEPT.ciphertext}
        </p>
      </Panel>

      <p>
        Three lines of the key sheet are gone. Searching for them blindly would mean trying about
        a trillion configurations. You do not have to: all three were written down before you
        ever arrived here, in the sentences you recovered from the first three chapters.
      </p>

      <Notebook orders={[1, 2, 3]} />

      <Panel title="How to rebuild the key sheet" note="from the three sentences above">
        <ol className="space-y-4 font-mono text-[12.5px] leading-relaxed text-parchment/85">
          <li>
            <span className="text-steel">Ringstellung</span> — the first three <em>different</em>{' '}
            letters of chapter 02&rsquo;s sentence, exactly as they are.
          </li>
          <li>
            <span className="text-steel">Grundstellung</span> — the first three different letters
            of chapter 03&rsquo;s sentence, exactly as they are.
          </li>
          <li>
            <span className="text-steel">Walzenlage</span> — the first three different letters of
            chapter 01&rsquo;s sentence, turned into wheel numbers. There are only five wheels
            (I to V), so for each letter: take its place in the alphabet counting from{' '}
            <em>one</em> (A = 1), divide by 5 and keep the remainder, then add 1. Left wheel
            first.
          </li>
        </ol>
        <div
          className="mt-5 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-px overflow-hidden border border-ink-700 bg-ink-700 text-center font-mono"
          aria-label="The alphabet numbered from one"
        >
          {ALPHABET.split('').map((l, i) => (
            <div key={l} className="bg-ink-900/70 py-1">
              <div className="text-[12px] text-parchment/85">{l}</div>
              <div className="tnum text-[9px] text-ink-500">{i + 1}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-500">
          Example, with a letter that is not one of yours: S = 19 → 19 ÷ 5 leaves 4 → 4 + 1 = 5 → wheel V.
        </p>
      </Panel>

      <EnigmaMachine />

      <Aside>
        The machine is reciprocal, so there is no separate decrypt mode — set the wheels, rings
        and starting letters, leave the intercept in the input, and the plaintext comes out. If
        any setting is wrong you get twenty-four letters of noise: there is no partial credit and
        no &ldquo;warmer&rdquo;. Check each one against the rules above.
      </Aside>

      <p className="!mb-0">
        Six words come out, and they are not about the machine.
      </p>
    </ChapterLayout>
  );
}
