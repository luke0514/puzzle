'use client';

import { useState } from 'react';
import ChapterLayout, { Aside, Epigraph } from '@/components/ChapterLayout';
import GaussianPlane from '@/components/GaussianPlane';
import LetterTool from '@/components/LetterTool';
import MathBlock, { M } from '@/components/MathBlock';
import { CHAPTERS } from '@/chapters/registry';

const meta = CHAPTERS[1];

export default function Chapter02() {
  const [numbers, setNumbers] = useState('');

  return (
    <ChapterLayout meta={meta}>
      <Epigraph>
        A prime is not one thing.
        <br />
        It is one thing in <span className="not-italic">ℤ</span>.
      </Epigraph>

      <p>
        Fermat noticed it in 1640 and Euler proved it: a prime that leaves remainder one when
        divided by four can always be written as a sum of two squares,
      </p>

      <MathBlock display>{'p = a^{2} + b^{2}, \\qquad 0 < a < b ,'}</MathBlock>

      <p>
        and in <em>exactly one</em> way. Not the way a room has furniture — arbitrarily,
        replaceably. The way a face has features.
      </p>

      <p>
        So each such prime quietly owns a point in the plane: go <M>{'a'}</M> to the right and{' '}
        <M>{'b'}</M> up, and you are standing on the complex number <M>{'a + bi'}</M>. Its mirror
        image <M>{'a - bi'}</M> is the other face. And a point in the plane has something an
        integer on a line does not — a direction. An angle.
      </p>

      <div className="rule my-12" />

      <p>
        Below are eighteen primes, every one of them of that kind. They are printed by size,
        which is the order a computer produces and a person expects. It tells you how large they
        are. It tells you nothing else, and this chapter is not about size.
      </p>

      <GaussianPlane onSend={setNumbers} />

      <Aside>
        Split them, and every prime hands you two numbers, a and b. There are two ways to line
        the primes up — by size, or by the angle they make in the plane — and two columns to
        read. Four combinations. Three of them are noise.
      </Aside>

      <LetterTool value={numbers} onChange={setNumbers} id="ch02-letters" />

      <p>
        The letter tool rounds each number down, divides by twenty-six, keeps the remainder, and
        counts the alphabet from zero — A is 0, B is 1, Z is 25. Send it a column and read what
        comes out.
      </p>

      <p className="!mb-0">
        Sorting is a choice. Every ordering is a claim about what matters. Make the right claim
        and the same eighteen primes will say four words to you.
      </p>
    </ChapterLayout>
  );
}
