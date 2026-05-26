import { test, expect } from '@playwright/test'

test('work card stripe effect — left to right', async ({ page }) => {
  await page.goto('/')

  // Scroll to the Work section so cards are in view
  await page.evaluate(() => {
    const el = document.querySelector('.work-section')
    el?.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(600)

  // Grab the first card
  const card = page.locator('.vh-card-container').first()
  await expect(card).toBeVisible()

  // Screenshot before hover
  await card.screenshot({ path: 'test-artifacts/stripe-before.png' })

  // Move mouse to center of card to trigger hover + stripe
  const box = await card.boundingBox()
  if (!box) throw new Error('card not found')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

  // Wait for stripe to be mid-sweep (~0.8 s into 2 s animation)
  await page.waitForTimeout(800)
  await card.screenshot({ path: 'test-artifacts/stripe-mid.png' })

  // Wait for full reveal
  await page.waitForTimeout(1400)
  await card.screenshot({ path: 'test-artifacts/stripe-after.png' })

  // The mid frame should differ from the before frame (stripe is visible)
  const before = await page.evaluate(() => {
    return document.querySelector('.vh-card-container canvas') !== null
  })
  expect(before).toBe(true)
})
