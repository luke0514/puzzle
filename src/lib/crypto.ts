/**
 * Answer verification and the final assembly.
 *
 * A static site can always be read.  Nothing here is real security and it is not
 * meant to be — it is spoiler resistance.  The goals are narrow and achievable:
 *
 *   1. No chapter's answer appears as plaintext anywhere in the bundle.
 *   2. The closing text of Chapter 10 is AES-GCM ciphertext whose key is derived
 *      from all nine earlier answers plus the final passphrase.  Reading the
 *      source gets you a blob; you cannot turn it into words without solving.
 *
 * Everything runs through WebCrypto, which is available in every target browser.
 */

/** Letters with a stroke have no canonical NFD decomposition, so they need a rule. */
const STROKE: Record<string, string> = {
  Ł: 'L', ł: 'l', Đ: 'D', đ: 'd', Ø: 'O', ø: 'o',
};

/**
 * Fold an answer to its comparison form: strip diacritics, drop everything that
 * is not A-Z or 0-9, uppercase.  "Polska matematyka zmieniła historię" and
 * "POLSKAMATEMATYKAZMIENILAHISTORIE" therefore compare equal, which matters a
 * great deal when the expected answer is in Polish and the solver's keyboard is not.
 */
export function normalise(input: string): string {
  const stroked = Array.from(input).map((c) => STROKE[c] ?? c).join('');
  return stroked
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

const enc = new TextEncoder();

async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Chapter answers are stored as SHA-256("zosia/<id>/<normalised>"). */
export async function hashAnswer(chapterId: string, answer: string): Promise<string> {
  return sha256Hex(`zosia/${chapterId}/${normalise(answer)}`);
}

export async function verifyAnswer(
  chapterId: string,
  answer: string,
  expectedHash: string,
): Promise<boolean> {
  if (!normalise(answer)) return false;
  return (await hashAnswer(chapterId, answer)) === expectedHash;
}

// --------------------------------------------------------------------------
// Final assembly
// --------------------------------------------------------------------------

/** Returns an ArrayBuffer rather than a view: WebCrypto wants a BufferSource, and
 *  TypeScript's Uint8Array is generic over its backing buffer from 5.7 onward. */
function b64ToBytes(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const buffer = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < bin.length; i += 1) view[i] = bin.charCodeAt(i);
  return buffer;
}

export interface SealedPayload {
  salt: string;
  iv: string;
  ciphertext: string;
  iterations: number;
}

/**
 * Derive the AES key from every answer the solver has produced and unseal the
 * closing text.  Returns null if any of them is wrong — there is deliberately no
 * partial credit and no error detail.
 */
export async function unseal(
  payload: SealedPayload,
  answers: string[],
  passphrase: string,
): Promise<string | null> {
  const password = `${answers.map(normalise).join('|')}|${normalise(passphrase)}`;
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: b64ToBytes(payload.salt),
      iterations: payload.iterations,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(payload.iv) },
      key,
      b64ToBytes(payload.ciphertext),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null; // wrong key: GCM authentication failed
  }
}
