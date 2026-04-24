import { test, expect } from '@playwright/test'

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle')
  })

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Orders', level: 2 })).toBeVisible()
  })

  test('renders status summary cards', async ({ page }) => {
    // Status cards are inside .stats-grid, distinct from the filter dropdown
    const statsGrid = page.locator('.stats-grid')
    await expect(statsGrid.getByText('Delivered')).toBeVisible()
    await expect(statsGrid.getByText('Shipped')).toBeVisible()
    await expect(statsGrid.getByText('Processing')).toBeVisible()
    await expect(statsGrid.getByText('Backordered')).toBeVisible()
  })

  test('renders orders table with data', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Order Number' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Total Value' })).toBeVisible()
    expect(await page.getByRole('row').count()).toBeGreaterThan(1)
  })

  test('warehouse filter reduces orders', async ({ page }) => {
    const allRows = await page.getByRole('row').count()
    await page.getByLabel('Location').selectOption('London')
    await page.waitForLoadState('networkidle')
    expect(await page.getByRole('row').count()).toBeLessThan(allRows)
  })

  test('order status filter shows only matching orders', async ({ page }) => {
    const allRows = await page.getByRole('row').count()
    await page.getByLabel('Order Status').selectOption('delivered')
    await page.waitForLoadState('networkidle')
    expect(await page.getByRole('row').count()).toBeLessThan(allRows)
  })
})
