import type { Metadata, Viewport } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import AmbientBackground from '@/components/AmbientBackground';
import SoundToggle from '@/components/SoundToggle';

/**
 * Fonts are linked rather than bundled through `next/font`, deliberately.
 *
 * `next/font` downloads the files at BUILD time, which means a build machine with no
 * route to fonts.googleapis.com — an offline laptop, a locked-down CI runner — cannot
 * build this project at all.  A stylesheet link moves that dependency to the browser,
 * where it degrades to the fallback stack instead of failing.
 *
 * To self-host instead: drop the .woff2 files into src/fonts, swap this for
 * `next/font/local`, and delete the two <link> tags below.  See README.
 */

export const metadata: Metadata = {
  title: 'A Puzzle for Zosia',
  description: 'There is no time limit. Every answer leads somewhere.',
  robots: { index: false, follow: false },
  other: {
    // 2, 3, 5, 7, 11, 13, 17, 19, 23 — the ninth prime is where the archive is.
    'x-sequence': '2 3 5 7 11 13 17 19 23',
  },
};

export const viewport: Viewport = {
  themeColor: '#060a12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
        />
      </head>
      {/*
        F(0) = 0, F(1) = 1.  The rest follows, and so does everything else here.
        Nothing on this page requires reading its source. Everything on it rewards it.
      */}
      <body className="min-h-screen bg-ink-900 font-mono text-parchment antialiased">
        <AmbientBackground />
        <div className="relative z-10">{children}</div>
        <SoundToggle />
      </body>
    </html>
  );
}
