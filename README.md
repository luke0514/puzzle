# A Puzzle for Zosia

A ten-chapter mathematical and cryptographic ARG, built as a static site.

**Easier edition.** From chapter 02 on, every computation runs in the page — no
programming needed — while the answers and the sealed ending are unchanged. The top of
`PUZZLE_MASTER_GUIDE.md` lists exactly what changed.

Every puzzle in it is real. The RSA modulus is a genuine 1024-bit key with a genuine
weakness. The elliptic curve is a genuine curve with a genuine smooth-order base point.
The zeta zeros are genuine zeros. The Enigma is a faithful Enigma I, double step and
all. Nothing is mocked, and `tools/solve.py` re-solves the whole thing from the
published data on every run to prove it.

> **If you are Zosia: stop here.** `PUZZLE_MASTER_GUIDE.md` is a complete spoiler, and
> so is `tools/solve.py`. Neither is served by the website. Go to the site instead.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Building:

```bash
npm run build        # static export into ./out
npm run serve        # serve ./out at http://localhost:8099
```

Verifying — worth doing after any change to the puzzle data:

```bash
pip install sympy mpmath pillow cryptography
npm run verify           # re-solves all ten chapters from src/data (~2 min)
npm run verify:browser   # drives a real browser through the whole game
```

---

## Why a static export

The stack is the one that was asked for — Next.js 14 (App Router), TypeScript, Tailwind,
Framer Motion, KaTeX — but configured with `output: 'export'`, so `npm run build`
produces a plain folder of HTML, CSS and JS with no server component at all.

That is a deliberate choice rather than a fallback:

- **It deploys anywhere.** Vercel, Netlify and GitHub Pages all serve the same `out/`
  directory identically. So does an S3 bucket, or a USB stick.
- **There is no backend to leak.** Answer checking is a SHA-256 comparison in the
  browser; the final message is AES-GCM ciphertext in the bundle. A server would have
  to be trusted, kept alive, and paid for — for a puzzle meant to still work in a year,
  that is a liability, not a feature.
- **It cannot go down.** However long she takes, it will still be there.

The only cost is that a static site can be read. That is addressed below, and it is
addressed honestly: the goal is spoiler resistance, not security.

---

## Deployment

### Vercel

Import the repository. Vercel detects Next.js and reads `vercel.json`. No environment
variables are needed — Vercel serves from the domain root.

```bash
npm i -g vercel && vercel --prod
```

### Netlify

Import the repository; `netlify.toml` sets the command (`npm run build`) and the publish
directory (`out`). No environment variables needed.

```bash
npm i -g netlify-cli && netlify deploy --prod
```

### GitHub Pages

`.github/workflows/deploy.yml` does it on every push to `main`. Enable it once:

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

The one subtlety is that a project site is served from `https://<user>.github.io/<repo>`
rather than from `/`, so every asset URL needs that prefix. The workflow passes it in as
`NEXT_PUBLIC_BASE_PATH` derived from the repository name, and `next.config.mjs` applies
it to `basePath` and `assetPrefix`. `src/lib/paths.ts` applies it to the files in
`public/`. Building for Pages by hand:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build
touch out/.nojekyll     # or Pages will hide the _next/ directory
```

Use a custom domain at the apex and you can drop the base path entirely.

---

## Project layout

```
src/
  app/
    layout.tsx               fonts, metadata, ambient layer, sound toggle
    page.tsx                 the landing page
    globals.css              palette, KaTeX tuning, reduced-motion
    puzzle/page.tsx          the contents page
    puzzle/[chapter]/        one static page per chapter slug
  chapters/
    registry.ts              order, titles, answer digests, hint ladders
    Chapter01.tsx … 10.tsx   chapter content
  components/
    ChapterLayout.tsx        frame, lock, masthead  (+ Epigraph, Panel, Aside)
    PuzzleInput.tsx          the answer field and its verification
    HintSystem.tsx           four earned hints per chapter
    MathBlock.tsx            KaTeX
    ProgressIndicator.tsx    the row of dots
    AmbientBackground.tsx    grid, drifting glyphs, film grain
    ComplexPlane.tsx         chapter 04
    EllipticCurveVisualizer  chapter 05
    EnigmaMachine.tsx        chapter 08
    ArchiveViewer.tsx        chapter 09 (reader, card, lens)
    GaussianPlane.tsx        chapter 02
    RsaWorkbench.tsx         chapter 03
    CurveWorkbench.tsx       chapter 05 (+ Vigenère table)
    PlateReader.tsx          chapter 06
    CycleBuilder.tsx         chapter 07
    LetterTool.tsx           numbers → letters (02, 04)
    Notebook.tsx             her earlier answers (08, 10)
    Workbench.tsx            shared buttons and step layout
    ChapterView.tsx          slug → chapter body
    SoundToggle.tsx          synthesised room tone, off by default
  lib/
    crypto.ts                normalisation, answer hashing, the final unseal
    puzzleState.ts           localStorage progress
    math.ts                  modular arithmetic, Fibonacci, Gaussian, elliptic curves
    enigma.ts                Enigma I
    paths.ts                 base-path-aware asset URLs
    zeta.ts                  |ζ(s)| by Euler–Maclaurin (chapter 04 probe)
    ecdlp.ts                 Pohlig–Hellman + CRT (chapter 05)
    png.ts                   exact PNG decoding (chapter 06)
  data/                      GENERATED — puzzle data, do not hand-edit
