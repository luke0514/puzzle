'use client';

import ChapterLayout, { Aside, Epigraph, Panel } from '@/components/ChapterLayout';
import MathBlock, { M } from '@/components/MathBlock';
import { CHAPTERS } from '@/chapters/registry';
import { SEARCH_LOG } from '@/data/chapter01';

const meta = CHAPTERS[0];

export default function Chapter01() {
  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        You may recognise the sequence.
        <br />
        That is not enough.
      </Epigraph>

      <p>
        Begin with the obvious. <M>{'F_0 = 0'}</M>, <M>{'F_1 = 1'}</M>, and thereafter
      </p>

      <MathBlock display>{'F_{n+2} = F_{n+1} + F_n .'}</MathBlock>

      <p>
        Everyone has seen this. Almost nobody has seen what it is. A recurrence of order two is
        a linear map applied over and over to a vector of the last two terms, and the map has a
        matrix:
      </p>

      <MathBlock display>{'A = \\begin{pmatrix} 1 & 1 \\\\ 1 & 0 \\end{pmatrix}'}</MathBlock>

      <p>
        The sequence is then not a list at all. It is a single object seen repeatedly from one
        angle, because
      </p>

      <MathBlock display>
        {'A^{n} = \\begin{pmatrix} F_{n+1} & F_{n} \\\\ F_{n} & F_{n-1} \\end{pmatrix}, \\qquad n \\ge 1 .'}
      </MathBlock>

      <p>
        Reduce every entry modulo a prime <M>{'p'}</M> and the map lands in{' '}
        <M>{'\\mathrm{GL}_2(\\F_p)'}</M>, a finite group. Finite things return. Two quantities
        measure how they return, and confusing them is the most common mistake in this subject:
      </p>

      <MathBlock display>
        {'\\alpha(p) = \\min\\{\\, n > 0 : F_n \\equiv 0 \\pmod p \\,\\}, \\qquad \\pi(p) = \\ord_{\\mathrm{GL}_2(\\F_p)}(A) .'}
      </MathBlock>

      <p>
        The first is the <em>rank of apparition</em>: where the prime first appears as a divisor.
        The second is the <em>Pisano period</em>: where the whole matrix comes home. Always{' '}
        <M>{'\\alpha(p) \\mid \\pi(p)'}</M>, and the quotient is <M>{'1'}</M>, <M>{'2'}</M> or{' '}
        <M>{'4'}</M> — never anything else. Always{' '}
        <M>{'\\alpha(p) \\mid p - \\left(\\tfrac{5}{p}\\right)'}</M>, by quadratic reciprocity,
        which is what makes either of them computable at all.
      </p>

      <div className="rule my-12" />

      <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest2 text-steel-dim">
        The search
      </h2>

      <p>
        A prime <M>{'p'}</M> is called a <em>Wall–Sun–Sun prime</em> if
      </p>

      <MathBlock display>{'A^{\\alpha(p)} \\equiv I \\pmod{p^{2}} ,'}</MathBlock>

      <p>
        equivalently if <M>{'p^{2} \\mid F_{\\alpha(p)}'}</M>. None is known. None has been found
        below <M>{'2^{64}'}</M>. Whether any exists is open, and I want to be completely clear
        that I have not settled it and that you are not being asked to.
      </p>

      <p>
        I searched anyway, the way one does. Fifteen candidates, chosen and tested one after
        another. Every one of them returned negative. The search failed.
      </p>

      <Aside>
        I have kept the log. Not because the conclusion is interesting — it is not, it is the
        conclusion everyone gets — but because I have never been able to throw away a record of
        the order in which I did something.
      </Aside>

      <Panel
        title="Search log — negative"
        note="fifteen candidates, listed in ascending p"
      >
        <table
          className="tnum w-full min-w-[30rem] border-collapse text-left font-mono text-[13px]"
          data-sorted-by="p"
        >
          <caption className="sr-only">
            Fifteen primes tested for the Wall–Sun–Sun condition, with the run number, the rank of
            apparition and the Pisano period of each.
          </caption>
          <thead>
            <tr className="border-b border-ink-700 text-[10px] uppercase tracking-widest2 text-ink-500">
              <th scope="col" className="py-2 pr-6 font-normal">
                run
              </th>
              <th scope="col" className="py-2 pr-6 font-normal">
                p
              </th>
              <th scope="col" className="py-2 pr-6 font-normal">
                α(p)
              </th>
              <th scope="col" className="py-2 pr-6 font-normal">
                π(p)
              </th>
              <th scope="col" className="py-2 font-normal">
                result
              </th>
            </tr>
          </thead>
          <tbody className="text-parchment/85">
            {SEARCH_LOG.map((r) => (
              <tr key={r.p} className="border-b border-ink-700/40 last:border-b-0">
                <td className="py-[7px] pr-6 text-steel-dim">{String(r.run).padStart(2, '0')}</td>
                <td className="py-[7px] pr-6">{r.p.toLocaleString('en-US')}</td>
                <td className="py-[7px] pr-6">{r.alpha.toLocaleString('en-US')}</td>
                <td className="py-[7px] pr-6">{r.pi.toLocaleString('en-US')}</td>
                <td className="py-[7px] text-ink-500">negative</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <p>
        Everything in that table is verifiable in a few lines of code, and I would rather you
        checked it than believed it. <M>{'\\alpha(p)'}</M> divides{' '}
        <M>{'p - \\left(\\tfrac{5}{p}\\right)'}</M> in every row.{' '}
        <M>{'\\pi(p)/\\alpha(p) \\in \\{1,2,4\\}'}</M> in every row. The fifteenth row is as
        negative as the first.
      </p>

      <p>
        So the answer to the question I asked is: <em>no such prime here</em>. That is the whole
        of what the search established, and it is worth exactly nothing.
      </p>

      <p className="!mb-0">
        What the search <em>produced</em> is a different matter, and it is four words long.
      </p>
    </ChapterLayout>
  );
}
