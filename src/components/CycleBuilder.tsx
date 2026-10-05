'use client';

import { useState } from 'react';
import { INDICATORS } from '@/data/chapter07';
import { ActionButton } from '@/components/Workbench';

/**
 * Chapter 07, the easier edition: Rejewski's characteristic, computed in front of her.
 *
 * For positions (i, i+3) of every six-letter group, the letter at i is sent to the letter
 * at i+3.  Seventy-eight groups define all twenty-six arrows of each permutation; the
 * cycles are then read off by following arrows until they come back.
 */

const PAIRS: Array<{ name: string; from: number; to: number }> = [
  { name: 'AD', from: 0, to: 3 },
  { name: 'BE', from: 1, to: 4 },
  { name: 'CF', from: 2, to: 5 },
];

function cyclesOf(from: number, to: number): string[] | null {
  const map: Record<string, string> = {};
  for (const g of INDICATORS) map[g[from]] = g[to];
  if (Object.keys(map).length !== 26) return null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const start of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (seen.has(start)) continue;
    let cycle = '';
    let x = start;
    while (!seen.has(x)) {
      seen.add(x);
      cycle += x;
      x = map[x];
    }
    out.push(cycle);
  }
  return out.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

export default function CycleBuilder() {
  const [built, setBuilt] = useState(false);
  const results = PAIRS.map((p) => ({ ...p, cycles: built ? cyclesOf(p.from, p.to) : null }));

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby="cycles-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id="cycles-h" className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          The three permutations
        </h3>
        <span className="font-mono text-[10px] text-ink-500">1→4 · 2→5 · 3→6</span>
      </div>

      <div className="px-5 py-5">
        <p className="font-mono text-[11px] leading-relaxed text-haze">
          Take every group. Its first letter and its fourth letter are the same secret letter,
          enciphered three keystrokes apart, so draw an arrow from the first to the fourth. Do the
          same for 2 → 5 and 3 → 6. Then start anywhere and follow the arrows until you come back.
        </p>
        <div className="mt-4">
          <ActionButton onClick={() => setBuilt(true)} disabled={built}>
            build them from the intercepts
          </ActionButton>
        </div>

        {built && (
          <div className="mt-6 space-y-6">
            {results.map((r) => (
              <div key={r.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-[12px] tracking-widest2 text-parchment/85">{r.name}</span>
                  {r.cycles && (
                    <span className="tnum font-mono text-[11px] text-signal">
                      cycle lengths: {r.cycles.map((c) => c.length).join(' + ')}
                    </span>
                  )}
                </div>
                {r.cycles ? (
                  <p className="mt-2 break-all font-mono text-[12.5px] leading-relaxed tracking-[0.12em] text-haze">
                    {r.cycles.map((c) => `(${c})`).join(' ')}
                  </p>
                ) : (
                  <p className="mt-2 font-mono text-[11px] text-haze">Not every letter is covered.</p>
                )}
              </div>
            ))}
            <p className="font-mono text-[11px] leading-relaxed text-ink-500">
              Look at the lengths. They come in pairs, every time — 13 with 13, 2 with 2, 3 with 3,
              8 with 8. That is the theorem, and it holds whatever the plugboard was.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
