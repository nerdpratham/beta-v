// ─── STACK SECTION — SixDX ───────────────────────────────────────────────────
// Two-phase scroll-pinned section:
//
// Phase 1 (scrub 0 → 1):  "Precision driven · Forward Motion"
//   circle → capsule → full screen via clip-path.
//
// Phase 2 (scrub 1.1 → ~1.8):  Stats appear
//   Heading → subtext → 3 StatCircle cards.
//   Each StatCircle drives ring + number from one GSAP timeline:
//     0 → 100 (ring fills, number rushes up) → value (ring & number settle back)
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'
import { lenisInstance } from '../../animations/scroll'
import { fonts, colors } from '../../styles/tokens'

// clip-path keyframes — circle → capsule → full screen
const CLIP_START = 'inset(50% 50% 50% 50% round 500px)'
const CLIP_MID   = 'inset(25% 5% 25% 5% round 150px)'
const CLIP_END   = 'inset(0% 0% 0% 0% round 0px)'

const SCENE_IMAGE = '/images/metrics_bg.png'

// ─── STAT CIRCLE ─────────────────────────────────────────────────────────────
// SVG tick ring (80 evenly-spaced marks) + centred number.
// A single GSAP timeline drives both via a shared progress value (0→100→value).
// The foreground ring is revealed by a CSS conic-gradient mask so the
// filled/unfilled tick marks are always the same ticks — just masked.
// ─────────────────────────────────────────────────────────────────────────────
const RING_SIZE   = 260
const RING_CX     = RING_SIZE / 2        // 130 — centre of the SVG
const RING_TICKS  = 80                   // tick count around the full circle
const RING_R_OUT  = RING_CX - 3         // 127 — outer tip of each radial tick
const RING_R_IN   = RING_R_OUT - 13     // 114 — inner tip (tick length = 13 px)
const RING_SW     = 1.5                  // tick stroke-width
const RING_INNER  = RING_CX - RING_R_IN + 2  // frosted-glass inset (2 px gap)

// Pre-compute tick endpoints once (module-level, never re-runs)
const RING_TICKS_DATA = Array.from({ length: RING_TICKS }, (_, i) => {
  const a = (i / RING_TICKS) * 2 * Math.PI - Math.PI / 2  // 12 o'clock start
  const cos = Math.cos(a), sin = Math.sin(a)
  return {
    x1: +(RING_CX + RING_R_IN  * cos).toFixed(3),
    y1: +(RING_CX + RING_R_IN  * sin).toFixed(3),
    x2: +(RING_CX + RING_R_OUT * cos).toFixed(3),
    y2: +(RING_CX + RING_R_OUT * sin).toFixed(3),
  }
})

interface StatCircleHandle { start: (delay?: number, onDone?: () => void) => void }

const StatCircle = forwardRef<StatCircleHandle, {
  value:     number
  suffix?:   string
  prefix?:   string
  duration?: number
}>(function StatCircle({ value, suffix = '', prefix = '', duration = 1.4 }, ref) {
  const maskRef  = useRef<HTMLDivElement>(null)
  const numRef   = useRef<HTMLSpanElement>(null)
  const hasRun   = useRef(false)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)

  const applyMask = (pct: number) => {
    const p = `${Math.min(100, Math.max(0, pct)).toFixed(1)}%`
    const v = `conic-gradient(from -90deg, white 0% ${p}, transparent ${p} 100%)`
    if (maskRef.current) {
      maskRef.current.style.maskImage = v
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(maskRef.current.style as any).webkitMaskImage = v
    }
  }

  const showNum = (n: number) => {
    if (numRef.current) {
      numRef.current.textContent = `${prefix}${Math.round(n)}${suffix}`
    }
  }

  useImperativeHandle(ref, () => ({
    start(delay = 0, onDone?: () => void) {
      if (hasRun.current) return
      hasRun.current = true

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        applyMask(value); showNum(value)
        onDone?.()
        return
      }

      const state = { val: 0 }
      tlRef.current = gsap.timeline({ delay })
        // Phase 1 — rush 0 → 100
        // FROM is captured lazily at first render (state.val = 0 at that point)
        .to(state, {
          val:      100,
          duration: duration * 0.55,
          ease:     'circ.in',
          onUpdate() { applyMask(state.val); showNum(state.val) },
        })
        // Phase 2 — settle 100 → actual value
        // FROM is also captured lazily: state.val = 100 when Phase 1 ends,
        // so GSAP sees 100 → value (never a 0→0 no-op even when value === 0).
        .to(state, {
          val:      value,
          duration: duration * 0.45,
          ease:     'expo.out',
          onUpdate()  { applyMask(state.val); showNum(state.val) },
          onComplete() { applyMask(value); showNum(value); onDone?.() },
        })
    },
  }))

  useEffect(() => {
    applyMask(0); showNum(0)
    return () => { tlRef.current?.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}>

      {/* Track — all radial ticks at low opacity */}
      <svg width={RING_SIZE} height={RING_SIZE} aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {RING_TICKS_DATA.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="rgba(255,255,255,0.10)" strokeWidth={RING_SW} strokeLinecap="round" />
        ))}
      </svg>

      {/* Frosted-glass inner fill */}
      <div style={{
        position:              'absolute',
        inset:                 RING_INNER,
        borderRadius:          '50%',
        backdropFilter:        'blur(14px)',
        WebkitBackdropFilter:  'blur(14px)',
        background:            'rgba(0,0,0,0.28)',
        pointerEvents:         'none',
      }} />

      {/* Progress ring — same radial ticks bright, conic-gradient masked */}
      <div
        ref={maskRef}
        style={{
          position:          'absolute',
          inset:             0,
          maskImage:         'conic-gradient(from -90deg, white 0% 0%, transparent 0% 100%)',
          pointerEvents:     'none',
        }}
      >
        <svg width={RING_SIZE} height={RING_SIZE} aria-hidden="true" style={{ display: 'block' }}>
          {RING_TICKS_DATA.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="rgba(255,255,255,0.55)" strokeWidth={RING_SW} strokeLinecap="round" />
          ))}
        </svg>
      </div>

      {/* Stat number — centred inside the ring */}
      <span
        ref={numRef}
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          fontFamily:    fonts.marund,
          fontSize:      'clamp(2.5rem, 5vw, 4rem)',
          letterSpacing: '-0.03em',
          lineHeight:    1,
          color:         colors.white,
          whiteSpace:    'nowrap',
        }}
      />
    </div>
  )
})
// ─────────────────────────────────────────────────────────────────────────────

