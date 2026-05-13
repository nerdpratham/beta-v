import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const SCREENSHOTS = path.join(__dirname, '..', 'test-artifacts', 'screenshots')

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS, { recursive: true })
})

// All tests run at Pixel 5 viewport (393 × 851)
test.use({ viewport: { width: 393, height: 851 } })

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Returns dimensions of the hero section and its scroll-wrapper. */
async function getHeroDims(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  return page.evaluate(() => {
    const section = document.querySelector('section[aria-label="Hero"]') as HTMLElement | null
    const wrapper = document.querySelector('.hero-scroll-wrapper') as HTMLElement | null
    const cs = section ? getComputedStyle(section) : null
    const cw = wrapper ? getComputedStyle(wrapper) : null
    return {
      viewport:     { w: window.innerWidth, h: window.innerHeight },
      scrollY:      window.scrollY,
      svhSupport:   CSS.supports('height', '1svh'),
      dvhSupport:   CSS.supports('height', '1dvh'),
      section: section ? {
        offsetTop:    section.offsetTop,
        offsetHeight: section.offsetHeight,
        clientHeight: section.clientHeight,
        height:       cs!.height,
        position:     cs!.position,
        top:          cs!.top,
        overflow:     cs!.overflow,
      } : null,
      wrapper: wrapper ? {
        offsetTop:    wrapper.offsetTop,
        offsetHeight: wrapper.offsetHeight,
        height:       cw!.height,
      } : null,
      body: {
        margin:  getComputedStyle(document.body).margin,
        padding: getComputedStyle(document.body).padding,
      },
    }
  })
}

// ─── TEST 1: full-height coverage ─────────────────────────────────────────────

test('hero section fills full viewport at page load — no white space', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  // Let GSAP and Lenis initialise
  await page.waitForTimeout(900)

  await page.screenshot({ path: path.join(SCREENSHOTS, '01-hero-initial-load.png'), fullPage: false })

  const { height: vph, width: vpw } = page.viewportSize()!
  const heroBox = await page.locator('section[aria-label="Hero"]').boundingBox()

  console.log('─── viewport:', vpw, '×', vph)
  console.log('─── heroBox:', heroBox)

  expect(heroBox, 'Hero section must be in the DOM').not.toBeNull()

  // White space above: hero top should sit at y ≈ 0
  expect(
    heroBox!.y,
    `White space ABOVE hero: ${heroBox!.y.toFixed(1)}px`,
  ).toBeLessThanOrEqual(1)

  // White space below: hero bottom should reach viewport bottom
  const heroBottom = heroBox!.y + heroBox!.height
  expect(
    heroBottom,
    `White space BELOW hero: ${(vph - heroBottom).toFixed(1)}px`,
  ).toBeGreaterThanOrEqual(vph - 1)
})

// ─── TEST 2: background colour at viewport edges ───────────────────────────────

test('no white background visible at top or bottom edge', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(600)

  const edgeColors = await page.evaluate((vp) => {
    const sample = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)
      if (!el) return { el: null, bg: null }
      const bg = getComputedStyle(el).backgroundColor
      return { el: `${el.tagName}#${el.id}.${el.className.toString().split(' ')[0]}`, bg }
    }
    const cx = vp.width / 2
    return {
      topCenter:    sample(cx, 2),
      bottomCenter: sample(cx, vp.height - 2),
      topLeft:      sample(2, 2),
      bottomLeft:   sample(2, vp.height - 2),
    }
  }, page.viewportSize()!)

  console.log('─── edge background colours:')
  console.log(JSON.stringify(edgeColors, null, 2))

  await page.screenshot({ path: path.join(SCREENSHOTS, '02-edges-check.png'), fullPage: false })

  for (const [pos, info] of Object.entries(edgeColors)) {
    expect(info.bg, `${pos} edge should not be plain white`).not.toBe('rgb(255, 255, 255)')
  }
})

// ─── TEST 3: dimension log — svh / computed heights ───────────────────────────

test('log hero and wrapper computed dimensions', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)

  const dims = await getHeroDims(page)

  console.log('─── computed dimensions:')
  console.log(JSON.stringify(dims, null, 2))

  // Write a JSON log for offline inspection
  const logPath = path.join(SCREENSHOTS, '..', 'dimensions-log.json')
  fs.writeFileSync(logPath, JSON.stringify(dims, null, 2))

  // Section height should be close to the viewport height (within 2px tolerance)
  expect(
    dims.section?.offsetHeight ?? 0,
    'Hero offsetHeight should approximate viewport height',
  ).toBeGreaterThanOrEqual((dims.viewport.h) - 2)
})

// ─── TEST 4: mid-scroll screenshot ────────────────────────────────────────────

test('hero stays pinned at mid-scroll — no gap visible', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(600)

  // Scroll to 50% of the wrapper height (middle of the sticky scroll section)
  await page.evaluate(() => {
    const wrapper = document.querySelector('.hero-scroll-wrapper') as HTMLElement
    if (wrapper) window.scrollTo({ top: wrapper.offsetHeight / 2, behavior: 'instant' })
  })
  await page.waitForTimeout(400)

  await page.screenshot({ path: path.join(SCREENSHOTS, '03-scroll-midpoint.png'), fullPage: false })

  const heroBox = await page.locator('section[aria-label="Hero"]').boundingBox()
  const { height: vph } = page.viewportSize()!

  console.log('─── heroBox at mid-scroll:', heroBox)

  // At mid-scroll the section should still be sticky at the top, filling the viewport
  expect(heroBox?.y ?? 999, 'Hero should be sticky at top during scroll').toBeLessThanOrEqual(1)
  expect((heroBox?.y ?? 0) + (heroBox?.height ?? 0), 'Hero should still fill viewport during scroll')
    .toBeGreaterThanOrEqual(vph - 1)
})

// ─── TEST 5: full-page reference screenshot ───────────────────────────────────

test('full-page reference screenshot', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  await page.screenshot({ path: path.join(SCREENSHOTS, '04-full-page.png'), fullPage: true })
  // This test just captures — no assertion. Use the screenshot to visually inspect.
})
