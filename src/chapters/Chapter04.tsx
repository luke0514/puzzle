'use client';

import { useState } from 'react';
import ChapterLayout, { Aside, Epigraph } from '@/components/ChapterLayout';
import ComplexPlane, { PlaneTable } from '@/components/ComplexPlane';
import LetterTool from '@/components/LetterTool';
import MathBlock, { M } from '@/components/MathBlock';
import { CHAPTERS } from '@/chapters/registry';

const meta = CHAPTERS[3];

export default function Chapter04() {
  const [numbers, setNumbers] = useState('');

  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        The eye is not an instrument.
        <br />
        It never was.
      </Epigraph>

      <p>
        The zeta function begins as a sum that only converges to the right of one,
      </p>

      <MathBlock display>
        {'\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^{s}} = \\prod_{p \\text{ prime}} \\left(1 - p^{-s}\\right)^{-1}, \\qquad \\Re(s) > 1 ,'}
      </MathBlock>

      <p>
        and then continues, by an argument Riemann gave in eight pages in 1859, to the whole
        plane apart from a simple pole at <M>{'s = 1'}</M>. The product on the right is why
        anyone cares: it is the primes, written as an analytic object.
      </p>

      <p>
        Its interesting zeros — the nontrivial ones — all live in a narrow strip, and every one
        anyone has ever found sits exactly on the line <M>{'\\Re(s) = \\tfrac12'}</M>. Whether
        that is true of all of them is the Riemann Hypothesis, and it is not your problem today.
      </p>

      <Aside>
        To be explicit, because this matters: nothing here requires the hypothesis to be true,
        or false, or decided. It requires only that you can tell whether a particular point is a
        zero — and the page will measure that for you.
      </Aside>

      <p>
        Below are fifty-three points. Some of them are zeros of <M>{'\\zeta'}</M>. Most are not,
        and there are two different ways of being a fraud here: some points sit a hair off the
        line, and some sit perfectly on it at a height where <M>{'\\zeta'}</M> simply does not
        vanish.
      </p>

      <ComplexPlane />

      <p>
        At low magnification every point lies on the critical line, because at low magnification
        everything lies on everything. Turn it up and watch a few of them drift away. The rest
        look perfect and still are not all zeros — the eye cannot tell, but a measurement can.
        Select any point and the page evaluates <M>{'|\\zeta(s)|'}</M> there. A genuine zero
        gives <M>{'0'}</M>. An impostor gives something visibly not <M>{'0'}</M>.
      </p>

      <PlaneTable onSend={setNumbers} />

      <p>
        Keep the true zeros and put them in order — there is only one natural order for a set of
        heights, lowest first. Each one then contributes exactly one letter, and it comes from the
        part of its height that survives when you throw away everything after the decimal point.
      </p>

      <LetterTool value={numbers} onChange={setNumbers} id="ch04-letters" />

      <p className="!mb-0">
        Three words. Twenty-three letters, each of them a place where an infinite sum of waves
        cancels to exactly nothing.
      </p>
    </ChapterLayout>
  );
}
