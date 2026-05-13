import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const SHOTS = path.join(__dirname, '..', 'test-artifacts', 'screenshots', 'stack')

test.beforeAll(() => { fs.mkdirSync(SHOTS, { recursive: true }) })

// Simulate a real phone viewport where svh < vh.
// Standard Android Chrome: lvh=851, svh=795 (56px URL bar + 0px gesture nav in headless).
// We force a viewport that's taller than what headless normally gives, then
// override --stack-progress manually so we can inspect the height mismatch.
test.use({ viewport: { width: 393, height: 851 } })

// ─── helper ───────────────────────────────────────────────────────────────────
/** Scroll to an absolute position and wait for GSAP scrub:1 to settle. */
async function scrollTo(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never, y: number) {
  await page.evaluate((pos) => window.scrollTo({ top: pos, behavior: 'instant' }), y)
  await page.waitForTimeout(1400)  // scrub:1 needs up to 1s to catch up
}

// ─── TEST 1: section height vs expanding-div height ───────────────────────────
test('expanding image div height matches section height (no gap)', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(600)

  // getBoundingClientRect().top + scrollY gives the absolute page position
  // even after GSAP inserts a pin-spacer wrapper (which makes offsetTop = 0).
  const stackTop = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('section[aria-label="Industrial training outcomes"]')
    const rect = section?.getBoundingClientRect()
    return rect ? rect.top + window.scrollY : 0
  })

  // Scroll to the very start of the StackSection so GSAP activates the pin
  await scrollTo(page, stackTop)

  // Collect heights before any animation progress
  const preAnim = await page.evaluate(() => {
    const section    = document.querySelector<HTMLElement>('section[aria-label="Industrial training outcomes"]')!
    const imageDiv   = section.querySelector<HTMLElement>('[aria-label="Stats section"]')!
    const cs         = getComputedStyle(section)
    const ci         = getComputedStyle(imageDiv)
    return {
      viewport:       { w: window.innerWidth, h: window.innerHeight },
      sectionHeight:  cs.height,
      sectionOffset:  section.offsetHeight,
      imageDivHeight: ci.height,
      imageDivOffset: imageDiv.offsetHeight,
      heightDelta:    section.offsetHeight - imageDiv.offsetHeight,
    }
  })

  console.log('─── BEFORE animation:')
  console.log(JSON.stringify(preAnim, null, 2))

  // heightDelta > 0 means the image div is shorter than the section → gap exists
  if (preAnim.heightDelta !== 0) {
    console.warn(
      `⚠  Height mismatch: section=${preAnim.sectionOffset}px, imageDiv=${preAnim.imageDivOffset}px, gap=${preAnim.heightDelta}px`
    )
    console.warn('   On real devices svh < vh — this gap shows as white space at top and bottom.')
  }

  await page.screenshot({ path: path.join(SHOTS, '01-stack-at-entry.png'), fullPage: false })

  // ── Scroll to Phase 1 complete (image fully covers viewport) ─────────────
  // Timeline: end = '+=560%' of section height = 5.6 × sectionHeight.
  // Phase 1 runs 0→1 out of a 2.5-unit total, so it ends at 1/2.5 = 40% of scroll.
  // Phase 1 ends at timeline 1.0/2.5 = 40% of scroll.
  // Scroll to 70% so we're deep into Phase 2 — scrub:1 has 1.4s to fully settle
  // and --stack-progress is guaranteed to be 1.0 long before this position.
  const phase1EndScroll = stackTop + Math.round(0.70 * 5.6 * preAnim.sectionOffset)
  await scrollTo(page, phase1EndScroll)

  const postAnim = await page.evaluate(() => {
    const section  = document.querySelector<HTMLElement>('section[aria-label="Industrial training outcomes"]')!
    const imageDiv = section.querySelector<HTMLElement>('[aria-label="Stats section"]')!
    return {
      imageDivWidth:  imageDiv.offsetWidth,
      imageDivHeight: imageDiv.offsetHeight,
      sectionHeight:  section.offsetHeight,
      heightDelta:    section.offsetHeight - imageDiv.offsetHeight,
      stackProgress:  getComputedStyle(section).getPropertyValue('--stack-progress').trim(),
    }
  })

  console.log('─── AFTER phase-1 full expansion:')
  console.log(JSON.stringify(postAnim, null, 2))

  await page.screenshot({ path: path.join(SHOTS, '02-stack-phase1-complete.png'), fullPage: false })

  const vp = page.viewportSize()!

  // Image width must be at least the viewport width (gate is open)
  expect(postAnim.imageDivWidth, 'Image div should be at least 100vw wide at full expansion')
    .toBeGreaterThanOrEqual(vp.width - 2)

  // ── KEY ASSERTION: image height must equal the section/viewport height ────
  expect(
    postAnim.heightDelta,
    `Height gap = ${postAnim.heightDelta}px. Image div (${postAnim.imageDivHeight}px) ` +
    `is shorter than section (${postAnim.sectionHeight}px). ` +
    `This leaves ${postAnim.heightDelta / 2}px white space at top and bottom on real devices.`,
  ).toBeLessThanOrEqual(0)
})

// ─── TEST 2: phase 2 screenshot (stats visible) ───────────────────────────────
test('stats visible at phase 2 — screenshot', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(600)

  const { stackTop, sectionH } = await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('section[aria-label="Industrial training outcomes"]')!
    const rect = s.getBoundingClientRect()
    return { stackTop: rect.top + window.scrollY, sectionH: s.offsetHeight }
  })

  // Phase 2 starts at timeline pos 1.1 / 2.5 = 44% of scroll
  const phase2Scroll = stackTop + Math.round(0.50 * 5.6 * sectionH)
  await scrollTo(page, phase2Scroll)

  await page.screenshot({ path: path.join(SHOTS, '03-stack-phase2-stats.png'), fullPage: false })

  // The heading should be in the DOM and visible
  const headingVisible = await page.evaluate(() => {
    const section  = document.querySelector<HTMLElement>('section[aria-label="Industrial training outcomes"]')!
    const headings = section.querySelectorAll('p')
    for (const p of headings) {
      const style = getComputedStyle(p)
      if (parseFloat(style.opacity) > 0.5 && p.textContent?.includes('Standard')) return true
    }
    return false
  })

  console.log('Heading visible at phase 2:', headingVisible)
})

// ─── TEST 3: svh vs vh dimension report ──────────────────────────────────────
test('report svh, dvh, vh values in this browser', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const units = await page.evaluate(() => {
    const measure = (val: string) => {
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;top:0;left:0;height:${val};width:1px;visibility:hidden;`
      document.body.appendChild(el)
      const h = el.offsetHeight
      document.body.removeChild(el)
      return h
    }
    return {
      vh:  measure('100vh'),
      svh: measure('100svh'),
      dvh: measure('100dvh'),
      lvh: measure('100lvh'),
      innerHeight: window.innerHeight,
      note: 'On real devices svh < vh; gap = section(vh) - imageDiv(svh)',
    }
  })

  console.log('─── Viewport unit comparison:')
  console.log(JSON.stringify(units, null, 2))
  fs.writeFileSync(
    path.join(SHOTS, '..', 'viewport-units.json'),
    JSON.stringify(units, null, 2),
  )

  // In headless there is no browser chrome, so all units are equal
  // On a real device, svh < dvh <= lvh == vh
  console.log(
    units.svh < units.vh
      ? `⚠  svh(${units.svh}) < vh(${units.vh}) — gap = ${units.vh - units.svh}px`
      : `✓  svh == vh == ${units.vh}px (headless — no browser chrome)`,
  )
})
