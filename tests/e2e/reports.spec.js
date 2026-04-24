import { test, expect } from '@playwright/test'

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
  })

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Performance Reports', level: 2 })).toBeVisible()
  })

  test('renders Quarterly Performance table with data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quarterly Performance' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Quarter' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Total Orders' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Fulfillment Rate' })).toBeVisible()
    await expect(page.getByText(/Q\d-2025/).first()).toBeVisible()
  })

  test('renders Monthly Revenue Trend chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Revenue Trend' })).toBeVisible()
  })

  test('renders Month-over-Month Analysis table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Month-over-Month Analysis' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Growth Rate' })).toBeVisible()
  })

  test('renders summary stat cards', async ({ page }) => {
    await expect(page.getByText('Total Revenue (YTD)')).toBeVisible()
    await expect(page.getByText('Avg Monthly Revenue')).toBeVisible()
    await expect(page.getByText('Total Orders (YTD)')).toBeVisible()
    await expect(page.getByText('Best Performing Quarter')).toBeVisible()
  })

  test('location filter updates quarterly data', async ({ page }) => {
    const allRows = await page.getByText(/Q\d-2025/).count()
    expect(allRows).toBeGreaterThan(0)

    const firstOrderCount = await page.getByRole('row').nth(1).getByRole('cell').nth(1).textContent()

    await page.getByLabel('Location').selectOption('Tokyo')
    await page.waitForLoadState('networkidle')

    const filteredOrderCount = await page.getByRole('row').nth(1).getByRole('cell').nth(1).textContent()
    expect(Number(filteredOrderCount)).toBeLessThan(Number(firstOrderCount))
  })

  test('category filter updates data', async ({ page }) => {
    await page.getByLabel('Category').selectOption('sensors')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Q\d-2025/).first()).toBeVisible()
  })

  test('reset filter restores full data', async ({ page }) => {
    await page.getByLabel('Location').selectOption('London')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /reset/i }).click()
    await page.waitForTimeout(300)
    await page.waitForLoadState('networkidle')

    const quarterRows = await page.getByText(/Q\d-2025/).count()
    expect(quarterRows).toBeGreaterThan(0)
  })
})
