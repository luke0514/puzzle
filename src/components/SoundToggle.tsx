'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadState, saveState } from '@/lib/puzzleState';

/**
 * Room tone, synthesised.  No audio files, nothing to download, and off by default.
 *
 * What it makes: filtered brown noise at a very low level, a slow LFO on the filter
 * so it breathes, and a soft tick every four seconds or so — a clock in the next room,
 * not a metronome.  It is meant to be the sort of sound you notice only when it stops.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    setOn(Boolean(loadState().soundOn));
    setReady(true);
  }, []);

  const start = useCallback(() => {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;

    // --- brown noise -------------------------------------------------------
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    filter.Q.value = 0.4;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);

    // a slow sweep on the cutoff, so the tone is never quite static
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(filter.frequency);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    lfo.start();

    // --- the clock in the next room ---------------------------------------
    const tick = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 1750 + Math.random() * 120;
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.011, t + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2400;
      osc.connect(env).connect(lp).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    };
    const timer = window.setInterval(tick, 4000);

    nodesRef.current = {
      stop: () => {
        window.clearInterval(timer);
        try {
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
          window.setTimeout(() => ctx.close().catch(() => {}), 800);
        } catch {
          /* already closing */
        }
        ctxRef.current = null;
      },
    };
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    const s = loadState();
    s.soundOn = next;
    saveState(s);
    if (next) start();
    else {
      nodesRef.current?.stop();
      nodesRef.current = null;
    }
  };

  useEffect(() => () => nodesRef.current?.stop(), []);

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      className="fixed bottom-4 right-4 z-50 border border-ink-700/70 bg-ink-900/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest2 text-ink-500 backdrop-blur-sm transition-colors hover:border-ink-600 hover:text-haze"
    >
      {on ? '◍' : '◌'}
    </button>
  );
}
