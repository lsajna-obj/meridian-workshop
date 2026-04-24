import { test, expect } from '@playwright/test'

test.describe('Demand Forecast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demand')
    await page.waitForLoadState('networkidle')
  })

  test('renders page heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Demand Forecast', level: 2 })).toBeVisible()
    await expect(page.getByText('Analyze demand trends and forecasts')).toBeVisible()
  })

  test('renders the three trend summary cards', async ({ page }) => {
    await expect(page.getByText('Increasing Demand')).toBeVisible()
    await expect(page.getByText('Stable Demand')).toBeVisible()
    await expect(page.getByText('Decreasing Demand')).toBeVisible()
  })

  test('trend cards display item counts', async ({ page }) => {
    const counts = page.locator('.trend-count')
    const num = await counts.count()
    expect(num).toBe(3)
    for (let i = 0; i < num; i++) {
      const text = await counts.nth(i).textContent()
      expect(text?.trim()).toMatch(/\d+/)
    }
  })

  test('renders demand forecasts table with correct columns', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Demand Forecasts' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Item Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Current Demand' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Forecasted Demand' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Trend' })).toBeVisible()
  })

  test('table has data rows', async ({ page }) => {
    const rows = page.getByRole('row')
    expect(await rows.count()).toBeGreaterThan(1)
  })

  test('trend badges are visible in table rows', async ({ page }) => {
    const badges = page.locator('.trend-badge')
    expect(await badges.count()).toBeGreaterThan(0)
  })

  test('increasing items show positive percentage change', async ({ page }) => {
    const increasingRows = page.getByRole('row').filter({ hasText: /increasing/i })
    const firstChange = await increasingRows.first().locator('.change-value, td').nth(4).textContent()
    expect(firstChange?.trim()).toBeTruthy()
  })
})
