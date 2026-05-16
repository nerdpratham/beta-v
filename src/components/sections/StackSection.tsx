// ─── STACK SECTION — SixDX ───────────────────────────────────────────────────
// Two-phase scroll-pinned section:
//
// Phase 1 (scrub 0 → 1):  "Precision driven · Forward Motion"
//   circle → capsule → full screen via clip-path on the scene div.
//   Words colour-shift to white then disappear.
//
// Phase 2 (scrub 1.1 → ~1.8):  Stats appear
//   Heading → subtext → 3 circular stat cards fade in.
//
// Background: pure CSS radial gradient (warm orange-red ceiling → near-black).
// No image file required.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'
import CountUp from '../ui/CountUp'
import type { CountUpHandle } from '../ui/CountUp'
import { fonts, colors } from '../../styles/tokens'

// clip-path keyframes — circle → capsule → full screen
const CLIP_START = 'inset(49% 49% 49% 49% round 500px)'
const CLIP_MID   = 'inset(25% 5% 25% 5% round 150px)'
const CLIP_END   = 'inset(0% 0% 0% 0% round 0px)'

const SCENE_IMAGE = '/images/metrics_bg.png'

// ─── CONTENT — edit freely ───────────────────────────────────────────────────
const LEFT_WORDS = ['Precision', 'driven']
const RIGHT_WORD = ['Forward', 'Motion']

const HEADING = 'Numbers that speak for themselves'

const SUBTEXT =
  'A flat animation, a screen-recorded walkthrough, a stock-footage montage. None of it communicates the weight of a pressurised valve, the heat of a furnace floor, or the consequence of a wrong sequence inside a confined space.'

const STATS: {
  value:   number
  suffix:  string
  prefix?: string
  label:   string
  countUpProps?: Partial<{
    duration:  number
    delay:     number
    decimals:  number
    ease:      string
    threshold: number
  }>
}[] = [
  {
    value:  68,
    suffix: '%',
    label:  'Improvement in first-time procedure retention versus slide-based training.',
    countUpProps: { duration: 1.4, ease: 'power2.out' },
  },
  {
    value:  40,
    suffix: '%',
    label:  'Reduction in refresher training cycles over the first twelve months of deployment.',
    countUpProps: { duration: 1.2, ease: 'power2.out' },
  },
  {
    value:  0,
    suffix: '%',
    label:  'Compliance rejections across HSE-reviewed modules delivered to date.',
    countUpProps: { duration: 0.6, ease: 'power2.out' },
  },
]
// ─────────────────────────────────────────────────────────────────────────────

