'use client';

import ChapterLayout, { Aside, Epigraph, Panel } from '@/components/ChapterLayout';
import CurveWorkbench, { VigenereDecoder } from '@/components/CurveWorkbench';
import EllipticCurveVisualizer from '@/components/EllipticCurveVisualizer';
import MathBlock, { M } from '@/components/MathBlock';
import { CHAPTERS } from '@/chapters/registry';
import { CURVE } from '@/data/chapter05';

const meta = CHAPTERS[4];

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-ink-700/40 py-2 last:border-b-0 sm:flex-row sm:gap-6">
      <span className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-widest2 text-ink-500">
        {k}
      </span>
      <span className="tnum break-all font-mono text-[13px] text-parchment/85">{v}</span>
    </div>
  );
}

export default function Chapter05() {
  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        The plane is a lie we draw on paper,
        <br />
        because paper is flat.
      </Epigraph>

      <p>
        An elliptic curve is the set of points satisfying one cubic equation. Over a finite field
        it stops looking like a curve at all — it is a scatter of points — but it keeps a strange
        and beautiful property: you can <em>add</em> two points and get a third.
      </p>

      <MathBlock display>
        {'E: y^{2} \\equiv x^{3} + ax + b \\pmod p'}
      </MathBlock>

      <p>
        Draw a line through two points; it meets the curve exactly once more; reflect that point
        and you have their sum. Add a point <M>{'G'}</M> to itself <M>{'k'}</M> times and you
        land on <M>{'Q = kG'}</M>. Going forwards is easy. Going backwards — given{' '}
        <M>{'G'}</M> and <M>{'Q'}</M>, find <M>{'k'}</M> — is the problem that secures most of the
        encrypted traffic on the internet today.
      </p>

      <EllipticCurveVisualizer />

      <div className="rule my-12" />

      <Panel title="Domain parameters" note="49-bit prime field">
        <Row k="p" v={CURVE.p} />
        <Row k="a" v={CURVE.a} />
        <Row k="b" v={CURVE.b} />
        <Row k="G" v={`(${CURVE.G.x}, ${CURVE.G.y})`} />
        <Row k="Q" v={`(${CURVE.Q.x}, ${CURVE.Q.y})`} />
      </Panel>

      <p>
        This curve was not well chosen. Keep adding <M>{'G'}</M> to itself and you eventually
        come back to where you started; the number of steps that takes is the <em>order</em> of{' '}
        <M>{'G'}</M>. If that number breaks into small prime factors, the one hard logarithm
        breaks into several tiny ones, each solvable in an instant — and then glued back
        together. That is the whole attack.
      </p>

      <CurveWorkbench />

      <Aside>
        k is not the answer. It is a key. Nineteen letters were enciphered with it, using the
        oldest polyalphabetic cipher there is: each letter is shifted back by the matching letter
        of the key, the key repeating as often as it needs to.
      </Aside>

      <VigenereDecoder ciphertext={CURVE.ciphertext} />

      <p className="!mb-0">
        Four words. The curve on paper is flat. The thing it describes is not.
      </p>
    </ChapterLayout>
  );
}
