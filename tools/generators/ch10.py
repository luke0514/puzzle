# -*- coding: utf-8 -*-
"""Chapter 10: derive the final passphrase from the nine chapter messages and encrypt
   the closing text with AES-256-GCM under a PBKDF2 key.

   Everything here mirrors, byte for byte, what the browser does with WebCrypto:
     key  = PBKDF2-HMAC-SHA256(password, salt, 310000 iterations, 32 bytes)
     ct   = AES-GCM(key, iv, plaintext-utf8)   with a 16-byte tag appended
   password = the nine normalised answers joined by '|', then '|', then the passphrase.
"""
import hashlib, json, os, unicodedata
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MESSAGES = [
    "LOOK AT THE MIRROR",
    "PRIMES HAVE TWO FACES",
    "THE KEY WAS NEVER RANDOM",
    "SEARCH BETWEEN DIMENSIONS",
    "NOT EVERYTHING IS FLAT",
    "POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ",
    "ENIGMA",
    "YOU ARE CLOSER THAN YOU THINK",
    "THE FIRST LETTER OF EVERYTHING",
]

FINAL_PL = (
    "Przeczytanie tej wiadomości oznacza, że rozwiązałaś tę zagadkę.\n"
    "Gratulacje.\n"
    "Naprawdę bardzo cię lubię.\n"
    "Czy zostaniesz moją dziewczyną?"
)

# Ł / ł have no canonical decomposition, so they need an explicit rule.
STROKE = {'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'Ø': 'O', 'ø': 'o'}


def normalise(s: str) -> str:
    s = ''.join(STROKE.get(c, c) for c in s)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return ''.join(c for c in s.upper() if c.isalnum() and c.isascii())


# --- the passphrase: the first letter of every word, in order ---------------
passphrase = ''.join(normalise(w)[0] for m in MESSAGES for w in m.split())
print("passphrase:", passphrase, f"({len(passphrase)} letters)")

answers = [normalise(m) for m in MESSAGES]
for i, a in enumerate(answers, 1):
    print(f"  ch{i:02d} normalised: {a}")

password = ('|'.join(answers) + '|' + passphrase).encode('utf-8')
salt = hashlib.sha256(b'a-puzzle-for-zosia/salt/v1').digest()[:16]
iv = hashlib.sha256(b'a-puzzle-for-zosia/iv/v1').digest()[:12]
key = hashlib.pbkdf2_hmac('sha256', password, salt, 310000, 32)
ct = AESGCM(key).encrypt(iv, FINAL_PL.encode('utf-8'), None)

# round-trip
assert AESGCM(key).decrypt(iv, ct, None).decode('utf-8') == FINAL_PL
print("\nAES-GCM round-trip OK;", len(ct), "bytes of ciphertext")

import base64
payload = {
    "salt": base64.b64encode(salt).decode(),
    "iv": base64.b64encode(iv).decode(),
    "ciphertext": base64.b64encode(ct).decode(),
    "iterations": 310000,
}

# --- per-chapter answer hashes (salted with the chapter id) -----------------
hashes = {}
for i, a in enumerate(answers, 1):
    cid = f"ch{i:02d}"
    hashes[cid] = hashlib.sha256(f"zosia/{cid}/{a}".encode()).hexdigest()
hashes["ch10"] = hashlib.sha256(f"zosia/ch10/{normalise(passphrase)}".encode()).hexdigest()

json.dump({"passphrase": passphrase, "answers": answers, "payload": payload,
           "hashes": hashes, "final": FINAL_PL},
          open('/home/claude/gen/ch10_final.json', 'w'), indent=1, ensure_ascii=False)
print("\nhashes:")
for k, v in hashes.items():
    print(" ", k, v)
