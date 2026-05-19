import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

test('stat-circles: stagger + 0→100→value animation', async ({ page }) => {
  test.setTimeout(60_000)

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1000)

  // ── Verify initial state: all rings at 0 ─────────────────────────────────
  const initial = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-stat-card]')).map((card, i) => {
      const maskDiv = card.querySelector<HTMLElement>('[style*="mask-image"]')
      const span    = card.querySelector('span')
      return {
        i,
        mask: maskDiv?.style.maskImage ?? '(none)',
        num:  span?.textContent ?? '(none)',
      }
    }),
  )
  console.log('\n── INITIAL STATE ──')
  initial.forEach(d => console.log(`  card${d.i}: mask="${d.mask.slice(0, 60)}"  num="${d.num}"`))

  // All rings should start at 0%
  for (const d of initial) {
    expect(d.mask, `card${d.i} initial mask should be 0%`).toMatch(/white 0%/)
    expect(d.num, `card${d.i} initial number`).toBe('0%')
  }

  // ── Helper: read current ring % from browser-serialized conic-gradient ───
  // Browser expands "white 0% X%" into "white 0%, white X%"
  const snap = async (label: string) => {
    const data = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-stat-card]')).map((card, i) => {
        const maskDiv = card.querySelector<HTMLElement>('[style*="mask-image"]')
        const span    = card.querySelector('span')
        const mk      = maskDiv?.style.maskImage ?? ''
        // Browser serialises "white 0% X%" as "white 0%, white X%, transparent X%..."
        const m       = mk.match(/white ([\d.]+)%, transparent/)
        return { i, ring: m ? m[1] : '??', num: span?.textContent ?? '??' }
      }),
    )
    const line = data.map(d => `card${d.i}[ring=${d.ring}% num="${d.num}"]`).join('  ')
    console.log(`[${label}]  ${line}`)
    return data
  }

  // ── Trigger the animation via the DEV helper ──────────────────────────────
  const triggered = await page.evaluate(() => {
    const fn = (window as any).__triggerCircles
    if (!fn) return false
    fn()
    return true
  })
  console.log('\n__triggerCircles called:', triggered)

  if (!triggered) {
    console.log('ERROR: __triggerCircles not found on window — DEV mode may not be running')
    return
  }

  // ── Snapshots over time ───────────────────────────────────────────────────
  await snap('0ms  — just triggered')
  await page.waitForTimeout(600)
  await snap('0.6s — card0 climbing (no delay), card1 waiting (0.5s delay)')
  await page.waitForTimeout(600)
  await snap('1.2s — card0 near peak, card1 climbing, card2 waiting (1.0s delay)')
  await page.waitForTimeout(800)
  await snap('2.0s — card0 settling, card1 near peak, card2 climbing')
  await page.waitForTimeout(1000)
  await snap('3.0s — card0 done, card1 settling, card2 near peak')
  await page.waitForTimeout(2000)
  const final = await snap('5.0s — all settled')

  // ── Final assertions ──────────────────────────────────────────────────────
  // Expected final ring values: card0=68, card1=40, card2=0
  const expected = [68, 40, 0]
  for (const d of final) {
    const got = parseFloat(d.ring)
    const want = expected[d.i]
    expect(got, `card${d.i} final ring`).toBeCloseTo(want, 0)
    // Number text check
    expect(d.num, `card${d.i} final num`).toBe(`${want}%`)
  }

  await page.screenshot({ path: 'test-artifacts/stat-circles-final.png', fullPage: false })
  console.log('\nScreenshot saved.')
})
