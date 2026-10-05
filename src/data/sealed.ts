// GENERATED FILE — produced by tools/generate.py.  Do not edit by hand.

/** Answer digests.  SHA-256('zosia/<id>/<normalised answer>').
 *  These are the only representation of the answers anywhere in the bundle. */
export const ANSWER_HASHES: Record<string, string> = {
  ch01: 'c6415b340c2b3422fcaa4203ef27cd1e2aa8b9089e12ce65c7b4f534591d160f',
  ch02: '10f81a1edc355648d1ea9be2c5fd13f0e6a0687d096e5a39cb73263c2160dee3',
  ch03: '57507a4a379036534e6c893e97167f570df0f7bd80beac7d6d86e183d736d191',
  ch04: '5dd4871718dae2a60d121c4a3e7ea893109f8d9cb3e7d9d4d5cf9dfd1e1ef50e',
  ch05: 'd06576ecfe8659ae5aadcd06fa09baad4008ce75db10550127b7db0c8c8f0381',
  ch06: '5697ff25015feab5739be1de4238eeffbb953c5a7b64f34dad2db13603ba2273',
  ch07: '586824f8ec3e14868a5deb6ce1a79045e58b070dcf94cdea8c06414457755c83',
  ch08: 'fd10fd308c82e06619c03df9dce40fba3619eb025a5a98ec258ede4c222db486',
  ch09: 'f023cb83a05a4405c6888fc1196d49b3c35abb6403c98511a5f31313c0252450',
  ch10: 'e932408eaf40c8ef5bd6919bec61ca7ee4d03fdcf25d42bdb709451869e78d83',
};

/** The closing text of Chapter 10, sealed under AES-256-GCM.
 *  The key is PBKDF2-SHA256 over all nine answers plus the final passphrase,
 *  so this blob is inert until the puzzle has actually been solved. */
export const SEALED = {
  salt: 'bQxzy/FEkVrd6P8dirYYcg==',
  iv: '9PktzAa/HlTZfevQ',
  ciphertext: '6IVKl60WpAbfsa51oviffbGTtk5Y3NFNnIV5gOiSdzNBYS0mfZDDnlLV0G9zDKQOZfYGyN7PeSzoDUfHbcind8AASnJ/mKVRtV9jrZzpJnHMKGBNwaq2N73UVs6oi62jot3x2nMo82gTMJRk2idpoFbh+QEuyM2naC6yxod8pALx9m01rjru8iu03+q9JvlCe+7+fxtTl8gdg3y3GW+ayZwG',
  iterations: 310000,
};
