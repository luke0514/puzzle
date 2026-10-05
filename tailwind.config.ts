import type { Config } from 'tailwindcss';

/**
 * Palette: a cold, near-black blue.  Nothing here is brighter than it needs to be —
 * the page should read as a document photographed in a dark room.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04070C', // deepest, used behind modals
          900: '#060A12', // page background
          850: '#091019', // raised surfaces
          800: '#0D1520', // cards
          700: '#15202E', // hairlines on raised surfaces
          600: '#1C2A3C', // borders
          500: '#2A3B52',
        },
        parchment: '#E3EAF4',   // primary text
        haze: '#7A8CA4',        // muted text
        steel: '#87A7CE',       // subtle accent
        'steel-dim': '#3E5878', // accent, dimmed
        signal: '#B4CBE6',      // the brightest thing on the site
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.32em',
        widest3: '0.5em',
      },
      keyframes: {
        driftIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseFaint: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        driftIn: 'driftIn 900ms cubic-bezier(0.16,1,0.3,1) both',
        pulseFaint: 'pulseFaint 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
