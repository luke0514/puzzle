'use client';

import { useEffect, useRef, useState } from 'react';
import { decodePng, readBitPlane, type DecodedPng } from '@/lib/png';
import { asset } from '@/lib/paths';
import { ActionButton } from '@/components/Workbench';

/**
 * Chapter 06, the easier edition: the steganography tools, in the page.
 *
 * Open the file (not the picture), read its text chunks, pick a colour channel and a
 * bit, look at that bit plane, and read it as text.  The decoding is exact — see
 * src/lib/png.ts for why this does not go through a canvas.  Choosing the channel and
 * the bit is still hers.
 */

const CHANNELS = ['red', 'green', 'blue'] as const;

export default function PlateReader() {
  const [img, setImg] = useState<DecodedPng | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState(0);
  const [bit, setBit] = useState(7);
  const [text, setText] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const open = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(asset('/puzzles/plate-vii.png'));
      setImg(await decodePng(await res.arrayBuffer()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The file could not be read.');
    } finally {
      setLoading(false);
    }
  };

  // Draw the chosen bit plane: white where the bit is 1, dark where it is 0.
  useEffect(() => {
    if (!img || !canvas.current) return;
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;
    const out = ctx.createImageData(img.width, img.height);
    const n = img.width * img.height;
    for (let i = 0; i < n; i += 1) {
      const on = (img.pixels[i * img.channels + channel] >> bit) & 1;
      const v = on ? 150 : 10;
      out.data[i * 4] = v;
      out.data[i * 4 + 1] = v;
      out.data[i * 4 + 2] = v;
      out.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [img, channel, bit]);

  useEffect(() => setText(null), [channel, bit]);

  const read = () => {
    if (!img) return;
    const bytes = readBitPlane(img, channel, bit);
    setText(bytes.length ? new TextDecoder('utf-8').decode(bytes) : '(nothing — the first byte was zero)');
  };

  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40" aria-labelledby="plate-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 id="plate-h" className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">
          Reading the file
        </h3>
        <span className="font-mono text-[10px] text-ink-500">runs in your browser</span>
      </div>

      {!img && (
        <div className="px-5 py-5">
          <ActionButton onClick={open} busy={loading}>
            open plate-vii.png as a file
          </ActionButton>
          {error && <p className="mt-3 font-mono text-[11px] text-haze">{error}</p>}
        </div>
      )}

      {img && (
        <>
          <div className="border-b border-ink-700 px-5 py-4">
            <div className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
              text written inside the file
            </div>
            <dl className="mt-3 grid grid-cols-[8.5rem_1fr] gap-y-1 font-mono text-[12.5px]">
              {img.text.map((t) => (
                <div key={t.key} className="contents">
                  <dt className="text-ink-500">{t.key}</dt>
                  <dd className="break-words text-parchment/85">{t.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-mono text-[11px] text-ink-500">
              {img.width} × {img.height} pixels · each pixel is three numbers (red, green, blue),
              each number is eight bits.
            </p>
          </div>

          <div className="grid gap-5 border-b border-ink-700 px-5 py-4 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 font-mono text-[10px] uppercase tracking-widest2 text-ink-500">
                channel
              </legend>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(i)}
                    aria-pressed={channel === i}
                    className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest2 transition-colors ${
                      channel === i ? 'border-steel-dim text-signal' : 'border-ink-600 text-ink-500 hover:text-haze'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
                bit {bit}{bit === 7 ? ' · most significant' : bit === 0 ? ' · least significant' : ''}
              </span>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={7 - bit}
                onChange={(e) => setBit(7 - Number(e.target.value))}
                aria-label="Which bit of the channel to look at"
                className="h-[2px] w-full cursor-pointer appearance-none bg-ink-600 accent-steel"
              />
              <span className="mt-1 flex justify-between font-mono text-[9px] text-ink-500">
                <span>7 · coarse</span>
                <span>0 · finest</span>
              </span>
            </label>
          </div>

          <div className="bg-ink-950 px-5 py-4">
            <canvas
              ref={canvas}
              width={img.width}
              height={img.height}
              className="block h-auto w-full border border-ink-700 [image-rendering:pixelated]"
              aria-label={`Bit ${bit} of the ${CHANNELS[channel]} channel, white where the bit is one`}
            />
            <p className="mt-2 font-mono text-[10px] text-ink-500">
              bit {bit} of {CHANNELS[channel]} — white where it is 1, dark where it is 0
            </p>
          </div>

          <div className="border-t border-ink-700 px-5 py-4">
            <p className="font-mono text-[11px] leading-relaxed text-haze">
              Read this plane as a message: pixel by pixel from the top-left corner, row by row,
              eight bits to a letter, stopping at the first zero byte.
            </p>
            <div className="mt-3">
              <ActionButton onClick={read}>read this plane as text</ActionButton>
            </div>
            {text !== null && (
              <p
                aria-live="polite"
                lang="pl"
                className="mt-6 break-all font-mono text-[clamp(14px,3.6vw,18px)] leading-relaxed tracking-[0.12em] text-signal"
              >
                {text}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