export default function StackSection() {
  const sectionRef      = useRef<HTMLElement>(null)
  const whiteLayerRef   = useRef<HTMLDivElement>(null)
  const sceneDivRef     = useRef<HTMLDivElement>(null)
  const darkSentinelRef = useRef<HTMLDivElement>(null)
  const leftTextRef     = useRef<HTMLDivElement>(null)
  const rightTextRef    = useRef<HTMLDivElement>(null)

  const headingRef  = useRef<HTMLParagraphElement>(null)
  const subtextRef  = useRef<HTMLParagraphElement>(null)
  const statRefs    = useRef<(HTMLDivElement | null)[]>([])
  const countUpRefs = useRef<(CountUpHandle | null)[]>([])

  useEffect(() => {
    const section    = sectionRef.current
    const whiteLayer = whiteLayerRef.current
    const sceneDiv   = sceneDivRef.current
    const leftText   = leftTextRef.current
    const rightText  = rightTextRef.current
    const heading    = headingRef.current
    const subtext    = subtextRef.current

    if (!section || !whiteLayer || !sceneDiv || !leftText || !rightText || !heading || !subtext) return

    const statCards = Array.from(section.querySelectorAll<HTMLDivElement>('[data-stat-card]'))

    const matchMedia = gsap.matchMedia()
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion) {
        gsap.set(sceneDiv,              { clipPath: CLIP_END })
        gsap.set([leftText, rightText], { autoAlpha: 0 })
        gsap.set([heading, subtext, ...statCards], { autoAlpha: 1 })
        return
      }

      matchMedia.add(
        {
          desktop: '(min-width: 768px)',
          mobile:  '(max-width: 767px)',
        },
        () => {
          // ── Phase 1 initial state ────────────────────────────────────────────
          gsap.set(sceneDiv,              { clipPath: CLIP_START })
          gsap.set([leftText, rightText], { autoAlpha: 1, willChange: 'transform, opacity' })
          gsap.set(whiteLayer,            { autoAlpha: 1 })

          // ── Phase 2 initial state ────────────────────────────────────────────
          gsap.set([heading, subtext, ...statCards], { autoAlpha: 0, y: 30 })

          // ── Timeline ─────────────────────────────────────────────────────────
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger:             section,
              start:               'top top',
              end:                 '+=560%',
              pin:                 true,
              scrub:               1,
              anticipatePin:       1,
              refreshPriority:     -1,
              invalidateOnRefresh: true,
              onUpdate: () => {
                const sentinel = darkSentinelRef.current
                if (!sentinel) return
                sentinel.style.display = timeline.time() >= 1 ? 'block' : 'none'
              },
              onLeaveBack: () => {
                if (darkSentinelRef.current) darkSentinelRef.current.style.display = 'none'
              },
            },
          })

          // ── PHASE 1: circle → capsule → full screen ──────────────────────────
          timeline.fromTo(
            sceneDiv,
            { clipPath: CLIP_START },
            { clipPath: CLIP_MID, ease: 'power1.in', duration: 0.5 },
            0,
          )
          timeline.fromTo(
            sceneDiv,
            { clipPath: CLIP_MID },
            { clipPath: CLIP_END, ease: 'power1.out', duration: 0.5 },
            0.5,
          )
          // Words shift dark → white as the dark scene expands beneath them
          timeline.to([leftText, rightText], { color: colors.white, ease: 'power1.inOut', duration: 1 }, 0)
          // Quick fade just after scene fully covers screen
          timeline.to([leftText, rightText], { autoAlpha: 0, ease: 'none', duration: 0.05 }, 1.02)

          // ── PHASE 2: stats appear ─────────────────────────────────────────────
          timeline.fromTo(heading, { autoAlpha: 0, y: 40 }, { autoAlpha: 1,   y: 0, ease: 'power3.out', duration: 0.18 }, 1.12)
          timeline.fromTo(subtext, { autoAlpha: 0, y: 30 }, { autoAlpha: 0.5, y: 0, ease: 'power3.out', duration: 0.16 }, 1.22)
          statCards.forEach((card, i) => {
            timeline.fromTo(
              card,
              { autoAlpha: 0, y: 24, scale: 0.94 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                ease: 'power3.out',
                duration: 0.18,
                onComplete: () => countUpRefs.current[i]?.start(),
              },
              1.30 + i * 0.12,
            )
          })

          timeline.addLabel('hold', 2.5)

          return () => { timeline.kill() }
        },
      )
    }, section)

    return () => {
      matchMedia.revert()
      context.revert()
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Industrial training outcomes"
      data-theme="light"
      className="relative h-screen overflow-hidden bg-black"
    >
      {/* Dark sentinel for Navbar theme switching */}
      <div
        ref={darkSentinelRef}
        data-theme="dark"
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          display:       'none',
          pointerEvents: 'none',
          opacity:       0,
          zIndex:        -1,
        }}
      />

      <div className="relative h-screen w-full overflow-hidden">

        {/* White base layer — visible around the scene during phase 1 */}
        <div
          ref={whiteLayerRef}
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-white"
        />

        {/* ── CSS gradient scene — clip-path zooms from circle → capsule → full ─ */}
        <div
          ref={sceneDivRef}
          aria-label="Stats section"
          className="absolute inset-0 z-20 overflow-hidden"
          style={{
            backgroundImage:    `url("${SCENE_IMAGE}")`,
            backgroundSize:     'cover',
            backgroundPosition: 'center',
            clipPath:           CLIP_START,
          }}
        >
          {/* ── Stats layout ──────────────────────────────────────────────────── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ padding: '48px 40px', gap: 48 }}
          >
            {/* Heading + subtext — centred at top of the content block */}
            <div style={{ textAlign: 'center', maxWidth: 600 }}>
              <p
                ref={headingRef}
                style={{
                  fontFamily:    fonts.marund,
                  fontSize:      'clamp(1.75rem, 3vw, 2.5rem)',
                  letterSpacing: '-0.03em',
                  lineHeight:    1.1,
                  color:         colors.white,
                  margin:        0,
                  marginBottom:  20,
                }}
              >
                {HEADING}
              </p>
              <p
                ref={subtextRef}
                style={{
                  fontFamily: fonts.hn,
                  fontSize:   13,
                  lineHeight: 1.5,
                  color:      'rgba(255,255,255,0.55)',
                  margin:     0,
                }}
              >
                {SUBTEXT}
              </p>
            </div>

            {/* Circular stat cards — 3 in a row */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-around',
                alignItems:     'flex-start',
                width:          '100%',
                maxWidth:       900,
                gap:            24,
              }}
            >
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  data-stat-card
                  ref={(el) => { statRefs.current[i] = el }}
                  style={{
                    flex:           1,
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    gap:            20,
                  }}
                >
                  {/* Circle with dashed ring */}
                  <div
                    style={{
                      width:          200,
                      height:         200,
                      borderRadius:   '50%',
                      border:         '1.5px dashed rgba(255,255,255,0.4)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      flexShrink:     0,
                    }}
                  >
                    <CountUp
                      ref={(el) => { countUpRefs.current[i] = el }}
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      {...stat.countUpProps}
                      style={{
                        fontFamily:    fonts.marund,
                        fontSize:      'clamp(2.5rem, 5vw, 4rem)',
                        letterSpacing: '-0.03em',
                        lineHeight:    1,
                        color:         colors.white,
                      }}
                    />
                  </div>

                  {/* Label below circle */}
                  <p
                    style={{
                      fontFamily: fonts.hn,
                      fontSize:   13,
                      lineHeight: 1.45,
                      color:      'rgba(255,255,255,0.55)',
                      textAlign:  'center',
                      margin:     0,
                      maxWidth:   200,
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Text overlay — "Precision driven · Forward Motion" ──────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible text-[#15100f]"
          style={{ fontFamily: fonts.hn }}
        >
          <h2
            className="sixdx-stack-h2 relative z-30 m-0 flex w-max items-center justify-center gap-4 text-[30px] font-normal leading-none md:text-[36px]"
          >
            <div
              ref={leftTextRef}
              aria-label="Left text"
              className="flex items-center gap-3 whitespace-nowrap"
            >
              {LEFT_WORDS.map(w => <span key={w}>{w}</span>)}
            </div>

            <div
              ref={rightTextRef}
              aria-label="Right text"
              className="flex items-center gap-3 whitespace-nowrap"
            >
              {RIGHT_WORD.map(w => <span key={w}>{w}</span>)}
            </div>
          </h2>
        </div>

        {/* Screen-reader accessible content */}
        <div className="sr-only">
          <h2>{HEADING}</h2>
          <p>{SUBTEXT}</p>
          <ul>
            <li>68% improvement in first-time procedure retention.</li>
            <li>40% reduction in refresher training cycles.</li>
            <li>0% compliance rejections across reviewed modules.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
