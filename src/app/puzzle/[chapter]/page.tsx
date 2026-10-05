import { notFound } from 'next/navigation';
import { CHAPTERS } from '@/chapters/registry';
import ChapterView from '@/components/ChapterView';

/** One static page per chapter slug. */
export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapter: c.slug }));
}

export const dynamicParams = false;

export default function ChapterPage({ params }: { params: { chapter: string } }) {
  const meta = CHAPTERS.find((c) => c.slug === params.chapter);
  if (!meta) notFound();
  return <ChapterView slug={params.chapter} />;
}
