/**
 * Print a generated data module as JSON.
 *
 * The modules in src/data are plain literals with a couple of TypeScript
 * annotations on top.  Stripping those and importing the result is exact, which a
 * regex-and-hope parser on the Python side very much was not.
 *
 *   node tools/dump-data.mjs archive.ts
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const file = process.argv[2];
let src = readFileSync(new URL(`../src/data/${file}`, import.meta.url), 'utf8');

src = src
  .replace(/export interface[\s\S]*?\n\}\n/g, '')       // interface blocks
  .replace(/^export interface .*$/gm, '')               // one-liners
  .replace(/(export const \w+)\s*:[^=]+=/g, '$1 =');    // type annotations

const tmp = join(tmpdir(), `zosia-${process.pid}-${file.replace(/\W/g, '')}.mjs`);
writeFileSync(tmp, src);
try {
  const mod = await import(pathToFileURL(tmp).href);
  const out = {};
  for (const [k, v] of Object.entries(mod)) out[k] = v;
  process.stdout.write(JSON.stringify(out));
} finally {
  unlinkSync(tmp);
}