// ─── CONTENT — edit freely ───────────────────────────────────────────────────
const LEFT_WORDS = ['Precision', 'driven']
const RIGHT_WORD = ['Forward', 'Motion']

const HEADING = 'Numbers that speak for themselves'

const SUBTEXT =
  'A flat animation, a screen-recorded walkthrough, a stock-footage montage. None of it communicates the weight of a pressurised valve, the heat of a furnace floor, or the consequence of a wrong sequence inside a confined space.'

const STATS: { value: number; suffix: string; prefix?: string; label: string; duration?: number }[] = [
  { value: 68, suffix: '%', label: 'Improvement in first-time procedure retention versus slide-based training.',          duration: 3.0 },
  { value: 40, suffix: '%', label: 'Reduction in refresher training cycles over the first twelve months of deployment.', duration: 2.8 },
  { value:  0, suffix: '%', label: 'Compliance rejections across HSE-reviewed modules delivered to date.',               duration: 2.4 },
]
// ─────────────────────────────────────────────────────────────────────────────

export default function StackSection() {
  const sectionRef      = useRef<HTMLElement>(null)
  const whiteLayerRef   = useRef<HTMLDivElement>(null)
  const sceneDivRef     = useRef<HTMLDivElement>(null)
  const darkSentinelRef = useRef<HTMLDivElement>(null)
  const leftTextRef     = useRef<HTMLDivElement>(null)
  const rightTextRef    = useRef<HTMLDivElement>(null)
  const headingRef      = useRef<HTMLParagraphElement>(null)
  const subtextRef      = useRef<HTMLParagraphElement>(null)
  const statRefs        = useRef<(HTMLDivElement | null)[]>([])
  const circleRefs      = useRef<(StatCircleHandle | null)[]>([])

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
        circleRefs.current.forEach(c => c?.start())
        return
      }

      matchMedia.add(
        { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' },
        () => {
          gsap.set(sceneDiv,              { clipPath: CLIP_START })
          gsap.set([leftText, rightText], { autoAlpha: 1, willChange: 'transform, opacity' })
          gsap.set(whiteLayer,            { autoAlpha: 1 })
          gsap.set([heading, subtext, ...statCards], { autoAlpha: 0, y: 30 })

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
                if (sentinel) sentinel.style.display = timeline.time() >= 1 ? 'block' : 'none'
              },
              onLeaveBack: () => {
                if (darkSentinelRef.current) darkSentinelRef.current.style.display = 'none'
              },
            },
          })

          // Phase 1: circle → capsule → full screen
          timeline.fromTo(sceneDiv, { clipPath: CLIP_START }, { clipPath: CLIP_MID, ease: 'power1.in',  duration: 0.5 }, 0)
          timeline.fromTo(sceneDiv, { clipPath: CLIP_MID   }, { clipPath: CLIP_END, ease: 'power1.out', duration: 0.5 }, 0.5)
          timeline.to([leftText, rightText], { color: colors.white, ease: 'power1.inOut', duration: 1 }, 0)
          timeline.to([leftText, rightText], { autoAlpha: 0, ease: 'none', duration: 0.05 }, 1.02)

          // Phase 2: stats appear, then each circle animates
          timeline.fromTo(heading, { autoAlpha: 0, y: 40 }, { autoAlpha: 1,   y: 0, ease: 'power3.out', duration: 0.18 }, 1.12)
          timeline.fromTo(subtext, { autoAlpha: 0, y: 30 }, { autoAlpha: 0.5, y: 0, ease: 'power3.out', duration: 0.16 }, 1.22)

          // Lock scroll while circle animations run.
          // When all 3 cards have appeared we:
          //   1. Pause the scrub tween — stops the 1-second "catch-up" lag from
          //      advancing the timeline any further (critical: without this, the
          //      scrub continues toward wherever the user had already scrolled,
          //      potentially un-pinning the section before animations finish).
          //   2. Stop Lenis — blocks new wheel/touch scroll input.
          // Both locks are released once every circle's onDone fires.
          let lockApplied = false
          let circlesDone = 0

          statCards.forEach((card, i) => {
            timeline.fromTo(
              card,
              { autoAlpha: 0, y: 24, scale: 0.94 },
              {
                autoAlpha: 1, y: 0, scale: 1,
                ease: 'power3.out', duration: 0.18,
                onComplete: () => {
                  circleRefs.current[i]?.start(i * 0.5, () => {
                    circlesDone++
                    if (circlesDone === STATS.length) {
                      // Unlock: resume scrub first so ScrollTrigger can
                      // re-sync with the current (unfrozen) scroll position,
                      // then let Lenis process input again.
                      timeline.scrollTrigger?.getTween()?.resume()
                      ScrollTrigger.update()
                      lenisInstance?.start()
                    }
                  })
                  // Last card (i===2) triggers the lock exactly once
                  if (i === STATS.length - 1 && !lockApplied) {
                    lockApplied = true
                    // Pause the scrub tween BEFORE stopping Lenis so the
                    // scrub freeze takes effect immediately on this tick.
                    timeline.scrollTrigger?.getTween()?.pause()
                    lenisInstance?.stop()
                  }
                },
              },
              1.30 + i * 0.12,
            )
          })

          timeline.addLabel('hold', 2.5)
          return () => { timeline.kill() }
        },
      )
    }, section)

    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__triggerCircles = () => {
        circleRefs.current.forEach((ref, i) => ref?.start(i * 0.5))
      }
    }

    return () => {
      lenisInstance?.start()
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
      <div ref={darkSentinelRef} data-theme="dark" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, display: 'none', pointerEvents: 'none', opacity: 0, zIndex: -1 }}
      />

      <div className="relative h-screen w-full overflow-hidden">

        <div ref={whiteLayerRef} aria-hidden="true" className="absolute inset-0 z-10 bg-white" />

        {/* Scene — clip-path zooms from circle → capsule → full screen */}
        <div
          ref={sceneDivRef}
          aria-label="Stats section"
          className="absolute inset-0 z-20 overflow-hidden"
          style={{ clipPath: CLIP_START }}
        >
          {/* Background image in its own layer so blur doesn't affect content */}
          <div aria-hidden="true" style={{
            position:           'absolute',
            inset:              -12,
            backgroundImage:    `url("${SCENE_IMAGE}")`,
            backgroundSize:     'cover',
            backgroundPosition: 'center',
            filter:             'blur(6px)',
          }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: '48px 40px', gap: 48 }}>

            {/* Heading + subtext */}
            <div style={{ textAlign: 'center', maxWidth: 600 }}>
              <p ref={headingRef} style={{
                fontFamily: fonts.marund, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                letterSpacing: '-0.03em', lineHeight: 1.1, color: colors.white, margin: 0, marginBottom: 20,
              }}>
                {HEADING}
              </p>
              <p ref={subtextRef} style={{
                fontFamily: fonts.hn, fontSize: 13, lineHeight: 1.5,
                color: 'rgba(255,255,255,0.55)', margin: 0,
              }}>
                {SUBTEXT}
              </p>
            </div>

            {/* 3 circular stat cards */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', width: '100%', maxWidth: 900, gap: 24 }}>
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  data-stat-card
                  ref={(el) => { statRefs.current[i] = el }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
                >
                  <StatCircle
                    ref={(el) => { circleRefs.current[i] = el }}
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    duration={stat.duration}
                  />
                  <p style={{
                    fontFamily: fonts.hn, fontSize: 13, lineHeight: 1.45,
                    color: 'rgba(255,255,255,0.55)', textAlign: 'center', margin: 0, maxWidth: 200,
                  }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text overlay — "Precision driven · Forward Motion" */}
        <div aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible text-[#15100f]"
          style={{ fontFamily: fonts.hn }}
        >
          <h2 className="sixdx-stack-h2 relative z-30 m-0 flex w-max items-center justify-center gap-4 text-[30px] font-normal leading-none md:text-[36px]">
            <div ref={leftTextRef} aria-label="Left text" className="flex items-center gap-3 whitespace-nowrap">
              {LEFT_WORDS.map(w => <span key={w}>{w}</span>)}
            </div>
            <div ref={rightTextRef} aria-label="Right text" className="flex items-center gap-3 whitespace-nowrap">
              {RIGHT_WORD.map(w => <span key={w}>{w}</span>)}
            </div>
          </h2>
        </div>

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
