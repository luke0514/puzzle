import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] tracking-widest3 text-ink-500">404</p>
      <p className="mt-8 font-serif text-[26px] italic text-haze">
        There is nothing at this address.
      </p>
      <p className="mt-4 font-mono text-[12px] text-ink-500">
        Which is not the same as there being nothing.
      </p>
      <Link
        href="/"
        className="mt-10 font-mono text-[11px] uppercase tracking-widest2 text-steel-dim underline underline-offset-[6px] hover:text-steel"
      >
        Back to the title
      </Link>
    </main>
  );
}
