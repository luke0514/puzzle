'use client';

import { useEffect, useRef, useState } from 'react';
import { RSA } from '@/data/chapter03';
import { invMod, isqrt, powMod } from '@/lib/math';
import { ActionButton, Bench, LongNumber, Readout, Step } from '@/components/Workbench';

/**
 * Chapter 03, the easier edition: the whole attack as five buttons.
 *
 * Fermat's method needs about 2.6 million steps on this modulus.  Done naively with
 * BigInt that is slow, so the walk runs in ordinary Numbers: a − n mod m is tracked for
 * a dozen small moduli m, and only a candidate that is a square modulo every one of
 * them is checked with a real BigInt square root.  Fewer than one in a thousand get
 * that far, and the whole walk takes well under a second.
 */

const n = BigInt(RSA.n);
const e = BigInt(RSA.e);
const c = BigInt(RSA.c);

const MODULI = [64, 63, 65, 11, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const SQUARES: Uint8Array[] = MODULI.map((m) => {
  const t = new Uint8Array(m);
  for (let x = 0; x < m; x += 1) t[(x * x) % m] = 1;
  return t;
});

function ceilSqrt(x: bigint): bigint {
  const r = isqrt(x);
  return r * r === x ? r : r + 1n;
}

type Found = { a: bigint; b: bigint; p: bigint; q: bigint; steps: number };

export default function RsaWorkbench() {
  const [start, setStart] = useState<bigint | null>(null);
  const [steps, setSteps] = useState(0);
  const [walking, setWalking] = useState(false);
  const [found, setFound] = useState<Found | null>(null);
  const [keys, setKeys] = useState<{ phi: bigint; d: bigint } | null>(null);
  const [m, setM] = useState<bigint | null>(null);
  const [text, setText] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const begin = () => setStart(ceilSqrt(n));

  const walk = () => {
    if (start === null || walking) return;
    const a0 = start;
    setWalking(true);
    cancelled.current = false;

    const r0 = a0 * a0 - n;
    const am = MODULI.map((md) => Number(a0 % BigInt(md)));
    const rm = MODULI.map((md) => Number(r0 % BigInt(md)));
    let i = 0;
    const CHUNK = 150_000;

    const tick = () => {
      if (cancelled.current) return;
      const stop = i + CHUNK;
      for (; i < stop; i += 1) {
        let candidate = true;
        for (let k = 0; k < MODULI.length; k += 1) {
          if (!SQUARES[k][rm[k]]) {
            candidate = false;
            break;
          }
        }
        if (candidate) {
          const a = a0 + BigInt(i);
          const r = a * a - n;
          const b = isqrt(r);
          if (b * b === r) {
            setSteps(i + 1);
            setFound({ a, b, p: a - b, q: a + b, steps: i + 1 });
            setWalking(false);
            return;
          }
        }
        // a → a + 1:   a² − n grows by 2a + 1
        for (let k = 0; k < MODULI.length; k += 1) {
          const md = MODULI[k];
          rm[k] = (rm[k] + 2 * am[k] + 1) % md;
          am[k] = (am[k] + 1) % md;
        }
      }
      setSteps(i);
      if (i > 50_000_000) {
        setWalking(false); // cannot happen with this key; a guard, not a feature
        return;
      }
      window.setTimeout(tick, 16);
    };
    window.setTimeout(tick, 16);
  };

  const makeKey = () => {
    if (!found) return;
    const phi = (found.p - 1n) * (found.q - 1n);
    setKeys({ phi, d: invMod(e, phi) });
  };

  const decrypt = () => {
    if (!keys) return;
    setM(powMod(c, keys.d, n));
  };

  const read = () => {
    if (m === null) return;
    let hex = m.toString(16);
    if (hex.length % 2) hex = `0${hex}`;
    const bytes = hex.match(/../g)?.map((h) => parseInt(h, 16)) ?? [];
    setText(String.fromCharCode(...bytes));
  };

  return (
    <Bench title="Workbench" note="runs in your browser · nothing is sent anywhere">
      <Step n={1} title="Stand at the square root of n" done={start !== null}>
        <p className="text-haze">
          If p and q are close together, n is very nearly a perfect square, and the middle of the
          two primes sits just above √n.
        </p>
        <div className="mt-3">
          <ActionButton onClick={begin} disabled={start !== null}>
            compute ⌈√n⌉
          </ActionButton>
        </div>
        {start !== null && (
          <Readout label="a₀ = ⌈√n⌉">
            <LongNumber value={start.toString()} />
          </Readout>
        )}
      </Step>

      <Step n={2} title="Walk upward until a² − n is a perfect square" done={found !== null}>
        <p className="text-haze">
          Fermat, 1643: if a² − n = b², then n = (a − b)(a + b), and those two brackets are the
          primes. Try a₀, a₀ + 1, a₀ + 2, … and stop at the first square.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <ActionButton onClick={walk} disabled={start === null || found !== null} busy={walking}>
            start walking
          </ActionButton>
          {(walking || found) && (
            <span className="tnum font-mono text-[12px] text-haze" aria-live="polite">
              {steps.toLocaleString('en-US')} steps{found ? ' — found it' : ''}
            </span>
          )}
        </div>
        {found && (
          <>
            <Readout label="p = a − b">
              <LongNumber value={found.p.toString()} />
            </Readout>
            <Readout label="q = a + b">
              <LongNumber value={found.q.toString()} />
            </Readout>
            <p className="mt-3 text-haze">
              p × q = n {found.p * found.q === n ? '✓' : '✗'} · the two primes differ by a number
              with {(found.q - found.p).toString().length} digits, out of {n.toString().length}.
            </p>
          </>
        )}
      </Step>

      <Step n={3} title="Rebuild the private key" done={keys !== null}>
        <p className="text-haze">φ(n) = (p − 1)(q − 1), and d is the inverse of e = 65537 modulo φ(n).</p>
        <div className="mt-3">
          <ActionButton onClick={makeKey} disabled={!found || keys !== null}>
            compute d
          </ActionButton>
        </div>
        {keys && (
          <Readout label="d">
            <LongNumber value={keys.d.toString()} />
          </Readout>
        )}
      </Step>

      <Step n={4} title="Decrypt" done={m !== null}>
        <p className="text-haze">m = c^d mod n.</p>
        <div className="mt-3">
          <ActionButton onClick={decrypt} disabled={!keys || m !== null}>
            compute m
          </ActionButton>
        </div>
        {m !== null && (
          <Readout label="m">
            <LongNumber value={m.toString()} />
          </Readout>
        )}
      </Step>

      <Step n={5} title="Read the number as bytes" done={text !== null}>
        <p className="text-haze">
          Write m in base 256. Every digit is one byte, and every byte is one ASCII character.
        </p>
        <div className="mt-3">
          <ActionButton onClick={read} disabled={m === null || text !== null}>
            read m as text
          </ActionButton>
        </div>
        {text !== null && (
          <p className="mt-4 break-words font-mono text-[clamp(15px,4vw,19px)] tracking-[0.2em] text-signal">
            {text}
          </p>
        )}
      </Step>
    </Bench>
  );
}
