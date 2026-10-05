/**
 * Puzzle state.  Everything lives in localStorage under a single key so the whole
 * run can be exported, inspected or wiped in one move.
 *
 * The shape is deliberately verbose — timestamps, attempt counts, which hints were
 * spent — because the point of a months-long puzzle is that you can come back to it
 * and see where you were.
 */

export const STORAGE_KEY = 'zosia.progress.v1';

export interface ChapterProgress {
  /** Set the first time the chapter page is opened; drives the time-gated hints. */
  openedAt?: number;
  solvedAt?: number;
  /** Normalised answer, kept so Chapter 10 can rebuild the final key offline. */
  answer?: string;
  /** The answer exactly as it was typed (spaces, accents), for the notebook in 08 and 10. */
  typed?: string;
  attempts: number;
  /** Indices of hints the solver chose to spend. */
  hints: number[];
  /** Free-form discoveries a chapter can record (metadata found, checks passed). */
  clues: string[];
}

export interface PuzzleState {
  version: 1;
  startedAt: number;
  lastSeenAt: number;
  chapters: Record<string, ChapterProgress>;
  /** Set once the closing text has been unsealed; never stores the text itself. */
  finished?: number;
  /** 'tak' | 'nie' — recorded, and changeable, because the answer is hers. */
  reply?: 'tak' | 'nie';
  soundOn?: boolean;
}

const blankChapter = (): ChapterProgress => ({ attempts: 0, hints: [], clues: [] });

export function emptyState(): PuzzleState {
  return { version: 1, startedAt: Date.now(), lastSeenAt: Date.now(), chapters: {} };
}

export function loadState(): PuzzleState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as PuzzleState;
    if (parsed?.version !== 1 || typeof parsed.chapters !== 'object') return emptyState();
    return parsed;
  } catch {
    // Private browsing, disabled storage, corrupted JSON — all recover to a fresh run
    // rather than a broken page.
    return emptyState();
  }
}

export function saveState(state: PuzzleState): void {
  if (typeof window === 'undefined') return;
  try {
    state.lastSeenAt = Date.now();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('zosia:state'));
  } catch {
    /* storage unavailable: the session still works, it just will not persist */
  }
}

export function chapterOf(state: PuzzleState, id: string): ChapterProgress {
  return state.chapters[id] ?? blankChapter();
}

export function isSolved(state: PuzzleState, id: string): boolean {
  return Boolean(state.chapters[id]?.solvedAt);
}

export function mutate(id: string, fn: (c: ChapterProgress) => void): PuzzleState {
  const state = loadState();
  const chapter = state.chapters[id] ?? blankChapter();
  fn(chapter);
  state.chapters[id] = chapter;
  saveState(state);
  return state;
}

export function markOpened(id: string): void {
  const state = loadState();
  if (!state.chapters[id]?.openedAt) {
    mutate(id, (c) => {
      c.openedAt = Date.now();
    });
  }
}

/** Chapter n is reachable once chapter n-1 is solved.  Chapter 01 is always open. */
export function isUnlocked(state: PuzzleState, order: number, ids: string[]): boolean {
  if (order <= 1) return true;
  return isSolved(state, ids[order - 2]);
}

export function furthestUnlocked(state: PuzzleState, ids: string[]): number {
  let n = 1;
  while (n < ids.length && isSolved(state, ids[n - 1])) n += 1;
  return n;
}

export function resetAll(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('zosia:state'));
  } catch {
    /* nothing to do */
  }
}

export function exportState(): string {
  return JSON.stringify(loadState(), null, 2);
}

export function importState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as PuzzleState;
    if (parsed?.version !== 1) return false;
    saveState(parsed);
    return true;
  } catch {
    return false;
  }
}
