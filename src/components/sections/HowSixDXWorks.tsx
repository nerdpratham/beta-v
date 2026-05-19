import type { CSSProperties } from 'react'
import { colors, fonts, textStyles } from '../../styles/tokens'

const STEPS = [
  'Technical Brief & Site Documentation Review',
  'SME-Led Storyboarding & Script Development',
  '3D Environment Modelling & Asset Build',
  'CGI Production & Render',
  'Review, Compliance Sign-Off & Delivery',
] as const

const BODY =
  'We begin with existing P&IDs, SOPs, site drawings, HSE manuals, and operational documentation. Our team studies plant processes, risk areas, maintenance procedures, and emergency protocols. Every animation workflow is planned around actual site conditions and operational accuracy. This stage ensures the final content matches real industrial environments and compliance standards.'

const s = {
  section: {
    background: colors.ink,
    color: colors.white,
    minHeight: '100svh',
    padding: '68px 22px 66px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  } satisfies CSSProperties,

  header: {
    maxWidth: 430,
    textAlign: 'left',
  } satisfies CSSProperties,

  heading: {
    ...textStyles.h2,
    color: colors.white,
  } satisfies CSSProperties,

  copy: {
    ...textStyles.body,
    lineHeight: 1.25,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 16,
  } satisfies CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 40,
  } satisfies CSSProperties,

  stepPanel: {
    position: 'relative',
    minHeight: 329,
    background: colors.white,
    color: colors.ink,
    overflow: 'hidden',
  } satisfies CSSProperties,

  number: {
    position: 'absolute',
    top: 6,
    left: 20,
    fontFamily: fonts.hn,
    fontSize: 96,
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: 0,
    color: 'rgba(28,11,5,0.10)',
  } satisfies CSSProperties,

  stepList: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 19,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'left',
  } satisfies CSSProperties,

  stepText: {
    ...textStyles.body,
    lineHeight: 1,
    color: 'rgba(28,11,5,0.20)',
  } satisfies CSSProperties,

  activeStepText: {
    color: colors.ink,
  } satisfies CSSProperties,

  visualPanel: {
    position: 'relative',
    minHeight: 329,
    overflow: 'hidden',
    background:
      'linear-gradient(180deg, #d88b66 0%, #c96038 32%, #66311f 64%, #1c0b05 100%)',
  } satisfies CSSProperties,

  visualShade: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.10), transparent 42%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0.44) 100%)',
  } satisfies CSSProperties,

  textCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 15,
    minHeight: 90,
    padding: '16px 16px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    textAlign: 'left',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  } satisfies CSSProperties,

  bodyText: {
    ...textStyles.label,
    fontSize: 9,
    lineHeight: 1.32,
    color: 'rgba(255,255,255,0.78)',
    maxWidth: 388,
  } satisfies CSSProperties,
}

export default function HowSixDXWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="How SixDX works"
      data-theme="dark"
      className="how-sixdx-works"
      style={s.section}
    >
      <div className="how-sixdx-header" style={s.header}>
        <h2 style={s.heading}>How SixDX works</h2>
        <p style={s.copy}>
          Training is not a single format. Different failures need different kinds of film. The work
          below describes the six production types SixDX builds &mdash; each one engineered for a
          specific learning outcome, each one delivered to the same cinematic standard.
        </p>
      </div>

      <div className="how-sixdx-grid" style={s.grid}>
        <div className="how-sixdx-step-panel" style={s.stepPanel}>
          <span aria-hidden="true" style={s.number}>01</span>
          <div style={s.stepList}>
            {STEPS.map((step, i) => (
              <p
                key={step}
                style={{
                  ...s.stepText,
                  ...(i === 0 ? s.activeStepText : null),
                }}
              >
                {step}
              </p>
            ))}
          </div>
        </div>

        <div className="how-sixdx-visual-panel" style={s.visualPanel}>
          <div aria-hidden="true" style={s.visualShade} />
          <div className="how-sixdx-body-card" style={s.textCard}>
            <p style={s.bodyText}>{BODY}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
