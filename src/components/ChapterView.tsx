'use client';

import dynamic from 'next/dynamic';
import { CHAPTERS } from '@/chapters/registry';

/**
 * Slug → chapter body.  Each body is loaded on demand, which keeps the landing page
 * light and, more usefully, keeps a chapter's data out of the bundle a solver is
 * looking at until they have actually reached it.
 */

const Loading = () => <div className="min-h-screen" aria-busy="true" />;

const BODIES: Record<string, React.ComponentType> = {
  'the-beginning': dynamic(() => import('@/chapters/Chapter01'), { loading: Loading }),
  'the-mirror': dynamic(() => import('@/chapters/Chapter02'), { loading: Loading }),
  'the-broken-key': dynamic(() => import('@/chapters/Chapter03'), { loading: Loading }),
  'the-zeroes': dynamic(() => import('@/chapters/Chapter04'), { loading: Loading }),
  'the-curve': dynamic(() => import('@/chapters/Chapter05'), { loading: Loading }),
  'the-image': dynamic(() => import('@/chapters/Chapter06'), { loading: Loading }),
  'the-polish-connection': dynamic(() => import('@/chapters/Chapter07'), { loading: Loading }),
  'the-machine': dynamic(() => import('@/chapters/Chapter08'), { loading: Loading }),
  'the-library': dynamic(() => import('@/chapters/Chapter09'), { loading: Loading }),
  'the-question': dynamic(() => import('@/chapters/Chapter10'), { loading: Loading }),
};

export default function ChapterView({ slug }: { slug: string }) {
  const Body = BODIES[slug];
  const meta = CHAPTERS.find((c) => c.slug === slug);
  if (!Body || !meta) return null;
  return <Body />;
}
