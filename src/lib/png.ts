/**
 * Just enough PNG to read plate VII honestly in the browser: the text chunks, and the
 * exact pixel bytes.
 *
 * Drawing the image on a canvas and calling getImageData would usually work too, but a
 * browser is allowed to colour-manage what it draws, and one changed bit in the blue
 * channel is the difference between a sentence and noise.  So the file is decoded here,
 * byte for byte: IHDR, tEXt, the concatenated IDAT stream through the platform's zlib
 * (DecompressionStream), then the five scanline filters undone by hand.
 *
 * Supports what the plate is — 8-bit RGB or RGBA, non-interlaced — and says so otherwise.
 */

export interface DecodedPng {
  width: number;
  height: number;
  /** Bytes per pixel: 3 for RGB, 4 for RGBA. */
  channels: number;
  /** Raw, unfiltered pixel bytes, row-major. */
  pixels: Uint8Array;
  /** tEXt chunks, in file order. */
  text: Array<{ key: string; value: string }>;
}

function u32(b: Uint8Array, o: number): number {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser cannot decompress PNG data (DecompressionStream is missing).');
  }
  // Copy into a plain ArrayBuffer: Blob wants ArrayBuffer-backed views, not ArrayBufferLike.
  const copy = new ArrayBuffer(data.byteLength);
  new Uint8Array(copy).set(data);
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export async function decodePng(buffer: ArrayBuffer): Promise<DecodedPng> {
  const bytes = new Uint8Array(buffer);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!sig.every((v, i) => bytes[i] === v)) throw new Error('Not a PNG file.');

  let width = 0;
  let height = 0;
  let channels = 0;
  const text: DecodedPng['text'] = [];
  const idat: Uint8Array[] = [];
  const latin1 = new TextDecoder('latin1');

  let o = 8;
  while (o < bytes.length) {
    const len = u32(bytes, o);
    const type = String.fromCharCode(...bytes.subarray(o + 4, o + 8));
    const body = bytes.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      width = u32(body, 0);
      height = u32(body, 4);
      const depth = body[8];
      const colour = body[9];
      const interlace = body[12];
      if (depth !== 8 || (colour !== 2 && colour !== 6) || interlace !== 0) {
        throw new Error('Only 8-bit, non-interlaced RGB or RGBA PNGs are supported here.');
      }
      channels = colour === 2 ? 3 : 4;
    } else if (type === 'tEXt') {
      const nul = body.indexOf(0);
      text.push({
        key: latin1.decode(body.subarray(0, nul)),
        value: latin1.decode(body.subarray(nul + 1)),
      });
    } else if (type === 'IDAT') {
      idat.push(body);
    } else if (type === 'IEND') {
      break;
    }
    o += 12 + len;
  }

  const total = idat.reduce((n, c) => n + c.length, 0);
  const joined = new Uint8Array(total);
  let at = 0;
  for (const c of idat) {
    joined.set(c, at);
    at += c.length;
  }
  const raw = await inflate(joined);

  const stride = width * channels;
  const pixels = new Uint8Array(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const cur = raw[src + x];
      const left = x >= channels ? pixels[dst + x - channels] : 0;
      const up = y > 0 ? pixels[dst - stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[dst - stride + x - channels] : 0;
      let v: number;
      switch (filter) {
        case 0: v = cur; break;
        case 1: v = cur + left; break;
        case 2: v = cur + up; break;
        case 3: v = cur + ((left + up) >> 1); break;
        case 4: v = cur + paeth(left, up, upLeft); break;
        default: throw new Error(`Unknown PNG filter ${filter} on row ${y}.`);
      }
      pixels[dst + x] = v & 0xff;
    }
  }

  return { width, height, channels, pixels, text };
}

/**
 * Read one bit of one channel from every pixel, row-major from the top-left, eight bits
 * to a byte, most significant first.  Stops at the first zero byte or at `maxBytes`.
 */
export function readBitPlane(
  img: DecodedPng,
  channel: number,
  bit: number,
  maxBytes = 160,
): Uint8Array {
  const out: number[] = [];
  let acc = 0;
  let count = 0;
  const n = img.width * img.height;
  for (let i = 0; i < n && out.length < maxBytes; i += 1) {
    acc = (acc << 1) | ((img.pixels[i * img.channels + channel] >> bit) & 1);
    count += 1;
    if (count === 8) {
      if (acc === 0) break;
      out.push(acc);
      acc = 0;
      count = 0;
    }
  }
  return new Uint8Array(out);
}
