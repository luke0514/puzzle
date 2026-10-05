/**
 * Public asset URLs.
 *
 * Chapter pages live at /puzzle/<slug>/, so a relative href like "./puzzles/x.png"
 * resolves against that directory and 404s.  Everything under public/ must therefore
 * be referenced from the site root — and prefixed with the base path, because
 * GitHub Pages serves project sites from /<repo> rather than from /.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
