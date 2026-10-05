'use client';

/**
 * Small shared pieces for the step-by-step workbenches (chapters 03 and 05) and the
 * other in-page tools, so every chapter's tooling looks like it came from the same desk.
 */

export function ActionButton({
  children,
  onClick,
  disabled = false,
  busy = false,
  pressed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  /** For toggles: the currently chosen option is lit rather than greyed out. */
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-pressed={pressed}
      className={`border px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest2 transition-colors hover:border-steel-dim hover:text-signal disabled:cursor-not-allowed disabled:opacity-35 ${
        pressed ? 'border-steel-dim bg-steel/10 text-signal' : 'border-ink-600 text-steel'
      }`}
    >
      {busy ? '···' : children}
    </button>
  );
}

export function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="border-b border-ink-700 px-5 py-5 last:border-b-0">
      <div className="flex items-baseline gap-4">
        <span
          className={`tnum shrink-0 font-mono text-[11px] ${done ? 'text-signal' : 'text-ink-500'}`}
          aria-hidden
        >
          {done ? '✓' : String(n).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-mono text-[11px] uppercase tracking-widest2 text-haze">{title}</h4>
          <div className="mt-3 font-mono text-[12px] leading-relaxed text-parchment/85">{children}</div>
        </div>
      </div>
    </li>
  );
}

export function Bench({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="my-10 border border-ink-600 bg-ink-850/40">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest2 text-steel-dim">{title}</h3>
        {note && <span className="font-mono text-[10px] text-ink-500">{note}</span>}
      </div>
      <ol>{children}</ol>
    </section>
  );
}

/** A long integer, wrapped in groups so it never widens the page. */
export function LongNumber({ value }: { value: string }) {
  const groups = value.match(/.{1,10}/g) ?? [value];
  return (
    <span className="tnum block break-all font-mono text-[11.5px] leading-[1.8] text-parchment/80">
      {groups.map((g, i) => (
        <span key={`${g}-${i}`} className="mr-2 inline-block">
          {g}
        </span>
      ))}
    </span>
  );
}

/** The labelled value row used inside steps. */
export function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="font-mono text-[10px] uppercase tracking-widest2 text-ink-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
