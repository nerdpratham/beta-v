// ─── SIXDX DESIGN TOKENS ─────────────────────────────────────────────────────
// Single source of truth for all typography, colour, and spacing values.
//
// HOW TO USE
//   import { fonts, colors, textStyles } from '@/styles/tokens'
//   style={{ ...textStyles.h2, color: colors.ink }}
//
// HOW TO EDIT
//   • Fonts     → change the string in `fonts`
//   • Colours   → change the hex / rgba in `colors`
//   • Type scale → change values inside `textStyles`
//   All consuming components pick up the change automatically — no search-replace needed.
//
// Figma source file: ZY9szUlXcExFPsFmCtPfQU
// Extracted 2025 — matches local Figma text + colour styles exactly.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// ── 1. FONT FAMILIES
// ═══════════════════════════════════════════════════════════════════════════════

export const fonts = {
  /** Display / heading typeface — Marund */
  marund: 'Marund, sans-serif',
  /** Body / UI typeface — Helvetica Neue */
  hn: 'HelveticaNeue, "Helvetica Neue", Helvetica, Arial, sans-serif',
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── 2. COLOUR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════

export const colors = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  /** Primary orange — Figma: Brand 1 */
  brand1:   '#CC4D22',
  /** Gold accent — Figma: Brand 2 */
  brand2:   '#E1A853',
  /** Warm tint — Figma: Brand/Sec */
  brandSec: '#FCF4F2',

  // ── Content ────────────────────────────────────────────────────────────────
  /** Primary text / dark — Figma: Content/Primary */
  ink:   '#1C0B05',
  /** Inverted / white — Figma: Inverted */
  white: '#FFFFFF',
  /** Near-black site background */
  bgDark: '#0a0a0a',

  // ── Alpha variants (ink) ───────────────────────────────────────────────────
  /** ink at 50% — feature body text */
  ink50:  'rgba(28,11,5,0.50)',
  /** ink at 60% — secondary descriptions */
  ink60:  'rgba(28,11,5,0.60)',
  /** ink at 5%  — badge backgrounds */
  ink05:  'rgba(28,11,5,0.05)',
  /** ink at 10% — subtle borders */
  ink10:  'rgba(28,11,5,0.10)',

  // ── Alpha variants (white) ─────────────────────────────────────────────────
  /** white at 70% — dimmed text on dark bg */
  white70: 'rgba(255,255,255,0.70)',
  /** white at 60% — secondary on dark */
  white60: 'rgba(255,255,255,0.60)',
  /** white at 50% — muted on dark */
  white50: 'rgba(255,255,255,0.50)',
  /** white at 30% — placeholder text */
  white30: 'rgba(255,255,255,0.30)',
  /** white at 25% — dividers / track backgrounds */
  white25: 'rgba(255,255,255,0.25)',
  /** white at 8%  — glass input backgrounds + borders */
  white08: 'rgba(255,255,255,0.08)',

  // ── Overlays ───────────────────────────────────────────────────────────────
  /** Black 40% — contact section bg overlay */
  overlay40: 'rgba(0,0,0,0.40)',
  /** Black 50% — WhatWeCreate / Hero image overlays */
  overlay50: 'rgba(0,0,0,0.50)',
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── 3. TYPOGRAPHY SPACING PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════
// Edit values here — textStyles below references them, so one change
// propagates to every component that spreads a textStyle.
//
// lineHeights   — controls how tall each line of text is (unitless multiplier)
// letterSpacing — tightness / looseness between individual characters
// wordSpacing   — extra gap added between each word (on top of the font default)
// paragraphGap  — vertical space between consecutive text blocks / paragraphs
// ─────────────────────────────────────────────────────────────────────────────

export const lineHeights = {
  /** Hero / display — very tight, for big impactful numbers */
  display:  0.8,
  /** Section headings — snug */
  heading:  1.0,
  /** h2 tight variant (slightly compressed) */
  headingTight: 0.9,
  /** Subtitles, feature titles — comfortable mid-line */
  subhead:  1.32,
  /** Body paragraphs — relaxed for readability */
  body:     1.4,
  /** Labels / captions — compact */
  label:    1.28,
} as const

export const letterSpacings = {
  /** Hero display — very wide pull-in */
  display:  '-0.07em',
  /** Primary headings */
  h1:       '-0.04em',
  /** Secondary headings */
  h2:       '-0.06em',
  /** Large body / callouts + subtitles */
  subhead:  '-0.03em',
  /** Body text — no adjustment */
  body:     '0em',
  /** UI elements (nav, buttons, labels) — slight pull-in */
  ui:       '-0.01em',
} as const

export const wordSpacings = {
  /** Default — same as browser normal */
  normal: 'normal',
  /** Slightly open — good for large display text */
  wide:   '0.04em',
} as const

// Vertical gap between paragraphs / stacked text blocks (in px)
export const paragraphGap = {
  /** 4 px — between a label and the element it describes */
  xs:  4,
  /** 12 px — between two tightly related lines */
  sm:  12,
  /** 20 px — body paragraph spacing */
  md:  20,
  /** 32 px — between a heading and its body copy */
  lg:  32,
  /** 48 px — between major content blocks */
  xl:  48,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── 4. TEXT STYLES  (assembled from primitives above)
// ═══════════════════════════════════════════════════════════════════════════════
// Rules:
//   • Display sizes (h0–h2) use clamp() for fluid responsive scaling.
//   • Body sizes (h3–body) use fixed rem — small enough not to need fluid scaling.
//   • No `color` here — set at call-site so styles work on dark + light sections.
//   • `margin: 0` resets browser defaults; override at call-site only if needed.
//
// Figma type scale:
//   h0  — Marund 155.25px / -7% tracking / 80% lh
//   h1  — Marund 60px     / -4% tracking / 100% lh
//   h2  — Marund 60px     / -6% tracking / 90% lh
//   h3  — HN    36px      / -3% tracking / 100% lh
//   h4  — HN    22.65px   / -3% tracking / 132% lh
//   body — HN   14px      /  0% tracking / 140% lh
// ─────────────────────────────────────────────────────────────────────────────

export const textStyles = {

  /** h0 — Hero / full-screen display. Responsive: ~6rem → 155.25px */
  h0: {
    fontFamily:    fonts.marund,
    fontSize:      'clamp(3.5rem, 10vw, 9.703rem)',
    letterSpacing: letterSpacings.display,
    lineHeight:    lineHeights.display,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    fontStyle:     'normal',
    margin:        0,
  } satisfies CSSProperties,

  /** h1 — Section primary heading. Responsive: ~2rem → 60px */
  h1: {
    fontFamily:    fonts.marund,
    fontSize:      'clamp(2rem, 4.5vw, 3.75rem)',
    letterSpacing: letterSpacings.h1,
    lineHeight:    lineHeights.heading,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    fontStyle:     'normal',
    margin:        0,
  } satisfies CSSProperties,

  /** h2 — Section secondary heading. Responsive: ~2rem → 60px */
  h2: {
    fontFamily:    fonts.marund,
    fontSize:      'clamp(2rem, 4.5vw, 3.75rem)',
    letterSpacing: letterSpacings.h2,
    lineHeight:    lineHeights.headingTight,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    fontStyle:     'normal',
    margin:        0,
  } satisfies CSSProperties,

  /** h3 — Large body / callout. Responsive: 1.5rem → 2.25rem */
  h3: {
    fontFamily:    fonts.hn,
    fontSize:      'clamp(1.5rem, 2.5vw, 2.25rem)',
    letterSpacing: letterSpacings.subhead,
    lineHeight:    lineHeights.heading,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

  /** h4 — Medium subtitle / feature title. Fixed 22.65px */
  h4: {
    fontFamily:    fonts.hn,
    fontSize:      '1.416rem',
    letterSpacing: letterSpacings.subhead,
    lineHeight:    lineHeights.subhead,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

  /** body — Standard body / UI text. Fixed 14px */
  body: {
    fontFamily:    fonts.hn,
    fontSize:      '0.875rem',
    letterSpacing: letterSpacings.body,
    lineHeight:    lineHeights.body,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

  /** bodyMedium — Body weight 500 (nav items, button labels) */
  bodyMedium: {
    fontFamily:    fonts.hn,
    fontSize:      '0.875rem',
    letterSpacing: letterSpacings.ui,
    lineHeight:    lineHeights.body,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    500,
    margin:        0,
  } satisfies CSSProperties,

  /** label — Small label / caption. HN 14px */
  label: {
    fontFamily:    fonts.hn,
    fontSize:      '0.875rem',
    letterSpacing: letterSpacings.ui,
    lineHeight:    lineHeights.label,
    wordSpacing:   wordSpacings.normal,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

} as const
