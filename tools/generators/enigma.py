"""Enigma I (Wehrmacht/Heer, 3 rotors + reflector + plugboard), historically accurate.

Conventions used throughout:
  * rotors are listed LEFT to RIGHT, i.e. ["III", "I", "II"] means III is the slow
    (leftmost) wheel and II is the fast (rightmost) wheel next to the entry disc.
  * ring settings and positions are given in the same left-to-right order.
  * stepping happens BEFORE the key is encrypted, and includes the double-step anomaly.
"""

A = ord('A')

ROTORS = {
    'I':   ('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q'),
    'II':  ('AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E'),
    'III': ('BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V'),
    'IV':  ('ESOVPZJAYQUIRHXLNFTGKDCMWB', 'J'),
    'V':   ('VZBRGITYUPSDNHLXAWMJQOFECK', 'Z'),
}
REFLECTORS = {
    'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
    'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
}


class Enigma:
    def __init__(self, rotors, rings, positions, plugboard='', reflector='B'):
        """rotors/rings/positions are left-to-right; rings and positions are 'AAA' style."""
        self.order = list(rotors)
        self.wiring = [ROTORS[r][0] for r in self.order]
        self.notch = [ord(ROTORS[r][1]) - A for r in self.order]
        self.ring = [ord(c) - A for c in rings]
        self.pos = [ord(c) - A for c in positions]
        self.refl = REFLECTORS[reflector]
        self.plug = {c: c for c in range(26)}
        for pair in plugboard.split():
            if not pair:
                continue
            x, y = ord(pair[0]) - A, ord(pair[1]) - A
            self.plug[x], self.plug[y] = y, x

    # --- rotor traversal -------------------------------------------------
    def _fwd(self, i, c):
        """Right-to-left pass through rotor i (index 0 = leftmost)."""
        shift = self.pos[i] - self.ring[i]
        return (ord(self.wiring[i][(c + shift) % 26]) - A - shift) % 26

    def _bwd(self, i, c):
        shift = self.pos[i] - self.ring[i]
        return (self.wiring[i].index(chr((c + shift) % 26 + A)) - shift) % 26

    def _step(self):
        """Right rotor always steps.  Middle steps on its own notch (double step)
           or when the right rotor is at its notch."""
        right, middle, left = 2, 1, 0
        at_right_notch = self.pos[right] == self.notch[right]
        at_middle_notch = self.pos[middle] == self.notch[middle]
        if at_middle_notch:                       # double-stepping anomaly
            self.pos[middle] = (self.pos[middle] + 1) % 26
            self.pos[left] = (self.pos[left] + 1) % 26
        elif at_right_notch:
            self.pos[middle] = (self.pos[middle] + 1) % 26
        self.pos[right] = (self.pos[right] + 1) % 26

    def encrypt_char(self, ch):
        self._step()
        c = self.plug[ord(ch) - A]
        for i in (2, 1, 0):
            c = self._fwd(i, c)
        c = ord(self.refl[c]) - A
        for i in (0, 1, 2):
            c = self._bwd(i, c)
        return chr(self.plug[c] + A)

    def encrypt(self, text):
        return ''.join(self.encrypt_char(c) for c in text if c.isalpha())


def machine(rotors, rings, positions, plugboard='', reflector='B'):
    return Enigma(rotors, rings, positions, plugboard, reflector)


if __name__ == '__main__':
    # Standard regression vector: rotors I II III, rings AAA, ground AAA, no plugs.
    # 'AAAAAAAAAAAAAAAAAAAAAAAAA' -> 'BDZGOWCXLTKSBTMCDLPBMUQOF'
    e = machine(['I', 'II', 'III'], 'AAA', 'AAA')
    got = e.encrypt('A' * 25)
    print('vector 1:', got, got == 'BDZGOWCXLTKSBTMCDLPBMUQOF')

    # Reciprocity: encrypting the ciphertext with identical settings returns the plaintext.
    e1 = machine(['III', 'I', 'II'], 'PRI', 'THE', 'AV BS CG DL FU HZ IN KM OW RX')
    ct = e1.encrypt('YOUARECLOSERTHANYOUTHINK')
    e2 = machine(['III', 'I', 'II'], 'PRI', 'THE', 'AV BS CG DL FU HZ IN KM OW RX')
    print('vector 2:', ct, e2.encrypt(ct) == 'YOUARECLOSERTHANYOUTHINK')

    # Double-step check: from ADU the middle wheel must advance twice in a row.
    e3 = machine(['I', 'II', 'III'], 'AAA', 'ADU')
    seen = []
    for _ in range(4):
        e3.encrypt_char('A')
        seen.append(''.join(chr(p + A) for p in e3.pos))
    print('double step:', seen, seen == ['ADV', 'AEW', 'BFX', 'BFY'])
