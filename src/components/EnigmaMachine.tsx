'use client';

import { useMemo, useState } from 'react';
import { Enigma, ROTOR_NAMES, validPlugboard, type EnigmaSettings } from '@/lib/enigma';
import { INTERCEPT } from '@/data/chapter08';

/**
 * A working Enigma I.  The plugboard and reflector come pre-set from the day's key
 * sheet; the three wheels, the ring setting and the ground setting are yours to find.
 *
 * The wheel windows show where the rotors finish after the whole message, which is
 * the same thing the operator would have been looking at.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function Selector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest2 text-ink-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-ink-600 bg-ink-900/80 px-2.5 py-2 text-center font-mono text-[13px] text-parchment focus:border-steel-dim focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function EnigmaMachine() {
  const [rotors, setRotors] = useState<[string, string, string]>(['I', 'II', 'III']);
  const [rings, setRings] = useState<[string, string, string]>(['A', 'A', 'A']);
  const [pos, setPos] = useState<[string, string, string]>(['A', 'A', 'A']);
  const [reflector, setReflector] = useState(INTERCEPT.reflector);
  const [plugboard, setPlugboard] = useState(INTERCEPT.plugboard);
  const [text, setText] = useState(INTERCEPT.ciphertext);

  const duplicateWheels = new Set(rotors).size !== 3;
  const plugOk = validPlugboard(plugboard);

  const { output, window: finalWindow } = useMemo(() => {
    if (duplicateWheels || !plugOk) return { output: '', window: '···' };
    const settings: EnigmaSettings = {
      rotors,
      rings: rings.join(''),
      positions: pos.join(''),
      plugboard,
      reflector,
    };
    const m = new Enigma(settings);
    const out = m.encrypt(text);
    return { output: out, window: m.window };
  }, [duplicateWheels, plugOk, plugboard, pos, reflector, rings, rotors, text]);

  const setAt =
    <T extends [string, string, string]>(setter: (v: T) => void, cur: T) =>
    (i: number) =>
    (v: string) => {
      const next = [...cur] as T;
      next[i] = v;
      setter(next);
    };

  return (
    <div className="my-10 border border-ink-600 bg-ink-850/40">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Enigma I — Heer, three wheels
        </h3>
        <span className="font-mono text-[10px] text-ink-500">
          window after message: <span className="text-haze">{finalWindow}</span>
        </span>
      </div>

      <div className="grid gap-px overflow-hidden bg-ink-700 lg:grid-cols-[1fr_1fr]">
        {/* -------------------------------------------------- settings */}
        <div className="min-w-0 bg-ink-850/70 p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
            Walzenlage — left to right
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Selector
                key={`w${i}`}
                label={['slow', 'middle', 'fast'][i]}
                value={rotors[i]}
                options={ROTOR_NAMES}
                onChange={setAt(setRotors, rotors)(i)}
              />
            ))}
          </div>

          <p className="mb-4 mt-6 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
            Ringstellung
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Selector
                key={`r${i}`}
                label={`ring ${i + 1}`}
                value={rings[i]}
                options={LETTERS}
                onChange={setAt(setRings, rings)(i)}
              />
            ))}
          </div>

          <p className="mb-4 mt-6 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
            Grundstellung
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Selector
                key={`p${i}`}
                label={`pos ${i + 1}`}
                value={pos[i]}
                options={LETTERS}
                onChange={setAt(setPos, pos)(i)}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[7rem_1fr]">
            <Selector
              label="Umkehrwalze"
              value={reflector}
              options={['B', 'C']}
              onChange={setReflector}
            />
            <label className="block">
              <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest2 text-ink-500">
                Steckerbrett
              </span>
              <input
                value={plugboard}
                onChange={(e) => setPlugboard(e.target.value.toUpperCase())}
                spellCheck={false}
                autoComplete="off"
                className={`w-full border bg-ink-900/80 px-2.5 py-2 font-mono text-[12px] tracking-[0.14em] text-parchment focus:outline-none ${
                  plugOk ? 'border-ink-600 focus:border-steel-dim' : 'border-steel-dim/70'
                }`}
              />
            </label>
          </div>

          {duplicateWheels && (
            <p className="mt-4 font-mono text-[11px] text-haze">
              A wheel cannot be in two slots at once.
            </p>
          )}
          {!plugOk && (
            <p className="mt-2 font-mono text-[11px] text-haze">
              The plugboard must be disjoint pairs of distinct letters.
            </p>
          )}
        </div>

        {/* -------------------------------------------------- traffic */}
        <div className="min-w-0 bg-ink-850/70 p-5">
          <label
            htmlFor="enigma-in"
            className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest2 text-ink-500"
          >
            input
          </label>
          <textarea
            id="enigma-in"
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            rows={4}
            spellCheck={false}
            className="w-full resize-y border border-ink-600 bg-ink-900/80 px-3 py-2.5 font-mono text-[13px] leading-relaxed tracking-[0.18em] text-parchment focus:border-steel-dim focus:outline-none"
          />

          <div className="mt-5 font-mono text-[9px] uppercase tracking-widest2 text-ink-500">
            output
          </div>
          <output
            className="mt-2 block min-h-[6rem] overflow-x-auto break-all border border-ink-700 bg-ink-900/50 px-3 py-2.5 font-mono text-[15px] leading-[1.9] tracking-[0.24em] text-signal"
            aria-live="polite"
          >
            {output || '—'}
          </output>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={() => setText(INTERCEPT.ciphertext)}
              className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
            >
              load intercept
            </button>
            <button
              type="button"
              onClick={() => {
                setRotors(['I', 'II', 'III']);
                setRings(['A', 'A', 'A']);
                setPos(['A', 'A', 'A']);
              }}
              className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500 hover:text-haze"
            >
              reset wheels
            </button>
          </div>

          <p className="mt-5 font-mono text-[11px] leading-relaxed text-ink-500">
            The machine is reciprocal: with the same settings, running the output back through
            it returns the input. No letter ever encrypts to itself, which is the flaw that
            eventually cost it everything.
          </p>
        </div>
      </div>
    </div>
  );
}
