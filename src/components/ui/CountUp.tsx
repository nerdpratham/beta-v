// ─── COUNT-UP — SixDX ────────────────────────────────────────────────────────
// Animates a number: 0 → 100 (rush) → target value (settle).
//
// Trigger: IMPERATIVE only — the parent calls countUpRef.current.start().
//
// Usage:
//   const ref = useRef<CountUpHandle>(null)
//   <CountUp ref={ref} value={68} suffix="%" />
//   ref.current?.start()
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from '../../animations/gsap.config'

export interface CountUpHandle {
  start: () => void
}

export interface CountUpProps {
  value:      number
  suffix?:    string
  prefix?:    string
  duration?:  number
  delay?:     number
  decimals?:  number
  ease?:      string
  className?: string
  style?:     CSSProperties
}

const CountUp = forwardRef<CountUpHandle, CountUpProps>(function CountUp(
  {
    value,
    suffix   = '',
    prefix   = '',
    duration = 1.6,
    delay    = 0,
    decimals = 0,
    className,
    style,
  },
  ref,
) {
  const spanRef    = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)
  const tlRef      = useRef<gsap.core.Timeline | null>(null)

  useImperativeHandle(ref, () => ({
    start() {
      if (hasStarted.current) return
      hasStarted.current = true

      const el = spanRef.current
      if (!el) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = `${prefix}${decimals > 0 ? value.toFixed(decimals) : String(value)}${suffix}`
        return
      }

      const counter = { val: 0 }
      const fmt = (n: number) =>
        `${prefix}${decimals > 0 ? n.toFixed(decimals) : String(Math.round(n))}${suffix}`

      // Split duration: 55% rushing to 100, 45% settling to target
      const rushDur   = duration * 0.55
      const settleDur = duration * 0.45

      tlRef.current = gsap.timeline({ delay })

      // Phase 1 — rush 0 → 100
      tlRef.current.to(counter, {
        val: 100,
        duration: rushDur,
        ease: 'power2.in',
        onUpdate() { el.textContent = fmt(counter.val) },
      })

      // Phase 2 — settle 100 → actual value
      tlRef.current.to(counter, {
        val: value,
        duration: settleDur,
        ease: 'power3.out',
        onUpdate()  { el.textContent = fmt(counter.val) },
        onComplete() { el.textContent = fmt(value) },
      })
    },
  }))

  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.textContent = `${prefix}0${suffix}`
    }
    return () => { tlRef.current?.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <span ref={spanRef} className={className} style={style} />
})

export default CountUp