public/
  puzzles/                   plate-vii.png, key-03.pub, message-03.enc
tools/
  solve.py                   reference solver / regression suite
  walkthrough.mjs            browser end-to-end test
  dump-data.mjs              reads a generated module as JSON
  generators/                the scripts that produced src/data
```

`src/data/*` is generated. To change any puzzle's numbers, edit the corresponding
script in `tools/generators/`, re-run it, then `npm run generate` to re-emit the
TypeScript, then `npm run verify`.

---

## How the puzzle machinery works

**Answers.** `normalise()` strips diacritics (including `Ł`, which has no NFD
decomposition and needs its own rule), drops everything outside `A–Z0–9`, and
uppercases. So `polska matematyka zmieniła historię` and
`POLSKAMATEMATYKAZMIENILAHISTORIE` are the same answer. The normalised string is
hashed as `SHA-256("zosia/<chapter>/<answer>")` and compared with a digest in
`src/data/sealed.ts`. The answer itself is never in the bundle.

**Unlocking.** Chapter *n* opens when chapter *n−1* is solved. A locked chapter renders
a closed door and never mounts its body, so its data does not reach the DOM.

**Hints.** Four per chapter, from vague to nearly explicit. A hint becomes *earned*
after time on the chapter or after enough wrong answers — but an unearned hint can
still be opened. It says *"Some answers are more satisfying when discovered alone"*
first, and then it opens, because a puzzle that decides for you how much help you
deserve is not respecting you.

**Progress.** One `localStorage` key, exportable as JSON from the contents page.
Nothing is transmitted anywhere; there is no analytics, no backend, no account.

**The seal.** The closing text of Chapter 10 is AES-256-GCM ciphertext. Its key is
PBKDF2-SHA256 (310,000 iterations) over all nine chapter answers *plus* the final
passphrase. Reading the source gets you a base64 blob. There is no code path that
produces the text without the answers, and if GCM authentication fails the page simply
says *"Not that."*

If Chapter 10 is reached on a browser that never solved the earlier chapters — a
different device, cleared storage — it notices, and offers nine fields to type the
recovered sentences back in. Nothing is lost.

**On spoiler resistance.** This is not security. A determined reader with the bundle
and a dictionary could attack the per-chapter digests, and someone who did that would
have worked harder than they would have solving Chapter 01. What is genuinely
protected is the *ending*: the confession never exists in the bundle in any readable
form, and no amount of source-reading assembles it without the nine answers.

---

## Fonts

Cormorant Garamond and IBM Plex Mono are loaded with a stylesheet `<link>` rather than
`next/font`. `next/font` downloads the files at **build** time, which means a build
machine with no route to `fonts.googleapis.com` cannot build the project at all. A link
moves that dependency into the browser, where it degrades to the fallback stack
(Georgia, `ui-monospace`) instead of failing. `optimizeFonts: false` in
`next.config.mjs` keeps the build from trying to fetch and inline the stylesheet.

To self-host instead: drop the `.woff2` files into `src/fonts/`, switch `layout.tsx` to
`next/font/local`, and delete the `<link>` tags.

---

## Accessibility

- Every interactive element is reachable and operable by keyboard. The evasive **NIE**
  button moves on pointer hover only — under keyboard focus it holds still and keeps
  its label, because the joke stops being funny the moment it removes the choice.
- `prefers-reduced-motion` stops the ambient drift, the reveal timing collapses to
  near-instant, and all transitions are disabled globally in `globals.css`.
- Chapter data tables carry captions and scoped headers; the plot has a text-table twin
  right beneath it, because a scatter is not a dataset.
- Text sits at or above WCAG AA against `#060a12` (`#e3eaf4` ≈ 15:1, `#7a8ca4` ≈ 6.4:1).
  The dimmest tones are used only for decoration, never for content.
- Sound is off by default and synthesised in the browser — no files, no autoplay.

## Responsiveness

Optimised for desktop, correct everywhere. Long integers wrap; KaTeX display blocks and
wide tables scroll inside their own containers so the page body never scrolls
horizontally. The Enigma collapses to a single column below `lg`. The browser test
asserts zero horizontal overflow at 390 px.

---

## Adding a chapter

1. Add its message to `MESSAGES` in `tools/generators/ch10.py` and re-run it — this
   regenerates the digests *and* the final passphrase, since the passphrase is derived
   from every chapter message.
2. Append an entry to `CHAPTERS` in `src/chapters/registry.ts`: id, order, slug,
   numeral, title, theme, placeholder, `answerHash: ANSWER_HASHES.chNN`, and four hints.
3. Create `src/chapters/ChapterNN.tsx` — take `Chapter02.tsx` as the template.
4. Register the slug in `BODIES` in `src/components/ChapterView.tsx`.
5. Add a section to `tools/solve.py` and run `npm run verify`.

The route, the lock, the progress dots, the contents page and the hint system all read
from the registry and need no changes.

---

## The documents

- `PUZZLE_MASTER_GUIDE.md` — every solution, every red herring, every hint. **Spoilers.**
- `tools/solve.py` — the same thing as executable code. **Spoilers.**

Neither is reachable from the website; both are in the repository. If you host this
publicly and Zosia might find the repository, keep the site in a separate repository
from these two files.
