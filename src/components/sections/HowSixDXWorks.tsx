import { useRef, useState, useEffect, type CSSProperties } from 'react'
import { colors, fonts, textStyles } from '../../styles/tokens'
import worksImg from '../../assets/images/works.png'

// ── Content — edit paragraphs here ───────────────────────────────────────────
const STEPS = [
  {
    label: 'Technical Brief & Site Documentation Review',
    body: 'We begin with existing P&IDs, SOPs, site drawings, HSE manuals, and operational documentation. Our team studies plant processes, risk areas, maintenance procedures, and emergency protocols. Every animation workflow is planned around actual site conditions and operational accuracy. This stage ensures the final content matches real industrial environments and compliance standards.',
  },
  {
    label: 'SME-Led Storyboarding & Script Development',
    body: 'Subject matter experts from your operations team join our storyboard sessions. We map every scene to a specific learning objective — building scripts that reflect real procedures, accurate terminology, and site-specific context, not generic training templates built for generic audiences.',
  },
  {
    label: '3D Environment Modelling & Asset Build',
    body: 'Our 3D artists reconstruct your facility, equipment, and assets from technical drawings and site reference material. Every valve, pipe, machine, and control room is modelled to specification — creating the photorealistic environment your training content lives inside.',
  },
  {
    label: 'CGI Production & Render',
    body: 'With the environment built, we animate the operational sequences — process flows, maintenance tasks, emergency procedures, and compliance scenarios. Rendered to broadcast quality, each frame is reviewed against the original brief to ensure technical accuracy at every step.',
  },
  {
    label: 'Review, Compliance Sign-Off & Delivery',
    body: 'Your operations, HSE, and training teams review every sequence before delivery. We iterate based on feedback until every detail meets your compliance standards. Final content is packaged in your required format — LMS-ready, MP4, or integrated directly into your platforms.',
  },
] as const

const padNum = (n: number) => String(n + 1).padStart(2, '0')

// ── Styles ────────────────────────────────────────────────────────────────────
const PANEL_GRADIENT = 'linear-gradient(180deg, #d88b66 0%, #c96038 32%, #66311f 64%, #1c0b05 100%)'

const s = {
  section: {
    background: colors.ink,
    color: colors.white,
    height: '100svh',
    padding: '68px 22px 40px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  header: {
    maxWidth: 430,
    textAlign: 'left',
    flexShrink: 0,
  } satisfies CSSProperties,

  heading: {
    ...textStyles.h2,
    fontSize: 60,
    fontWeight: 500,
    color: colors.white,
  } satisfies CSSProperties,

  copy: {
    fontFamily: fonts.hn,
    fontSize: 20,
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.32,
    color: 'rgba(255,255,255,0.60)',
    margin: 0,
    marginTop: 16,
  } satisfies CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 40,
    flex: 1,
    minHeight: 0,
  } satisfies CSSProperties,

  // Left panel — gradient bg, white labels
  stepPanel: {
    background: PANEL_GRADIENT,
    overflow: 'hidden',
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 32,
    boxSizing: 'border-box',
    position: 'relative',
  } satisfies CSSProperties,

  number: {
    fontFamily: fonts.hn,
    fontSize: 96,
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: 0,
    color: 'rgba(255,255,255,0.15)',
    margin: 0,
    display: 'block',
  } satisfies CSSProperties,

  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    textAlign: 'left',
  } satisfies CSSProperties,

  stepText: {
    fontFamily: fonts.hn,
    fontSize: 20,
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.32,
    margin: 0,
    transition: 'color 0.45s ease',
    cursor: 'default',
  } satisfies CSSProperties,

  // Right panel — photo background + dark overlay
  visualPanel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 32,
    boxSizing: 'border-box',
    backgroundImage: `url(${worksImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } satisfies CSSProperties,

  // Dark overlay on top of photo
  visualShade: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  textCard: {
    padding: 20,
    textAlign: 'left',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 2,
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
  } satisfies CSSProperties,

  bodyText: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.78)',
    maxWidth: 388,
    margin: 0,
  } satisfies CSSProperties,
}

// ═════════════════════════════════════════════════════════════════════════════
export default function HowSixDXWorks() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handleScroll = () => {
      const rect   = wrapper.getBoundingClientRect()
      const travel = wrapper.offsetHeight - window.innerHeight
      if (travel <= 0) return
      const raw  = Math.max(0, Math.min(1, -rect.top / travel))
      const step = Math.min(STEPS.length - 1, Math.floor(raw * STEPS.length))
      setActiveStep(prev => (prev !== step ? step : prev))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const rafId = requestAnimationFrame(handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes howNumIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .how-num { animation: howNumIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>

      {/* Scroll travel container — section pins inside for 5 × 100svh */}
      <div ref={wrapperRef} style={{ height: `${STEPS.length * 100}svh` }}>
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

            {/* ── Left panel: gradient bg + step number + list ──────────── */}
            <div className="how-sixdx-step-panel" style={s.stepPanel}>
              <span
                key={activeStep}
                aria-hidden="true"
                className="how-num"
                style={s.number}
              >
                {padNum(activeStep)}
              </span>

              <div style={s.stepList}>
                {STEPS.map((step, i) => (
                  <p
                    key={step.label}
                    style={{
                      ...s.stepText,
                      color: i === activeStep
                        ? 'rgba(255,255,255,1)'
                        : 'rgba(255,255,255,0.28)',
                    }}
                  >
                    {step.label}
                  </p>
                ))}
              </div>
            </div>

            {/* ── Right panel: works.png + dark overlay + body text ─────── */}
            <div className="how-sixdx-visual-panel" style={s.visualPanel}>
              <div aria-hidden="true" style={s.visualShade} />

              <div className="how-sixdx-body-card" style={s.textCard}>
                {/*
                  CSS grid stacking: all paragraphs share the same cell so the
                  container height is set by the tallest one; others crossfade.
                */}
                <div style={{ display: 'grid', width: '100%' }}>
                  {STEPS.map((step, i) => (
                    <p
                      key={step.label}
                      style={{
                        ...s.bodyText,
                        gridColumn: '1',
                        gridRow: '1',
                        opacity: i === activeStep ? 1 : 0,
                        transform: i === activeStep ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                        pointerEvents: i === activeStep ? 'auto' : 'none',
                      }}
                    >
                      {step.body}
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
  )
}
