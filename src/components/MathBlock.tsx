'use client';

import katex from 'katex';
import { useMemo } from 'react';

/**
 * KaTeX wrapper.  Rendering is deterministic, so it can happen during render
 * without any hydration risk, and display blocks are given their own horizontally
 * scrollable box — a 1024-bit modulus must never be allowed to widen the page.
 */

interface Props {
  children: string;
  display?: boolean;
  className?: string;
  /** Accessible description; falls back to the raw TeX, which screen readers read badly. */
  label?: string;
}

export default function MathBlock({ children, display = false, className = '', label }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: false,
        macros: {
          '\\Z': '\\mathbb{Z}',
          '\\C': '\\mathbb{C}',
          '\\R': '\\mathbb{R}',
          '\\F': '\\mathbb{F}',
          '\\ord': '\\operatorname{ord}',
          '\\lcm': '\\operatorname{lcm}',
          '\\Legendre': '\\left(\\frac{#1}{#2}\\right)',
        },
      });
    } catch {
      return `<code>${children.replace(/</g, '&lt;')}</code>`;
    }
  }, [children, display]);

  if (display) {
    return (
      <div
        className={`my-5 overflow-x-auto overflow-y-hidden ${className}`}
        role="math"
        aria-label={label ?? children}
      >
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }
  return (
    <span
      className={className}
      role="math"
      aria-label={label ?? children}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Inline shorthand, so chapter prose stays readable in the source. */
export function M({ children }: { children: string }) {
  return <MathBlock>{children}</MathBlock>;
}
