import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'
import { fonts } from '../../styles/tokens'

export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const barRef     = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    const overlay = overlayRef.current
    const bar     = barRef.current
    if (!overlay || !bar) return

    document.body.style.overflow = 'hidden'

    // Animate bar 0 → 100% — minimum perceived load time
    const barTween = gsap.fromTo(bar,
      { width: '0%' },
      { width: '100%', duration: 1.2, ease: 'power2.inOut' }
    )

    // Wait for bar animation + fonts + window load — whichever is last
    const barDone   = new Promise<void>(r => barTween.eventCallback('onComplete', r))
    const fontsDone = document.fonts.ready as Promise<unknown>
    const winLoad   = new Promise<void>(r => {
      if (document.readyState === 'complete') r()
      else window.addEventListener('load', () => r(), { once: true })
    })

    Promise.all([barDone, fontsDone, winLoad]).then(() => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut',
        delay: 0.1,
        onComplete: () => {
          document.body.style.overflow = ''
          // Re-measure all ScrollTrigger positions now that fonts are painted
          ScrollTrigger.refresh()
          setMounted(false)
        },
      })
    })

    return () => { document.body.style.overflow = '' }
  }, [])

  if (!mounted) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        pointerEvents: 'all',
      }}
    >
      <p style={{
        fontFamily: fonts.marund,
        fontSize: 48,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: '#ffffff',
        margin: 0,
      }}>
        SixDX
      </p>

      {/* Thin progress bar */}
      <div style={{
        width: 100,
        height: 1,
        background: 'rgba(255,255,255,0.15)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
      }}>
        <div ref={barRef} style={{
          position: 'absolute',
          inset: '0 auto 0 0',
          width: '0%',
          background: '#ffffff',
        }} />
      </div>
    </div>
  )
}
