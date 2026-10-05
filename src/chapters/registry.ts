import { ANSWER_HASHES } from '@/data/sealed';

/**
 * Chapter metadata and hint ladders.  Content lives in the per-chapter components;
 * this file is only the spine — order, titles, answer digests, hints.
 *
 * Adding a chapter means: append an entry here, add a Chapter11.tsx, register it in
 * components.ts, and add its digest to src/data/sealed.ts.  Nothing else.
 */

export interface Hint {
  level: 1 | 2 | 3 | 4;
  text: string;
  /** Minutes on the chapter after which the hint may be opened without a warning. */
  afterMinutes: number;
  /** ...or this many wrong answers, whichever comes first. */
  afterAttempts: number;
}

export interface ChapterMeta {
  id: string;
  order: number;
  slug: string;
  numeral: string;
  title: string;
  /** The one-line theme shown under the title. */
  theme: string;
  /** Placeholder in the answer field — never a hint about the content. */
  placeholder: string;
  answerHash: string;
  hints: Hint[];
  /** Chapters whose answers this one consumes.  Shown as a dependency note. */
  dependsOn?: number[];
  status: 'implemented' | 'partial';
}

const LADDER: Array<Pick<Hint, 'afterMinutes' | 'afterAttempts'>> = [
  { afterMinutes: 12, afterAttempts: 3 },
  { afterMinutes: 60, afterAttempts: 8 },
  { afterMinutes: 240, afterAttempts: 16 },
  { afterMinutes: 720, afterAttempts: 28 },
];

/** Chapters 02 onward (the easier edition): help arrives within minutes, not hours. */
const EASY_LADDER: Array<Pick<Hint, 'afterMinutes' | 'afterAttempts'>> = [
  { afterMinutes: 3, afterAttempts: 1 },
  { afterMinutes: 8, afterAttempts: 2 },
  { afterMinutes: 15, afterAttempts: 4 },
  { afterMinutes: 25, afterAttempts: 6 },
];

const hints = (
  texts: [string, string, string, string],
  ladder: Array<Pick<Hint, 'afterMinutes' | 'afterAttempts'>> = LADDER,
): Hint[] => texts.map((text, i) => ({ level: (i + 1) as 1 | 2 | 3 | 4, text, ...ladder[i] }));

