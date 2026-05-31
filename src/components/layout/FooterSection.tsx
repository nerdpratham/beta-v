// ─── FOOTER SECTION — SixDX ──────────────────────────────────────────────────
// Figma node : 408:246  "Footer"
// Layout     : vertical flex, space-between, padding 100px 28px 14px
// Gradient   : #fff → #faece8 → #f3d4c9 → #e49f88 → #d05b34 → #1c0b05
//
// Sections:
//   Upper  — tagline + CTA button + nav pills
//   Middle — two office columns (left) + newsletter card (right)
//   Bottom — policy links (left) + copyright (right)
//
// Newsletter card behaviour:
//   Default  : looping muted video plays in background
//   On click : video fades + signup form slides in
//   On close : form slides out + video resumes
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { gsap } from '../../animations/gsap.config'
import { fonts, colors, textStyles } from '../../styles/tokens'
import ClarteButton from '../ui/ClarteButton'

// ── Video ─────────────────────────────────────────────────────────────────────
const MACHINE_VIDEO    = '/video/Machaine000.Png.mp41111.webm'
const NEWSLETTER_VIDEO = MACHINE_VIDEO

// ── Frame sequence (footer scrub) ────────────────────────────────────────────
const FRAME_COUNT = 140
const FRAME_URLS  = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/Picflow%20Images%20May%2028/machaine000.png${String(i + 1).padStart(4, '0')}.webp`
)

// ── Footer gradient ───────────────────────────────────────────────────────────
// Extracted from Figma. Edit the color stops here to adjust the gradient.
const FOOTER_GRADIENT = `linear-gradient(
  to bottom,
  #ffffff    8.6%,
  #faece8   14.9%,
  #f3d4c9   20.7%,
  #e49f88   28.7%,
  #d05b34   38.2%,
  #1c0b05   68.0%
)`

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONTENT — edit here
// ═══════════════════════════════════════════════════════════════════════════════

const TAGLINE = 'Photorealistic. Technically accurate. Built for the environments where precision matters.'

const NAV_PILLS = [
  { label: 'Differentiators', href: '#' },
  { label: 'How SixDX Works', href: '#' },
  { label: 'Work', href: '#' },
  { label: 'Testimonials', href: '#' },
]

const OFFICES = [
  {
    region: 'India',
    company: 'Six D Engineering Solutions Pvt Ltd',
    address: 'A-167, Ground Floor, Sector - 63, Noida, Uttar Pradesh, 201 301, India',
    email: 'info@sixdengineering.com',
    phone: '+91 84481 79046',
  },
  {
    region: 'UAE',
    company: 'Six D Engineering Solutions FZC',
    address: 'B 49-130, Sharjah Research Technology & Innovation Park (SRTIP), Sharjah, United Arab Emirates',
    email: 'info@sixdengineering.com',
    phone: '+971 58 522 9400, +971 58556 6837',
  },
]

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
]

const COPYRIGHT = '© 2026 SixD. All rights reserved'

// ═══════════════════════════════════════════════════════════════════════════════
// ── NEWSLETTER CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface NewsletterState {
  email: string
}

function NewsletterCard() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<NewsletterState>({ email: '' })
  const [submitted, setSubmitted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleOpen = () => {
    setOpen(true)
    setSubmitted(false)
  }

  const handleClose = () => {
    setOpen(false)
    setForm({ email: '' })
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ email: e.target.value })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: wire to newsletter service (Mailchimp, ConvertKit, etc.)
    console.log('[Newsletter] subscribe', form.email)
    setSubmitted(true)
  }

  return (
    // Card: 329×186 in Figma, border-radius 12, white bg, overflow hidden
    <div
      onClick={!open ? handleOpen : undefined}
      className="footer-newsletter-card w-full md:w-[329px]"
      style={{
        height: 186,
        flexShrink: 0,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: open ? 'default' : 'pointer',
        background: colors.white,
      }}
    >
      {/* ── Video layer ─────────────────────────────────────────────────────
          Plays looped + muted. Fades out when form is open.
      ─────────────────────────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={NEWSLETTER_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.4s ease',
          opacity: open ? 0 : 1,
        }}
      />

      {/* ── Card label (visible when video is playing) ──────────────────── */}
      <div
        aria-hidden={open}
        style={{
          position: 'absolute',
          inset: 0,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          // Gradient so text stays readable over any video frame
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
          transition: 'opacity 0.3s ease',
          opacity: open ? 0 : 1,
          pointerEvents: 'none',
        }}
      >
        <p style={{
          ...textStyles.h4,
          color: colors.white,
          lineHeight: 1.2,
        }}>
          Sign Up to Our<br />Newsletter
        </p>
        <p style={{
          ...textStyles.label,
          color: colors.white70,
          marginTop: 4,
        }}>
          Tap to subscribe →
        </p>
      </div>

      {/* ── Signup form (slides in on click) ────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: 16,
          background: colors.white,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close newsletter form"
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: colors.ink,
            lineHeight: 1,
            fontSize: 18,
          }}
        >
          ✕
        </button>

        {submitted ? (
          // ── Success state ──
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...textStyles.h4, color: colors.brand1, marginBottom: 6 }}>
              You're in!
            </p>
            <p style={{ ...textStyles.body, color: colors.ink60 }}>
              We'll be in touch with the latest from SixDX.
            </p>
          </div>
        ) : (
          // ── Input state ──
          <>
            <p style={{
              ...textStyles.h4,
              color: colors.ink,
              lineHeight: 1.2,
              marginBottom: 12,
            }}>
              Sign Up to Our<br />Newsletter
            </p>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{
                  ...textStyles.body,
                  width: '100%',
                  padding: '8px 10px',
                  border: `1px solid ${colors.ink10}`,
                  borderRadius: 4,
                  background: colors.ink05,
                  color: colors.ink,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                style={{
                  ...textStyles.bodyMedium,
                  width: '100%',
                  padding: '8px 0',
                  background: colors.brand1,
                  color: colors.white,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Subscribe
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── FOOTER SCROLL-SCRUB — canvas frame sequence
// ═══════════════════════════════════════════════════════════════════════════════

function FooterVideoScrub() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas  = canvasRef.current
    if (!wrapper || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ── Preload all frames eagerly ─────────────────────────────────────────
    const images: HTMLImageElement[] = FRAME_URLS.map(src => {
      const img = new Image()
      img.src = src
      return img
    })

    // ── Resize canvas internal resolution to match CSS size ───────────────
    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth  * dpr
      const h = canvas.offsetHeight * dpr
      // Only reassign when dimensions actually change — assigning always clears the canvas
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w
        canvas.height = h
      }
    }
    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(canvas)

    // ── Draw a frame with object-fit:cover behaviour ───────────────────────
    const drawFrame = (img: HTMLImageElement) => {
      if (!img.complete || img.naturalWidth === 0) return
      const cw = canvas.width,  ch = canvas.height
      const iw = img.naturalWidth, ih = img.naturalHeight
      let sx, sy, sw, sh
      if (iw / ih > cw / ch) {
        sh = ih; sw = sh * (cw / ch)
        sx = (iw - sw) / 2; sy = 0
      } else {
        sw = iw; sh = sw * (ch / cw)
        sx = 0; sy = (ih - sh) / 2
      }
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
    }

    // ── Find the nearest loaded frame to avoid blank canvas during load ────
    const drawBestFrame = (targetIdx: number) => {
      if (images[targetIdx].complete && images[targetIdx].naturalWidth > 0) {
        drawFrame(images[targetIdx])
        return
      }
      for (let d = 1; d < FRAME_COUNT; d++) {
        const lo = images[Math.max(0, targetIdx - d)]
        if (lo.complete && lo.naturalWidth > 0) { drawFrame(lo); return }
        const hi = images[Math.min(FRAME_COUNT - 1, targetIdx + d)]
        if (hi.complete && hi.naturalWidth > 0) { drawFrame(hi); return }
      }
    }

    // ── Scroll tracking + RAF loop ─────────────────────────────────────────
    const setScale    = gsap.quickSetter(canvas, 'scale')
    let targetProgress = 0
    let rafId: number

    const handleScroll = () => {
      const rect   = wrapper.getBoundingClientRect()
      const travel = wrapper.offsetHeight - window.innerHeight
      if (travel <= 0) return
      targetProgress = Math.max(0, Math.min(1, -rect.top / travel))
    }

    const tick = () => {
      setScale(1 + targetProgress * 0.6)
      const idx = Math.min(FRAME_COUNT - 1, Math.floor(targetProgress * FRAME_COUNT))
      drawBestFrame(idx)
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={wrapperRef} data-footer-scrub style={{ height: '400svh', background: '#1c0b05' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100svh', overflow: 'hidden',
        background: 'linear-gradient(180deg, #3d1508 0%, #7a2d10 28%, #c45020 55%, #7a2d10 78%, #1c0b05 100%)',
      }}>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ width: '100%', height: '100%', display: 'block', transformOrigin: '62% 40%', willChange: 'transform' }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function FooterSection() {
  return (
    // ── Outer shell — no background here so the gradient isn't stretched by
    // the Motor section's GSAP spacer (which inflates the element to ~660svh).
    // Each visual block owns its own background instead.
    <footer
      aria-label="Footer"
      data-theme="light"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >

      {/* ══════════════════════════════════════════════════════════════════════
          GRADIENT BLOCK — carries the Figma gradient on a fixed-height div
          so the colour stops work correctly regardless of what comes after.
          Contains: CTA_Container (tagline + button + pills)
                  + Main Container (offices + newsletter)
          Padding matches original footer: 100px top, 28px sides, 60px bottom.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="footer-gradient-block flex flex-col gap-10 md:gap-[200px] w-full" style={{
        background: FOOTER_GRADIENT,
        paddingTop: 100,
        paddingRight: 28,
        paddingBottom: 14,
        paddingLeft: 28,
        boxSizing: 'border-box',
      }}>

        {/* ── CTA_CONTAINER — Figma 408:247 ────────────────────────────────── */}
        <div className="flex flex-col gap-10 relative z-10">

          {/* CTA block: tagline + button */}
          <div className="flex flex-col gap-8">
            <h2 className="footer-tagline" style={{
              fontFamily: fonts.hn,
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
              color: colors.ink,
              width: 878,
              maxWidth: '100%',
              margin: 0,
            }}>
              {TAGLINE}
            </h2>

            <div>
              <ClarteButton label="Get in touch" href="#contact" className="clarte-button--nav" />
            </div>
          </div>

          {/* Menu Container — nav pills */}
          <div className="footer-nav-pills flex flex-col md:flex-row gap-[2px] w-full">
            {NAV_PILLS.map(pill => (
              <a
                key={pill.label}
                href={pill.href}
                className="flex items-center justify-start md:justify-center flex-1 w-full rounded-[2px] py-[14px] px-4 md:py-1 md:px-4 no-underline transition-colors duration-200"
                style={{
                  ...textStyles.body,
                  boxSizing: 'border-box',
                  color: colors.ink, // Using ink instead of white, based on light background
                  background: 'rgba(255, 255, 255, 0.4)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)')}
              >
                {pill.label}
              </a>
            ))}
          </div>

        </div>

        {/* ── MAIN CONTAINER — offices (left) + newsletter card (right) ─────── */}
        <div className="footer-main-row flex flex-col md:flex-row justify-between items-start w-full gap-10 md:gap-4 relative z-10">

          {/* Office info columns */}
          <div className="footer-offices flex flex-col md:flex-row gap-10 md:gap-[28px] w-full md:w-[560px] shrink-0">
            {OFFICES.map(office => (
              <div
                key={office.region}
                className="flex flex-col gap-4 flex-1 min-w-0"
              >
                <p style={{ ...textStyles.h4, color: colors.white, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {office.region}
                </p>
                <div style={{ width: '100%', height: 1, background: colors.white08, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ ...textStyles.label, lineHeight: 1.28, color: colors.white50 }}>
                    {office.company}<br />{office.address}
                  </p>
                  <p style={{ ...textStyles.label, lineHeight: 1.28, color: colors.white50 }}>
                    {office.email}
                  </p>
                  <p style={{ ...textStyles.label, lineHeight: 1.28, color: colors.white50 }}>
                    {office.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <NewsletterCard />
        </div>

      </div>{/* end GRADIENT BLOCK */}

      {/* ── Scroll-scrubbed frame animation — seamless continuation of footer gradient ── */}
      <FooterVideoScrub />

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER BOTTOM — policies (left) + copyright (right)
          Uses the darkest gradient stop (#1c0b05) as a flat background so it
          reads as a seamless continuation of the footer palette.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="footer-bottom-bar flex flex-col md:flex-row justify-between items-center gap-4 md:gap-2 px-3 pb-3 md:px-7 md:pb-[14px] w-full box-border" style={{
        background: '#1c0b05',
      }}>

        <div style={{ display: 'flex', gap: 24 }}>
          {POLICY_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: fonts.hn,
                fontSize: '0.625rem',
                letterSpacing: '0em',
                lineHeight: 1.4,
                fontWeight: 'normal',
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <p style={{
          fontFamily: fonts.hn,
          fontSize: '0.625rem',
          letterSpacing: '0em',
          lineHeight: 1.4,
          fontWeight: 'normal',
          color: 'rgba(28,11,5,0.50)',
          margin: 0,
        }}>
          {COPYRIGHT}
        </p>

      </div>

    </footer>
  )
}
