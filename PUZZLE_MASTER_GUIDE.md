# PUZZLE MASTER GUIDE

**Complete spoilers for every chapter. This file is for the creator only.**
It is not served by the website — `next build` only exports what is under `src/app`.
If you host the site publicly and Zosia might find the repository, keep this file and
`tools/solve.py` in a separate, private repository.

---

## Contents

- [Easier edition — what changed](#easier-edition--what-changed)
- [The shape of the thing](#the-shape-of-the-thing)
- [Answer table](#answer-table)
- [Chapter 01 — The Beginning](#chapter-01--the-beginning)
- [Chapter 02 — The Mirror](#chapter-02--the-mirror)
- [Chapter 03 — The Broken Key](#chapter-03--the-broken-key)
- [Chapter 04 — The Zeroes](#chapter-04--the-zeroes)
- [Chapter 05 — The Curve](#chapter-05--the-curve)
- [Chapter 06 — The Image](#chapter-06--the-image)
- [Chapter 07 — The Polish Connection](#chapter-07--the-polish-connection)
- [Chapter 08 — The Machine](#chapter-08--the-machine)
- [Chapter 09 — The Library](#chapter-09--the-library)
- [Chapter 10 — The Question](#chapter-10--the-question)
- [Difficulty and pacing](#difficulty-and-pacing)
- [If she gets stuck](#if-she-gets-stuck)
- [Regenerating the puzzle data](#regenerating-the-puzzle-data)

---

## Easier edition — what changed

Chapters 02–10 were reworked so that no programming is needed: every heavy computation
now runs in the browser, on the page, behind a button. Chapter 01 is unchanged.

**What did not change:** every answer, every piece of puzzle data in `src/data/` and
`public/puzzles/`, the answer digests, and the sealed closing text. Progress saved on the
old version is still valid, and `npm run verify` passes untouched. The chapter-by-chapter
sections further down describe the *mathematics*, which is the same; where they say a
tool "will not" do something, the easier edition now does it.

| # | What she does now | Tool (file) |
|---|-------------------|-------------|
| 02 | Split the primes, try size/angle × column a/b, read the one combination that is English | `GaussianPlane.tsx`, `LetterTool.tsx` |
| 03 | Press five steps in order; the Fermat walk takes under a second | `RsaWorkbench.tsx` |
| 04 | Measure \|ζ\| everywhere, keep the zeros, order by height, send to the letter tool | `ComplexPlane.tsx` (`PlaneTable`), `lib/zeta.ts` |
| 05 | Four workbench steps produce the key `HWTGKNXQZWN`; she types it into the Vigenère table | `CurveWorkbench.tsx`, `lib/ecdlp.ts` |
| 06 | Open the file, read the metadata, pick channel and bit, read the plane as text | `PlateReader.tsx`, `lib/png.ts` |
| 07 | One button builds AD/BE/CF and shows the paired cycles; the closing line points plainly at the machine's name | `CycleBuilder.tsx` |
| 08 | Her chapter 01–03 answers are shown on the page; the three rules are written out with an A = 1 table | `Notebook.tsx` |
| 09 | Click each card entry; the lens shows the line with every word numbered and the target lit | `ArchiveViewer.tsx` (`Lens`) |
| 10 | The instruction is stated plainly, the nine sentences are listed, a counter shows n / 36 | `Notebook.tsx`, `Chapter10.tsx` |

**Small decisions are still hers.** Chapter 02 has four orderings and only one reads;
chapter 05's last step is typing the key; chapter 06 needs the right channel and bit;
chapter 08 needs the three rules applied by hand; chapter 09 needs the first letters
written down in order; chapter 10 needs the 36 letters assembled.

**Hints** for chapters 02–10 were rewritten for the new pages and use a faster ladder
(`EASY_LADDER` in `registry.ts`: earned after 3 / 8 / 15 / 25 minutes, or 1 / 2 / 4 / 6
wrong answers). Chapter 01 keeps the original ladder. No hint spells out an earlier
chapter's answer, so the bundle still contains no answer in plain text.

**Fixed along the way.** The archive reader's hover numbers were wrong for any word
that appeared twice on a line (it used the first occurrence); words are now numbered by
position. The chapter 04 plot header overflowed by 7 px at phone width. Chapter 07's
second hint said the doubled letters were six steps apart; they are three.

**Accuracy of the new tools.** The ζ evaluator (Euler–Maclaurin, double precision) agrees
with mpmath to about eleven digits on all 53 points: genuine zeros come out below 10⁻¹²,
the closest impostor at 0.026. The PNG reader decodes the file itself rather than going
through a canvas, so colour management cannot flip a bit. `npm run verify:browser` now
drives every tool and checks that each one produces its chapter's sentence.

**Expected time, easier edition:** roughly 10–40 minutes per chapter, an evening or two
in total after chapter 01.

---

## The shape of the thing

Nine chapters each yield an English (once, Polish) sentence. Those nine sentences are
the key material for the tenth. The final passphrase is *the first letter of every word
of all nine messages, in order* — which is exactly what Chapter 09's own message tells
you to do. Chapter 09 is therefore both a puzzle and the instruction manual for the
ending.

The confession is never present in the bundle as text. It is AES-256-GCM ciphertext
whose key is PBKDF2 over all nine answers plus that passphrase. There is no code path
that produces it early.

The disguise holds because every message is a statement about mathematics or history —
*look at the mirror*, *primes have two faces*, *the key was never random* — and only in
Chapter 08 does one of them (*you are closer than you think*) start to sound like it
might be about her. By then she is eight chapters in.

**Chain of dependencies**

```
01 ─┐
02 ─┼──► 08  (rotor order, ring setting, ground setting)
03 ─┘
04, 05, 06, 07, 09  standalone
01…09 ─────────────► 10  (all nine messages → passphrase → AES key)
```

---

## Answer table

| # | Chapter | Answer | Method |
|---|---------|--------|--------|
| 01 | The Beginning | `LOOK AT THE MIRROR` | rank of apparition mod 26, read in run order |
| 02 | The Mirror | `PRIMES HAVE TWO FACES` | `p = a²+b²`, sorted by `arg(a+bi)`, `a mod 26` |
| 03 | The Broken Key | `THE KEY WAS NEVER RANDOM` | Fermat factorisation (or reconstruct `p` from φ) |
| 04 | The Zeroes | `SEARCH BETWEEN DIMENSIONS` | keep true zeros, `⌊γ⌋ mod 26` in γ order |
| 05 | The Curve | `NOT EVERYTHING IS FLAT` | Pohlig–Hellman → `k` → base-26 Vigenère key |
| 06 | The Image | `POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ` | LSB of the blue channel, UTF-8 |
| 07 | The Polish Connection | `ENIGMA` | Rejewski cycle structure + historical deduction |
| 08 | The Machine | `YOU ARE CLOSER THAN YOU THINK` | Enigma I, settings from chapters 01–03 |
| 09 | The Library | `THE FIRST LETTER OF EVERYTHING` | book cipher, folio·line·word, first letter |
| 10 | The Question | `LATMPHTFTKWNRSBDNEIFPMZHEYACTYTTFLOE` | first letter of every word of 01–09 |

Input is normalised, so spacing, case and diacritics never matter.

---

## Chapter 01 — The Beginning

**Concepts.** Linear recurrences as matrix powers; the Fibonacci Q-matrix; the
multiplicative order of a matrix in `GL₂(F_p)`; Pisano periods; rank of apparition;
quadratic reciprocity via the Legendre symbol `(5/p)`; the Wall–Sun–Sun problem.

**The apparent question (red herring).** The page frames a search for a Wall–Sun–Sun
prime: a prime with `A^α(p) ≡ I (mod p²)`, equivalently `p² | F_{α(p)}`. This is a
genuinely open problem with no known solution. The page says outright that the search
returned fifteen negatives and that she is not being asked to settle it — the honesty
is deliberate, because a puzzle whose answer is an open problem is a wall, not a door.

**The actual question.** The table of tested candidates *is* the payload. Fifteen rows,
fifteen letters. The redirect is carried by three signals:

1. the epigraph — *"You may recognise the sequence. That is not enough."*
2. the aside — *"I have never been able to throw away a record of the order in which I
   did something."*
3. the closing line — *"What the search produced is a different matter, and it is four
   words long."*

**The step most people miss.** The table is displayed sorted by `p` **ascending**, but
each row carries a `run` column. Reading in `p` order gives `LEIOMKORAROTRTH` — visibly
not English, which is the nudge. Reading in `run` order gives the message.

**Extraction.** For each row, `α(p) mod 26`, `A = 0`.

| run | p | α(p) | mod 26 | letter |
|-----|---|------|--------|--------|
| 01 | 420857 | 210429 | 11 | L |
| 02 | 437543 | 145848 | 14 | O |
| 03 | 518261 | 259130 | 14 | O |
| 04 | 466787 | 466788 | 10 | K |
| 05 | 484459 | 484458 | 0 | A |
| 06 | 575417 | 287709 | 19 | T |
| 07 | 533909 | 133477 | 19 | T |
| 08 | 645661 | 161415 | 7 | H |
| 09 | 435763 | 435764 | 4 | E |
| 10 | 447983 | 49776 | 12 | M |
| 11 | 437389 | 218694 | 8 | I |
| 12 | 573557 | 95593 | 17 | R |
| 13 | 478433 | 239217 | 17 | R |
| 14 | 473507 | 52612 | 14 | O |
| 15 | 498973 | 249487 | 17 | R |

**Self-consistency she can check.** In every row `α(p) | p − (5/p)` and
`π(p)/α(p) ∈ {1,2,4}`. Both hold. It costs her ten minutes to confirm the table is
real, which is what earns the table her trust.

**Why `α` and not `π`.** Both columns are given. `π(p) mod 26` produces noise. Trying
both is one line of code, so this is not cruelty — it is the smallest possible fork.

**Hints.** I → the framing question is not the question. II → a failed search still
leaves a record. III → fifteen rows, fifteen letters, reduce the numbers.
IV → run order, `α(p) mod 26`, `A = 0`.

---

## Chapter 02 — The Mirror

**Concepts.** Gaussian integers `Z[i]`; the norm `N(a+bi) = a²+b²`; Fermat's two-square
theorem and the *uniqueness* of the representation; splitting of primes `≡ 1 (mod 4)`;
`arg(a+bi)` as a second coordinate.

**Structure.** Eighteen primes, all `≡ 1 (mod 4)`, printed in ascending numeric order.
Each has exactly one `0 < a < b` with `a² + b² = p`. Sort by `arg(a+bi) = arctan(b/a)`,
ascending, then take `a mod 26` (the smaller component) with `A = 0`.

| arg | p | a | b | a mod 26 | letter |
|-----|---|---|---|----------|--------|
| 0.7872 | 1439909 | 847 | 850 | 15 | P |
| 0.8300 | 1993973 | 953 | 1042 | 17 | R |
| 0.8732 | 743837 | 554 | 661 | 8 | I |
| 0.9164 | 1091737 | 636 | 829 | 12 | M |
| 0.9597 | 1627849 | 732 | 1045 | 4 | E |
| 1.0037 | 439217 | 356 | 559 | 18 | S |
| 1.0472 | 1726693 | 657 | 1138 | 7 | H |
| 1.0907 | 621097 | 364 | 699 | 0 | A |
| 1.1340 | 1964549 | 593 | 1270 | 21 | V |
| 1.1778 | 1202569 | 420 | 1013 | 4 | E |
| 1.2219 | 937661 | 331 | 910 | 19 | T |
| 1.2650 | 1872769 | 412 | 1305 | 22 | W |
| 1.3088 | 572777 | 196 | 731 | 14 | O |
| 1.3523 | 743933 | 187 | 842 | 5 | F |
| 1.3959 | 1428593 | 208 | 1177 | 0 | A |
| 1.4392 | 652837 | 106 | 801 | 2 | C |
| 1.4831 | 877213 | 82 | 933 | 4 | E |
| 1.5270 | 1011961 | 44 | 1005 | 18 | S |

**The fair clue.** The arguments are almost perfectly evenly spaced across the octant
`(π/4, π/2)` — steps of about 0.0435 radians. Anyone who plots the eighteen points sees
a clean fan rather than a random scatter, and that regularity is the confirmation that
angle is the intended axis. It was constructed that way on purpose.

**A dead end worth knowing about.** `b − a` is always odd, since `p` is odd forces `a`
and `b` to have opposite parity. So `(b−a) mod 26` can never produce an even letter
index and any attempt to read the message that way collapses within a few letters. If
she reports "half the alphabet is unreachable", she has found this, and hint III is the
right nudge.

**Prose cues.** *"It tells you how large they are. It tells you nothing else, and this
chapter is not about size."* / *"Sorting is a choice. Every ordering is a claim about
what matters."*

**Hints.** I → all `≡ 1 mod 4`, Fermat 1640. II → one decomposition each, two numbers,
different jobs. III → the plane, and the angle. IV → sort by argument, `a mod 26`.

---

## Chapter 03 — The Broken Key

**Concepts.** RSA; `φ(n) = (p−1)(q−1)`; modular inversion; Fermat factorisation; the
consequences of a non-random prime generator.

**The key.** Real, 1024-bit, `e = 65537`. It was built as:

```python
p = nextprime(floor(φ · 2^511))        # φ = (1+√5)/2, the golden ratio
q = nextprime(p + 2^268)
n = p · q
```

`|p − q| ≈ 2²⁶⁹`.

**Two independent attacks — both intended.**

*Route A — Fermat factorisation.* Write `n = a² − b²`, start at `a = ⌈√n⌉`, step up
until `a² − n` is a perfect square. Because `|p−q|` is small relative to `n`, this
converges in **2,592,223 iterations** — about four seconds of Python with
`math.isqrt`, and instant in anything compiled. It is enough work that a solver who
tries fifty iterations and gives up will wrongly conclude Fermat does not apply, which
is the intended small trap; it is not enough work to be unfair.

*Route B — reconstruct the prime.* The chapter title is *A Modulus With a History* and
the aside says the second route "costs you no arithmetic and one idea, and the idea is
somewhere in the first chapter of this puzzle." Chapter 01 is Fibonacci; Fibonacci is
φ; `nextprime(⌊φ · 2⁵¹¹⌋)` **is** `p`, exactly. This is the elegant path and it is the
one that makes the recovered message land.

Then `d = e⁻¹ mod φ(n)`, `m = c^d mod n`, and read `m` as big-endian ASCII.

**Encoding.** Textbook RSA, no padding, stated openly on the page: 24 ASCII bytes as a
single integer. The absence of padding is not sloppiness, it is a decision — OAEP would
have added a chapter's worth of implementation detail for no puzzle value.

**Downloads.** `public/puzzles/key-03.pub` and `message-03.enc`, both with the encoding
documented in a header comment.

**Red herring.** The prose spends a paragraph on protocol-level attacks — reused
nonces, oracles, interaction — and explicitly rules them out. This is to stop a
CTF-trained solver from hunting for a side channel that does not exist.

**Hints.** I → look at `n`. II → the two factors may not be far apart. III → Fermat,
and it takes a few million steps. IV → the golden ratio, spelled out.

---

## Chapter 04 — The Zeroes

**Concepts.** Analytic continuation; the critical strip; nontrivial zeros; numerical
evaluation of ζ. **Not** the Riemann Hypothesis — the page says so explicitly, because
requiring an open problem would be a wall.

**Structure.** 53 plotted points. 23 are genuine zeros. There are two distinct kinds of
impostor, and this is the design:

- **17 geometric impostors** — real part exactly `1/2`, ordinate not a zero. They fail
  only a numerical test. She must actually evaluate ζ.
- **13 positional impostors** — genuine zero ordinates, but real part offset by
  `±0.017` to `±0.047`. They fail visually, *if* she turns the magnification up. At 1×
  they are indistinguishable, which is the chapter's thesis: *the eye is not an
  instrument*.

The magnification slider (1×–400×) exists precisely so she can find the second class
without any numerics, and then discover that removing them is not sufficient.

**Extraction.** Keep the true zeros. Sort by γ ascending. Take `⌊γ⌋ mod 26`, `A = 0`.

The 23 zeros, by index in the standard ordering:

```
 index   gamma        floor  mod 26  letter        index   gamma        floor  mod 26  letter
 ρ40     122.946828    122      18     S           ρ257    481.830339    481     13     N
 ρ46     134.756510    134       4     E           ρ287    523.960530    523      3     D
 ρ56     156.112909    156       0     A           ρ290    528.406213    528      8     I
 ρ65     173.411536    173      17     R           ρ293    532.688181    532     12     M
 ρ71     184.874467    184       2     C           ρ306    550.970010    550      4     E
 ρ74     189.416158    189       7     H           ρ312    559.316237    559     13     N
 ρ85     209.576509    209       1     B           ρ315    564.160879    564     18     S
 ρ165    342.054877    342       4     E           ρ327    580.136959    580      8     I
 ρ174    357.151301    357      19     T           ρ332    586.742772    586     14     O
 ρ228    438.621738    438      22     W           ρ350    611.774210    611     13     N
 ρ233    446.860622    446       4     E           ρ392    668.975849    668     18     S
 ρ251    472.799174    472       4     E
```

Read down the left column and then the right: `SEARCH BETWEEN DIMENSIONS`.

**Tooling she needs.** `mpmath.zeta`, PARI/GP, or Odlyzko's published zero tables. All
free, all mentioned on the page by name so the chapter is not a tool-hunting exercise.

**A copyable table** sits directly under the plot, because a scatter is not a dataset
and making her read coordinates off pixels would be hostile.

**Hints.** I → 53 points, not 53 zeros. II → two kinds of impostor. III → keep the real
ones, order by γ. IV → `⌊γ⌋ mod 26`.

---

## Chapter 05 — The Curve

**Concepts.** Short Weierstrass form over `F_p`; the chord-and-tangent group law; Hasse's
bound; order of a point; Pohlig–Hellman; CRT; baby-step giant-step; Vigenère.

**Parameters.**

```
p = 4503599627370517                     (49-bit prime)
a = 325226669238624
b = 1521433895935949
G = (772972818079027, 935087405066506)
Q = (628325962653195, 922503171340480)
```

**The weakness.** `ord(G) = 1125899915898850 = 2 · 5² · 47 · 71 · 107 · 859 · 73417`.
Entirely smooth — the largest prime factor is 73,417. `G` was constructed by taking a
random point and multiplying by the cofactor, so the base point lives in a deliberately
smooth subgroup.

**The intended attack.**
1. Find `ord(G)` — BSGS across the Hasse interval `[p+1−2√p, p+1+2√p]` needs about
   2¹⁴ point operations, then reduce prime by prime. Seconds.
2. Factor it. Trivial.
3. Pohlig–Hellman: solve `k mod q^e` in each of the seven prime-power subgroups by
   BSGS (largest is 73,417, so ~271 steps), recombine by CRT.

`k = 1111637910023901`.

**Why naive brute force is punished but not blocked.** BSGS on the full subgroup needs
`√(1.13 × 10¹⁵) ≈ 3.4 × 10⁷` steps — minutes to hours in Python, and a lot of memory —
so a solver who skips step 1 feels the difference immediately. That is the lesson of
the chapter, delivered as friction rather than as a lecture.

**Final step.** `k` in base 26, digits mapped `0 = A`, gives the Vigenère key
`HWTGKNXQZWN`. Decrypt `UKMKFROOSDVUCBYPYXJ` → `NOTEVERYTHINGISFLAT`.

**Deliberately withheld.** The on-page calculator does scalar multiplication and
point-on-curve checks and nothing else. It will not compute an order and it will not
invert anything, and it says so.

**Hints.** I → one number relates G and Q. II → compute the order, then factor it.
III → Pohlig–Hellman, spelled out. IV → base 26, Vigenère.

---

## Chapter 06 — The Image

**Concepts.** LSB steganography; PNG ancillary chunks; the difference between an image
and a file.

**The payload.** `public/puzzles/plate-vii.png`, 1400 × 900, 24-bit RGB.
`POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ` encoded as UTF-8, NUL-terminated, MSB-first
within each byte, one bit per pixel in the **blue** channel's LSB, row-major from the
top-left. 36 bytes; the payload ends 288 pixels into the first row.

**Deliberate design choices.**
- A whisper of `±2` grain was added to every pixel *before* embedding, so the LSB plane
  is not suspiciously flat in the untouched region. A perfectly uniform bit plane is a
  giveaway that changes the puzzle from "find the method" to "notice the anomaly".
- Only the blue channel carries data, so a bit-plane view of red or green shows noise
  and a bit-plane view of blue shows a visible band across the top. That band is the
  reward for the standard first move.

**Metadata clues** (visible to `exiftool`, `exiv2`, `pngcheck`):

| field | value | meaning |
|-------|-------|---------|
| `Title` | `Nocne niebo nad Poznaniem` | forward pointer to Chapter 07 — Rejewski studied in Poznań |
| `Author` | `M.R.` | Marian Rejewski |
| `Comment` | `1/8` | one bit of every eight |
| `Creation Time` | `1932-12-31T23:59:00` | atmosphere; the Bureau received its first Enigma material in December 1932 |

**Tooling.** Python + Pillow, or ImageMagick, or `zsteg`. The page lists them. Nothing
proprietary is required and the page says so, so she does not go hunting for a licence.

**Recovery, minimal:**
```python
from PIL import Image
px = Image.open('plate-vii.png').convert('RGB').load()
bits = ''.join(str(px[x, y][2] & 1) for y in range(900) for x in range(1400))
data = bytes(int(bits[i:i+8], 2) for i in range(0, 4000, 8))
print(data.split(b'\x00')[0].decode('utf-8'))
```

**Diacritics.** `Ł` and `Ę` are genuine UTF-8 in the payload. Input normalisation maps
`Ł → L` explicitly (it has no NFD decomposition) and strips the ogonek from `Ę`, so she
can type it any way she likes.

**Hints.** I → the file, not the picture. II → read the metadata. III → one bit of
eight, one channel. IV → blue, LSB, row-major, UTF-8.

---

## Chapter 07 — The Polish Connection

**Concepts.** The 1930s doubled-indicator procedure; permutation composition; cycle
decomposition; Rejewski's theorem on cycle structure; plugboard invariance.

**The data.** 78 six-letter groups, all enciphered at one ground setting. Each is a
three-letter message key typed twice. The underlying configuration is rotors II·III·I,
rings AAA, ground RTZ, plugboard `AH BL CX DI ER FK GU NP OQ TY`, reflector B. The 78
keys include a covering design so that all three permutations are fully determined —
26 keys chosen so every letter appears once in every position, plus 52 more for
realism.

**The method.** Positions (1,4), (2,5), (3,6) give permutations `AD`, `BE`, `CF`.
Decompose each into cycles.

**The theorem.** Each of `AD`, `BE`, `CF` is a product of two reciprocal permutations
(products of 13 transpositions), and such a product always decomposes into cycles that
come in **pairs of equal length**. Moreover conjugating by the plugboard permutes the
letters within cycles but cannot change the lengths — so the multiset of cycle lengths
is invariant under all ~10¹⁴ plugboard settings. That is the door: the plugboard, the
part everyone had written off as intractable, turns out to contribute nothing to the
quantity you measure.

**The characteristic for this data.**

```
AD:  13 + 13                      → half-multiset [13]
BE:  2 + 2 + 3 + 3 + 8 + 8        → half-multiset [2, 3, 8]
CF:  13 + 13                      → half-multiset [13]
```

Every length pairs, exactly as the theorem requires. The on-page **self-check** widget
accepts any separators and confirms `13 / 2 3 8 / 13`. It is a mirror, not a hint: it
verifies work she has already done, so she can build Chapter 08 on solid ground. It is
not the chapter's answer field.

**The answer.** `ENIGMA` — the machine, not the man. Deduced from the accumulated
signals: Chapter 06's Polish sentence, the metadata pointing at Poznań and "M.R.", the
1932 date, the historical paragraph, and the closing line: *"You are not being asked
for his name. You are being asked for the name of the thing he broke — the six letters
that were on the front of the machine."*

**Design note.** `ENIGMA` is guessable, and that is deliberate. The gate here is soft
because the real work lives next door in Chapter 08, which cannot be touched without
having actually understood the machine. A hard gate here would have produced a wall
with a guessable door beside it.

**Hints.** I → the doubling is the mistake. II → build the three permutations.
III → the pairing theorem, and Poznań 1932. IV → the machine, six letters.

---

## Chapter 08 — The Machine

**Concepts.** Enigma I; wheel order, ring setting, ground setting, reflector,
plugboard; the double-stepping anomaly; reciprocity; the no-fixed-point weakness.

**The intercept.** `OLQVJSHBEPPJZIOMFGEARAWB` (24 letters).

**Given on the key sheet.** Reflector `B`; plugboard `AV BS CG DL FU HZ IN KM OW RX`.

**Withheld — and derived from chapters 01, 02, 03.** The rule is stated on the page as a
riddle: *"Take the first three distinct letters of each of the messages from chapters
01, 02 and 03. Two of those triples are settings exactly as they stand. The third is
not letters at all: there are five wheels, the alphabet begins at one, and you are
counting round."*

| source | message | first 3 distinct | becomes |
|--------|---------|------------------|---------|
| Ch 01 | `LOOK AT THE MIRROR` | L, O, K | `((12,15,11) mod 5) + 1 = 3,1,2` → **III, I, II** (left to right) |
| Ch 02 | `PRIMES HAVE TWO FACES` | P, R, I | Ringstellung **PRI** |
| Ch 03 | `THE KEY WAS NEVER RANDOM` | T, H, E | Grundstellung **THE** |

Note the alphabet is indexed from **one** (`A = 1`), which the riddle states. With
`A = 0` you get wheels II, V, I and 24 letters of noise — the single fork in this
chapter, and it is signposted.

**Decryption.** The machine is reciprocal, so running the intercept back through it
with the correct settings yields `YOUARECLOSERTHANYOUTHINK`. There is no partial
credit: wrong settings give noise, not near-misses.

**Implementation notes** (`src/lib/enigma.ts`, `tools/generators/enigma.py`).
Verified against the canonical regression vector — rotors I II III, rings AAA, ground
AAA, no plugs, 25 × `A` → `BDZGOWCXLTKSBTMCDLPBMUQOF` — and against the double-step
sequence from ground `ADU`: `ADV, AEW, BFX, BFY`. Both are asserted in the generator's
`__main__` block. Getting the double step wrong is the classic bug; it only shows up in
messages longer than ~26 letters, which is why the intercept is 24 letters and the
regression vector is 25.

**Search space.** 60 wheel orders × 26³ rings × 26³ grounds ≈ 1.1 × 10¹². Stated on the
page so the derivation route is obviously the intended one.

**Hints.** I → three things missing, all written down earlier. II → the first letters of
earlier sentences. III → which triple does what. IV → the arithmetic, fully worked.

---

## Chapter 09 — The Library

**Concepts.** Book cipher; indexing conventions; search-space arithmetic.

**The archive.** Fourteen folios, 2,010 words over 161 numbered lines, written as a
research diary. Every folio is thematically tied to a chapter she has already solved —
MS-A-01 is the Q-matrix, MS-D-04 is the two-square theorem, MS-E-05 is the RSA key,
MS-I-09 is Rejewski, MS-J-10 is the machine. This is what makes the archive feel earned
rather than padded, and it is also camouflage for the two folios that matter:

- **MS-M-13 — "Indexing, and other quiet conventions"** states the counting rules
  outright: everything from one, lines as printed, a word is a whitespace-delimited run
  with its punctuation attached. It also delivers the thematic line: *"The secret, if
  there is one, was never in the archive. It was in which coordinates somebody chose to
  write down."*
- **MS-N-14 — "Last entry before the question"** is the emotional hinge. It admits the
  length is the argument, says the last step is not mathematical, and gives the
  instruction for Chapter 10 in advance: *"The key is not hidden. It is distributed.
  Take everything you have recovered and read only the beginnings."*

**The concordance.** A loose card with 26 entries of the form `FOLIO · LINE · WORD`.
The fourth coordinate — which letter of the word — is constant and therefore omitted,
which the chapter says outright. It is the **first** letter, and the resulting sentence
is self-confirming.

The 26 coordinates were chosen to spread across all fourteen folios (one or two entries
each) so that no single folio can be ignored and so that the archive reads as genuinely
load-bearing.

**Verification for the creator** — the first four entries:

| entry | coordinate | word | letter |
|-------|-----------|------|--------|
| 1 | MS-B-02 · 14 · 2 | `that` | T |
| 2 | MS-E-05 · 11 · 15 | `history.` | H |
| 3 | MS-C-03 · 4 · 14 | `exist` | E |
| 4 | MS-A-01 · 7 · 15 | `from` | F |

**Why brute force is not a route.** The 26 coordinates address a space of roughly
2,010²⁶ ≈ 10⁸⁶ orderings, and the archive is far too small to contain a second
26-letter sentence that reads as English. She confirms the scheme by getting English
out of it, not by exhausting anything.

**Affordance.** Hovering any word in the reader shows its word number, so the
convention can be *checked* rather than assumed. This removes the one genuinely unfair
failure mode of book ciphers — an off-by-one in a convention nobody stated.

**Hints.** I → the card is the puzzle. II → the fourth coordinate is constant.
III → the counting convention. IV → first letters, and the sentence is the next
instruction.

---

## Chapter 10 — The Question

**The passphrase.** The first letter of every word of all nine messages, in chapter
order, run together:

```
Ch01  LOOK AT THE MIRROR                    →  L A T M
Ch02  PRIMES HAVE TWO FACES                 →  P H T F
Ch03  THE KEY WAS NEVER RANDOM              →  T K W N R
Ch04  SEARCH BETWEEN DIMENSIONS             →  S B D
Ch05  NOT EVERYTHING IS FLAT                →  N E I F
Ch06  POLSKA MATEMATYKA ZMIENIŁA HISTORIĘ   →  P M Z H
Ch07  ENIGMA                                →  E
Ch08  YOU ARE CLOSER THAN YOU THINK         →  Y A C T Y T
Ch09  THE FIRST LETTER OF EVERYTHING        →  T F L O E

LATMPHTFTKWNRSBDNEIFPMZHEYACTYTTFLOE      (36 letters)
```

**The seal.** AES-256-GCM. Key = PBKDF2-HMAC-SHA256, 310,000 iterations, over
`answer₁|answer₂|…|answer₉|passphrase` (each normalised). Salt and IV are fixed and
stored alongside the ciphertext. GCM authentication means a wrong key produces a
decryption failure, not garbage — so the page can honestly say *"Not that."*

**Recovery path.** If she reaches Chapter 10 on a browser that never solved the earlier
chapters, the page detects the missing answers and offers nine fields to retype the
recovered sentences. Nothing is lost to a cleared cache or a new laptop.

**The sequence.**
1. *There is no final equation.* — 2.1 s pause
2. *There is no final cipher.* — 2.1 s
3. *There is only one question.* — 2.1 s, then a rule
4. The six-line preamble, 1.25 s apart
5. 2.6 s, then the passphrase field
6. On success: a 3.4 s pause on a single pulsing dot
7. The Polish text, one line at a time, 1.5 s apart
8. 7.5 s after that, `TAK` and `NIE`

Under `prefers-reduced-motion` the whole thing collapses to near-instant. The hint panel
is hidden from the pause onward — nothing there needs a hint.

**TAK / NIE.** `NIE` drifts a little on pointer hover, and every third dodge it briefly
relabels itself `¬TAK`, `∅`, `Undefined` or `⊥`. It gets tired: the amplitude decays
over five dodges and it then more or less settles. It **never** becomes unclickable, it
**never** moves under keyboard focus, and it always reverts to `NIE` when focused.

- `TAK` → *"Then perhaps this was the correct answer all along."*
- `NIE` → *"Then the puzzle still gave me something worth keeping: you solved it."*

Both are recorded, and there is a quiet **change your answer** link under either. The
answer is hers, including the right to change it, and the site must not argue.

---

## Difficulty and pacing

*This table describes the original edition. For the easier edition, see the top of this
file.*

| # | Expected time | Hardest step | Failure mode to watch for |
|---|---------------|--------------|---------------------------|
| 01 | 3–10 h | realising the log is the payload | reading in `p` order and giving up |
| 02 | 2–8 h | ordering by argument | `(b−a) mod 26`, which parity forbids |
| 03 | 1–5 h | suspecting the generator | abandoning Fermat after fifty iterations |
| 04 | 4–12 h | two impostor classes | assuming the zoom test is sufficient |
| 05 | 4–15 h | measuring the group first | naive BSGS on the whole subgroup |
| 06 | 1–4 h | choosing the channel | red or green first — costs minutes, not hours |
| 07 | 3–10 h | constructing the permutations | trying to break the plugboard |
| 08 | 2–8 h | the `A = 1` indexing | `A = 0`, giving wheels II·V·I |
| 09 | 4–12 h | recognising the scheme | off-by-one on word numbering |
| 10 | 15 min–2 h | it is already written down | overthinking after nine hard chapters |

Total, working alone: **a few weeks to a few months**. The ramp is deliberate — 01
teaches that the frame lies, 02 teaches that ordering is information, 03 teaches that
provenance is a weakness, and everything after that builds on those three habits.

---

## If she gets stuck

The hint system is designed to carry this and should be the first answer. All four
levels of every chapter are openable at any time — unearned hints ask once, then open.
Point her at the **Assistance** panel rather than explaining anything yourself; hint IV
is nearly explicit everywhere and will unblock any chapter.

If she is stuck for weeks on one chapter and has not opened the hints, the graceful
move is to say something like *"there's a hints panel at the bottom of every chapter,
and I meant it to be used."* That is in-character — the site already says
*"Some answers are more satisfying when discovered alone"* and then lets her open it
anyway.

Watch for the specific failure modes in the table above. Most of them are recoverable
with a single sentence that does not spoil anything.

---

## Regenerating the puzzle data

Everything in `src/data/` is generated. To change a puzzle:

```bash
pip install sympy mpmath pillow cryptography

python tools/generators/ch01.py         # scans primes (slow, ~2 min)
python tools/generators/ch01_select.py  # picks and orders the fifteen
python tools/generators/ch02.py
python tools/generators/ch03.py
python tools/generators/ch04.py         # computes zeta zeros (slow, ~5 min)
python tools/generators/ch05.py
python tools/generators/ch06.py         # writes public/puzzles/plate-vii.png
python tools/generators/ch07.py
python tools/generators/ch09.py
python tools/generators/ch10.py         # digests + the sealed payload

npm run generate                        # emit src/data/*.ts
npm run verify                          # re-solve everything
npm run verify:browser                  # and play it
```

Each generator asserts its own correctness and refuses to write a file it cannot verify.

**If you change any chapter's message**, you must re-run `ch10.py`: the digests *and*
the final passphrase are both derived from the full set of messages, and the sealed
payload is keyed on all of them.

**If you change the archive text** in `tools/generators/folios.py`, re-run `ch09.py` —
the concordance coordinates are computed from the text and will otherwise point at the
wrong words.

**To change the closing message**, edit `FINAL_PL` in `tools/generators/ch10.py` and
re-run it, then `npm run generate`. The plaintext exists only in that one file and in
the ciphertext.