const easyHints = (texts: [string, string, string, string]): Hint[] => hints(texts, EASY_LADDER);

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'ch01',
    order: 1,
    slug: 'the-beginning',
    numeral: '01',
    title: 'THE BEGINNING',
    theme: 'The Matrix That Remembers',
    placeholder: 'four words',
    answerHash: ANSWER_HASHES.ch01,
    status: 'implemented',
    hints: hints([
      'The question printed at the top of the page is not the question you are being asked. Read the page again and separate what is argument from what is data.',
      'The search is described as having failed, and it did. A failed search still leaves a record behind it. Ask what the record contains that the conclusion does not.',
      'Fifteen rows, and the answer is fifteen letters long. Every row already carries a number far larger than twenty-six. Reduce it.',
      'Sort the rows by the run column rather than by p. For each row take α(p) mod 26 and read the result as a letter of the alphabet with A = 0.',
    ]),
  },
  {
    id: 'ch02',
    order: 2,
    slug: 'the-mirror',
    numeral: '02',
    title: 'THE MIRROR',
    theme: 'Two Faces of a Prime',
    placeholder: 'four words',
    answerHash: ANSWER_HASHES.ch02,
    status: 'implemented',
    hints: easyHints([
      'Press the first button. Every prime splits into two numbers, a and b, and from then on everything you need is on the page.',
      'There are only four things to try: order by size or by angle, then send column a or column b. Try all four — three of them are gibberish.',
      'The chapter says plainly that size is the wrong order. Order by angle.',
      'Order by angle, send column a to the letter tool, and read the four words.',
    ]),
  },
  {
    id: 'ch03',
    order: 3,
    slug: 'the-broken-key',
    numeral: '03',
    title: 'THE BROKEN KEY',
    theme: 'A Modulus With a History',
    placeholder: 'five words',
    answerHash: ANSWER_HASHES.ch03,
    status: 'implemented',
    hints: easyHints([
      'The workbench on this page does all the arithmetic. Start at step 1 and press each button in turn.',
      'Step 2 takes a couple of seconds — it is walking about 2.6 million steps. Let it finish before moving on.',
      'After step 5 the sentence is printed in full. Type it into the answer field; spaces do not matter.',
      'If a step will not press, the one before it has not finished. Everything is in order, from step 1 to step 5.',
    ]),
  },
  {
    id: 'ch04',
    order: 4,
    slug: 'the-zeroes',
    numeral: '04',
    title: 'THE ZEROES',
    theme: 'Points That Only Look Alike',
    placeholder: 'three words',
    answerHash: ANSWER_HASHES.ch04,
    status: 'implemented',
    dependsOn: [],
    hints: easyHints([
      'Use the table under the plot. Press "measure |ζ| everywhere", and every point gets a number. The zeros say 0.',
      'Then "keep only the zeros" and "order by Im(s)". You should be left with twenty-three rows, lowest first.',
      'Send the Im(s) column to the letter tool. It throws away the decimals, takes the remainder after dividing by 26, and reads A = 0.',
      'Measure everywhere → keep only the zeros → order by Im(s) → send the Im(s) column. Three words.',
    ]),
  },
  {
    id: 'ch05',
    order: 5,
    slug: 'the-curve',
    numeral: '05',
    title: 'THE CURVE',
    theme: 'A Logarithm That Should Have Been Hard',
    placeholder: 'four words',
    answerHash: ANSWER_HASHES.ch05,
    status: 'implemented',
    hints: easyHints([
      'Work through the workbench from step 1 to step 4. Each button needs the one before it.',
      'Step 4 prints an eleven-letter word. That word is the key, not the answer.',
      'Type the key into the Vigenère table underneath. The plaintext appears as you type.',
      'The key is the word from step 4; the plaintext is four English words run together.',
    ]),
  },
  {
    id: 'ch06',
    order: 6,
    slug: 'the-image',
    numeral: '06',
    title: 'THE IMAGE',
    theme: 'A Plate That Is Also a File',
    placeholder: 'four words',
    answerHash: ANSWER_HASHES.ch06,
    status: 'implemented',
    hints: easyHints([
      'Press "open plate-vii.png as a file" and read the four lines of text that appear. One of them, 1/8, means one bit out of every eight.',
      'The bit to read is the finest one — bit 0, the least significant, at the right-hand end of the slider.',
      'With bit 0 selected, try each colour in turn and press "read this plane as text". Two colours give noise.',
      'Blue, bit 0. The sentence is Polish; type it with or without the accents.',
    ]),
  },
  {
    id: 'ch07',
    order: 7,
    slug: 'the-polish-connection',
    numeral: '07',
    title: 'THE POLISH CONNECTION',
    theme: 'Cycles That Do Not Care About the Plugboard',
    placeholder: 'one word',
    answerHash: ANSWER_HASHES.ch07,
    status: 'implemented',
    hints: easyHints([
      'You do not need the cycles to answer this chapter — they are the story of how it was broken. The question is in the last paragraph.',
      'The machine was used by the German army; the Polish mathematicians broke it in 1932; the British continued the work at Bletchley Park.',
      'It is the most famous cipher machine in history. There is even a 2001 film about Bletchley Park with exactly that name.',
      'It starts with E and ends with A, and in Greek it means a riddle.',
    ]),
  },
  {
    id: 'ch08',
    order: 8,
    slug: 'the-machine',
    numeral: '08',
    title: 'THE MACHINE',
    theme: 'Four Questions, Three Unanswered',
    placeholder: 'six words',
    answerHash: ANSWER_HASHES.ch08,
    dependsOn: [1, 2, 3],
    status: 'implemented',
    hints: easyHints([
      'Your earlier answers are shown in the notebook on this page. The rules underneath turn them into the three missing settings.',
      'Ring setting and starting position are just the first three different letters of the chapter 02 and chapter 03 sentences.',
      'For the wheels: the first three different letters of chapter 01 are L, O, K. Their places in the alphabet, counting from one, are 12, 15 and 11.',
      'Wheels III, I, II from the left. Rings P R I. Starting positions T H E. Reflector B and plugboard as already set. The intercept is already in the input.',
    ]),
  },
  {
    id: 'ch09',
    order: 9,
    slug: 'the-library',
    numeral: '09',
    title: 'THE LIBRARY',
    theme: 'Coordinates Into a Body of Text',
    placeholder: 'five words',
    answerHash: ANSWER_HASHES.ch09,
    status: 'implemented',
    hints: easyHints([
      'Click the first entry on the card. The lens underneath shows you the exact word it points to.',
      'From each word take only its first letter, and keep the entries in the order the card lists them.',
      'If the first few letters are not starting to spell an English word, check the lens: lines and words are both counted from one.',
      'Twenty-six first letters, in card order, make five words — and they tell you what to do in the last chapter.',
    ]),
  },
  {
    id: 'ch10',
    order: 10,
    slug: 'the-question',
    numeral: '10',
    title: 'THE QUESTION',
    theme: '—',
    placeholder: 'thirty-six letters',
    answerHash: ANSWER_HASHES.ch10,
    status: 'implemented',
    hints: easyHints([
      'The nine sentences are listed just above the key field. Nothing else is needed.',
      'From each word take only the first letter. A sentence like "ONE SMALL STEP" would give O S S.',
      'Go in chapter order, 01 to 09, and do not skip any word — a one-word sentence still gives one letter.',
      'All thirty-six first letters, run together with no spaces. The counter under the field tells you when you have thirty-six.',
    ]),
  },
];

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id);

export function chapterBySlug(slug: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

export function chapterByOrder(order: number): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.order === order);
}
