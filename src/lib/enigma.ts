/**
 * Enigma I (three rotors, reflector, plugboard) — a faithful port of the machine
 * the Wehrmacht fielded from 1930.  Verified against the standard regression
 * vector: rotors I II III, rings AAA, ground AAA, no plugs, 25 x 'A' encrypts to
 * BDZGOWCXLTKSBTMCDLPBMUQOF.
 *
 * Conventions used everywhere in this file and in the UI:
 *   - rotors, rings and positions are listed LEFT to RIGHT;
 *     index 0 is the slow leftmost wheel, index 2 the fast wheel by the entry disc.
 *   - the machine steps BEFORE each character is enciphered.
 *   - the middle wheel's double step is reproduced, because without it the
 *     ciphertext of any message longer than about 26 letters is wrong.
 */

const A = 65;

export const ROTOR_WIRING: Record<string, { wiring: string; notch: string }> = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV: { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V: { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
};

export const REFLECTORS: Record<string, string> = {
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
};

export const ROTOR_NAMES = ['I', 'II', 'III', 'IV', 'V'] as const;
export type RotorName = (typeof ROTOR_NAMES)[number];

export interface EnigmaSettings {
  rotors: [string, string, string]; // left to right
  rings: string; // e.g. 'PRI'
  positions: string; // e.g. 'THE'
  plugboard: string; // e.g. 'AV BS CG ...'
  reflector: string; // 'B' | 'C'
}

export class Enigma {
  private wiring: string[];
  private notch: number[];
  private ring: number[];
  private plug: number[];
  private refl: string;
  pos: number[];

  constructor(s: EnigmaSettings) {
    this.wiring = s.rotors.map((r) => ROTOR_WIRING[r].wiring);
    this.notch = s.rotors.map((r) => ROTOR_WIRING[r].notch.charCodeAt(0) - A);
    this.ring = Array.from(s.rings.toUpperCase()).map((c) => c.charCodeAt(0) - A);
    this.pos = Array.from(s.positions.toUpperCase()).map((c) => c.charCodeAt(0) - A);
    this.refl = REFLECTORS[s.reflector] ?? REFLECTORS.B;
    this.plug = Array.from({ length: 26 }, (_, i) => i);
    for (const pair of s.plugboard.toUpperCase().split(/\s+/)) {
      if (pair.length !== 2) continue;
      const x = pair.charCodeAt(0) - A;
      const y = pair.charCodeAt(1) - A;
      if (x < 0 || x > 25 || y < 0 || y > 25) continue;
      this.plug[x] = y;
      this.plug[y] = x;
    }
  }

  /** Right-to-left pass through rotor i. */
  private forward(i: number, c: number): number {
    const shift = this.pos[i] - this.ring[i];
    return (((this.wiring[i].charCodeAt(((c + shift) % 26 + 26) % 26) - A - shift) % 26) + 26) % 26;
  }

  /** Left-to-right (return) pass through rotor i. */
  private backward(i: number, c: number): number {
    const shift = this.pos[i] - this.ring[i];
    const target = String.fromCharCode((((c + shift) % 26 + 26) % 26) + A);
    return (((this.wiring[i].indexOf(target) - shift) % 26) + 26) % 26;
  }

  /**
   * Advance the wheels.  The right wheel always moves.  The middle wheel moves
   * when the right wheel is leaving its notch — and also when the MIDDLE wheel is
   * itself sitting on its notch, dragging the left wheel with it.  That second
   * case is the double step: a mechanical accident of the pawl design that Enigma
   * shipped with for fifteen years.
   */
  step(): void {
    const [left, middle, right] = [0, 1, 2];
    const rightAtNotch = this.pos[right] === this.notch[right];
    const middleAtNotch = this.pos[middle] === this.notch[middle];
    if (middleAtNotch) {
      this.pos[middle] = (this.pos[middle] + 1) % 26;
      this.pos[left] = (this.pos[left] + 1) % 26;
    } else if (rightAtNotch) {
      this.pos[middle] = (this.pos[middle] + 1) % 26;
    }
    this.pos[right] = (this.pos[right] + 1) % 26;
  }

  encryptChar(ch: string): string {
    this.step();
    let c = this.plug[ch.toUpperCase().charCodeAt(0) - A];
    for (const i of [2, 1, 0]) c = this.forward(i, c);
    c = this.refl.charCodeAt(c) - A;
    for (const i of [0, 1, 2]) c = this.backward(i, c);
    return String.fromCharCode(this.plug[c] + A);
  }

  /** The machine is reciprocal: running ciphertext back through it returns plaintext. */
  encrypt(text: string): string {
    let out = '';
    for (const ch of text.toUpperCase()) {
      if (ch >= 'A' && ch <= 'Z') out += this.encryptChar(ch);
    }
    return out;
  }

  get window(): string {
    return this.pos.map((p) => String.fromCharCode(p + A)).join('');
  }
}

export function runEnigma(settings: EnigmaSettings, text: string): string {
  return new Enigma(settings).encrypt(text);
}

/** True when the plugboard string is a valid set of disjoint pairs. */
export function validPlugboard(s: string): boolean {
  const seen = new Set<string>();
  for (const pair of s.toUpperCase().trim().split(/\s+/).filter(Boolean)) {
    if (!/^[A-Z]{2}$/.test(pair) || pair[0] === pair[1]) return false;
    if (seen.has(pair[0]) || seen.has(pair[1])) return false;
    seen.add(pair[0]);
    seen.add(pair[1]);
  }
  return true;
}
