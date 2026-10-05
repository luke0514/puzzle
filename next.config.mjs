/**
 * Static export.  The whole ARG is client-side, so `output: "export"` produces a
 * plain folder of HTML/JS that Vercel, Netlify and GitHub Pages all serve identically.
 *
 * GitHub Pages serves project sites from /<repo>, so set
 *   NEXT_PUBLIC_BASE_PATH=/a-puzzle-for-zosia
 * before building for that target.  Vercel and Netlify need nothing.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Next tries to fetch and inline the Google Fonts stylesheet at build time.  That
  // makes the build depend on network reachability for a purely cosmetic gain, and it
  // fails loudly on offline or allowlisted CI.  The browser fetches it perfectly well.
  optimizeFonts: false,
};

export default nextConfig;
