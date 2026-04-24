import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('renders KPI cards with data', async ({ page }) => {
    await expect(page.getByText('Inventory Turnover Rate')).toBeVisible()
    await expect(page.getByText('Orders Fulfilled')).toBeVisible()
    await expect(page.getByText('Order Fill Rate')).toBeVisible()
    await expect(page.getByText('Revenue (Orders) YTD')).toBeVisible()
    await expect(page.getByText('Avg Processing Time (Days)')).toBeVisible()
  })

  test('renders Order Health section with totals', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Order Health' })).toBeVisible()
    await expect(page.getByText('$31,166,853').first()).toBeVisible()
    await expect(page.getByText('93.3%')).toBeVisible()
  })

  test('renders Inventory Value by Category chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory Value by Category' })).toBeVisible()
    await expect(page.getByText('$157.0K')).toBeVisible()
  })

  test('renders Inventory Shortages table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Inventory Shortages/ })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Order ID' })).toBeVisible()
  })

  test('renders Top Products by Revenue table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Top Products by Revenue' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Revenue' })).toBeVisible()
  })

  test('filter by warehouse updates data', async ({ page }) => {
    // Use the revenue KPI (4th card) — it's dynamic and changes with warehouse filter
    const revenueBefore = await page.locator('.kpi-card').nth(3).locator('.kpi-value').textContent()
    await page.getByLabel('Location').selectOption('Tokyo')
    await page.waitForLoadState('networkidle')
    const revenueAfter = await page.locator('.kpi-card').nth(3).locator('.kpi-value').textContent()
    expect(revenueAfter).not.toBe(revenueBefore)
  })
})
