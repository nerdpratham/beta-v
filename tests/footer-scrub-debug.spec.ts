import { test, expect } from '@playwright/test'

test('footer scrub — video currentTime changes with scroll', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1500)

  // Scroll to just before the footer scrub wrapper
  await page.evaluate(() => {
    const el = document.querySelector('[data-footer-scrub]')
    el?.scrollIntoView({ behavior: 'instant', block: 'start' })
  })
  await page.waitForTimeout(800)

  // Read video time at entry
  const timeAtEntry = await page.evaluate(() => {
    const v = document.querySelector('[data-footer-scrub] video') as HTMLVideoElement | null
    return v ? v.currentTime : -1
  })
  console.log('time at entry:', timeAtEntry)

  // Scroll down 600px through the scrub section
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }))
  await page.waitForTimeout(800)

  const timeAfterDown = await page.evaluate(() => {
    const v = document.querySelector('[data-footer-scrub] video') as HTMLVideoElement | null
    return v ? v.currentTime : -1
  })
  console.log('time after scroll down:', timeAfterDown)

  // Scroll back up 600px
  await page.evaluate(() => window.scrollBy({ top: -600, behavior: 'instant' }))
  await page.waitForTimeout(800)

  const timeAfterUp = await page.evaluate(() => {
    const v = document.querySelector('[data-footer-scrub] video') as HTMLVideoElement | null
    return v ? v.currentTime : -1
  })
  console.log('time after scroll back up:', timeAfterUp)

  // Also check wrapper height and ST markers
  const debug = await page.evaluate(() => {
    const wrapper = document.querySelector('[data-footer-scrub]') as HTMLElement | null
    return {
      wrapperHeight: wrapper?.offsetHeight,
      wrapperTop: wrapper?.getBoundingClientRect().top,
      scrollY: window.scrollY,
      pageHeight: document.documentElement.scrollHeight,
    }
  })
  console.log('debug:', JSON.stringify(debug, null, 2))

  expect(timeAtEntry).toBeGreaterThanOrEqual(0)
  expect(timeAfterDown).toBeGreaterThan(timeAtEntry)
  expect(timeAfterUp).toBeLessThan(timeAfterDown)
})
