'use client';

import { useMemo, useState } from 'react';
import { E, G, ORDER, Q, crt, factor, pohligHellman, type Piece } from '@/lib/ecdlp';
import { ActionButton, Bench, Readout, Step } from '@/components/Workbench';

/**
 * Chapter 05, the easier edition: the Pohlig–Hellman attack as four buttons, then a
 * Vigenère table for the last step, which is left in her hands.
 *
 * The order of G is written down in src/lib/ecdlp.ts rather than searched for, but it is
 * not taken on trust: step 1 proves it, by checking N·G = O and (N/q)·G ≠ O for every
 * prime q | N.
 */

const sup = (e: number) => (e === 1 ? '' : String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]));
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function CurveWorkbench() {
  const [factors, setFactors] = useState<Array<[bigint, number]> | null>(null);
  const [orderOk, setOrderOk] = useState(false);
  const [pieces, setPieces] = useState<Piece[] | null>(null);
  const [k, setK] = useState<bigint | null>(null);
  const [digits, setDigits] = useState<number[] | null>(null);

  const measure = () => {
    const f = factor(ORDER);
    const ok =
      E.mul(ORDER, G) === null && f.every(([q]) => E.mul(ORDER / q, G) !== null);
    setOrderOk(ok);
    setFactors(f);
  };

  const split = () => factors && setPieces(pohligHellman(factors));
  const glue = () => pieces && setK(crt(pieces));
  const base26 = () => {
    if (k === null) return;
    const d: number[] = [];
    let x = k;
    while (x > 0n) {
      d.unshift(Number(x % 26n));
      x /= 26n;
    }
    setDigits(d);
  };

  const kG = useMemo(() => (k === null ? null : E.mul(k, G)), [k]);
  const kWorks = kG !== null && Q !== null && kG.x === Q.x && kG.y === Q.y;

  return (
    <Bench title="Workbench" note="runs in your browser">
      <Step n={1} title="Measure the group" done={factors !== null}>
        <p className="text-haze">
          How many times do you have to add G to itself before you get back to nothing? That
          number is the order of G, and its prime factors decide everything.
        </p>
        <div className="mt-3">
          <ActionButton onClick={measure} disabled={factors !== null}>
            find ord(G) and factor it
          </ActionButton>
        </div>
        {factors && (
          <>
            <Readout label="ord(G)">
              <span className="tnum font-mono text-[13px]">{ORDER.toString()}</span>
            </Readout>
            <Readout label="= ">
              <span className="tnum font-mono text-[13px] text-signal">
                {factors.map(([q, e]) => `${q}${sup(e)}`).join(' · ')}
              </span>
            </Readout>
            <p className="mt-3 text-haze">
              {orderOk ? '✓ checked: ord(G)·G = O, and no smaller divisor works. ' : ''}
              The largest prime factor is {factors[factors.length - 1][0].toLocaleString('en-US')}.
              On a safe curve it would have about fifteen digits. Here it has five.
            </p>
          </>
        )}
      </Step>

      <Step n={2} title="Solve the logarithm in each small piece" done={pieces !== null}>
        <p className="text-haze">
          Pohlig–Hellman: for each prime power, push G and Q down into a subgroup that small and
          find k there by baby-step giant-step. Each piece is a few hundred steps at most.
        </p>
        <div className="mt-3">
          <ActionButton onClick={split} disabled={!factors || pieces !== null}>
            solve each piece
          </ActionButton>
        </div>
        {pieces && (
          <table className="tnum mt-4 border-collapse text-left font-mono text-[12px]">
            <caption className="sr-only">k reduced modulo each prime power</caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-widest2 text-ink-500">
                <th scope="col" className="pb-1 pr-6 font-normal">piece</th>
                <th scope="col" className="pb-1 font-normal">k mod piece</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map((pc) => (
                <tr key={pc.modulus.toString()} className="border-t border-ink-700/40">
                  <td className="py-[3px] pr-6 text-haze">
                    {pc.q.toString()}
                    {sup(pc.e)}
                  </td>
                  <td className="py-[3px]">{pc.residue.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Step>

      <Step n={3} title="Glue the pieces back together" done={k !== null}>
        <p className="text-haze">
          The Chinese Remainder Theorem: seven remainders, one number that has all of them.
        </p>
        <div className="mt-3">
          <ActionButton onClick={glue} disabled={!pieces || k !== null}>
            combine
          </ActionButton>
        </div>
        {k !== null && (
          <>
            <Readout label="k">
              <span className="tnum font-mono text-[15px] text-signal">{k.toString()}</span>
            </Readout>
            <p className="mt-3 text-haze">k·G = Q {kWorks ? '✓' : '✗'}</p>
          </>
        )}
      </Step>

      <Step n={4} title="Turn k into a word" done={digits !== null}>
        <p className="text-haze">
          Write k in base 26 instead of base 10, and read each digit as a letter, A = 0.
        </p>
        <div className="mt-3">
          <ActionButton onClick={base26} disabled={k === null || digits !== null}>
            write k in base 26
          </ActionButton>
        </div>
        {digits && (
          <>
            <Readout label="digits">
              <span className="tnum font-mono text-[12px] text-haze">{digits.join(' · ')}</span>
            </Readout>
            <Readout label="as letters — this is the key">
              <span className="font-mono text-[18px] tracking-[0.3em] text-signal">
                {digits.map((d) => ALPHABET[d]).join('')}
              </span>
            </Readout>
          </>
        )}
      </Step>
    </Bench>
  );
}

/**
 * Vigenère, decrypt direction: plaintext letter = ciphertext letter − key letter (mod 26),
 * the key repeating as often as it needs to.
 */
export function VigenereDecoder({ ciphertext }: { ciphertext: string }) {
  const [keyword, setKeyword] = useState('');
  const clean = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  const plain = clean
    ? ciphertext
        .split('')
        .map((ch, i) => {
          const c = ch.charCodeAt(0) - 65;
          const kk = clean.charCodeAt(i % clean.length) - 65;
          return ALPHABET[(c - kk + 26) % 26];
        })
        .join('')
    : '';

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby="vig-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id="vig-h" className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Vigenère table
        </h3>
        <span className="font-mono text-[10px] text-ink-500">plain = cipher − key (mod 26)</span>
      </div>
      <div className="px-5 py-5">
        <div className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">ciphertext</div>
        <p className="mt-1 break-all font-mono text-[17px] tracking-[0.3em] text-parchment/85">{ciphertext}</p>

        <label htmlFor="vig-key" className="mt-5 block font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
          key
        </label>
        <input
          id="vig-key"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="type the key word"
          className="mt-2 w-full border border-ink-600 bg-ink-900/70 px-3 py-2 font-mono text-[14px] tracking-[0.2em] text-parchment placeholder:tracking-normal placeholder:text-ink-500 focus:border-steel-dim focus:outline-none"
        />

        <div className="mt-5 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">plaintext</div>
        <output aria-live="polite" className="mt-1 block min-h-[1.8em] break-all font-mono text-[17px] tracking-[0.3em] text-signal">
          {plain || '—'}
        </output>
      </div>
    </section>
  );
}
