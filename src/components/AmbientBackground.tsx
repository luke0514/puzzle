'use client';

import { useEffect, useRef } from 'react';

/**
 * Everything in this component is meant to be felt rather than seen.  Three layers:
 *
 *   1. a coordinate grid at roughly 2% opacity, drawn once;
 *   2. a slow drift of mathematical glyphs and primes, never above 6% opacity;
 *   3. a film grain regenerated a few times a second.
 *
 * All of it stops dead under prefers-reduced-motion, and none of it is ever drawn
 * over text — the canvas sits behind everything at z-0 and is aria-hidden.
 */

const GLYPHS = [
  'ζ', 'φ', 'π', 'Σ', '∫', 'ℤ', 'ℂ', 'ℝ', '≡', '∈', '∀', '∃', '⊕', '√', '∞', 'λ',
  'Γ', 'θ', 'ε', 'ℵ', '∂', '∇', '≅', 'ρ',
];

// A few primes, and three constants that turn up repeatedly in this puzzle.
const NUMERALS = [
  '2', '3', '5', '7', '11', '13', '17', '19', '23', '29', '31', '37', '41', '43',
  '65537', '1.6180339887', '14.134725', '0.5772156649', '1932',
];

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  size: number;
  alpha: number;
  rot: number;
}

export default function AmbientBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let motes: Mote[] = [];
    let raf = 0;
    let grainCanvas: HTMLCanvasElement | null = null;
    let lastGrain = 0;

    const seedMotes = () => {
      const count = Math.min(34, Math.round((width * height) / 48000));
      motes = Array.from({ length: count }, () => {
        const numeric = Math.random() < 0.42;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.055,
          vy: -0.012 - Math.random() * 0.036,
          text: numeric
            ? NUMERALS[Math.floor(Math.random() * NUMERALS.length)]
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          size: numeric ? 11 + Math.random() * 9 : 15 + Math.random() * 24,
          alpha: 0.011 + Math.random() * 0.026,
          rot: (Math.random() - 0.5) * 0.12,
        };
      });
    };

    const makeGrain = () => {
      const g = document.createElement('canvas');
      g.width = 140;
      g.height = 140;
      const gc = g.getContext('2d');
      if (!gc) return g;
      const img = gc.createImageData(140, 140);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 9; // the grain is barely there on purpose
      }
      gc.putImageData(img, 0, 0);
      return g;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedMotes();
    };

    const drawGrid = () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(120,160,215,0.030)';
      ctx.lineWidth = 1;
      const step = 96;
      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      for (let y = 0; y <= height; y += step) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();
      // every fifth line a shade stronger, like a survey chart
      ctx.strokeStyle = 'rgba(120,160,215,0.045)';
      ctx.beginPath();
      for (let x = 0; x <= width; x += step * 5) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      for (let y = 0; y <= height; y += step * 5) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();
      ctx.restore();
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();

      ctx.save();
      for (const m of motes) {
        if (!reduced) {
          m.x += m.vx;
          m.y += m.vy;
          if (m.y < -40) {
            m.y = height + 30;
            m.x = Math.random() * width;
          }
          if (m.x < -40) m.x = width + 30;
          if (m.x > width + 40) m.x = -30;
        }
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = '#93b4dc';
        ctx.font = `${m.size}px "IBM Plex Mono", ui-monospace, monospace`;
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rot);
        ctx.fillText(m.text, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.restore();

      if (grainCanvas && t - lastGrain > 240) {
        lastGrain = t;
      }
      if (grainCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        const pattern = ctx.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }

      if (!reduced) raf = window.requestAnimationFrame(frame);
    };

    grainCanvas = makeGrain();
    resize();
    window.addEventListener('resize', resize);
    raf = window.requestAnimationFrame(frame);

    // Re-grain occasionally so the noise breathes instead of sitting still.
    const grainTimer = reduced
      ? undefined
      : window.setInterval(() => {
          grainCanvas = makeGrain();
        }, 900);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(raf);
      if (grainTimer) window.clearInterval(grainTimer);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.9 }}
    />
  );
}
