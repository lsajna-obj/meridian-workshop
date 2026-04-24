import { test, expect } from '@playwright/test'

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
  })

  test('renders page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory', level: 2 })).toBeVisible()
  })

  test('renders item count and search box', async ({ page }) => {
    await expect(page.getByPlaceholder('Search by item name...')).toBeVisible()
    await expect(page.getByText(/\d+ SKUs/)).toBeVisible()
  })

  test('renders inventory table with data', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Item Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Location' })).toBeVisible()
    expect(await page.getByRole('row').count()).toBeGreaterThan(1)
  })

  test('warehouse filter reduces item count', async ({ page }) => {
    const allRows = await page.getByRole('row').count()
    await page.getByLabel('Location').selectOption('Tokyo')
    await page.waitForLoadState('networkidle')
    expect(await page.getByRole('row').count()).toBeLessThan(allRows)
  })

  test('category filter reduces item count', async ({ page }) => {
    const allRows = await page.getByRole('row').count()
    await page.getByLabel('Category').selectOption('sensors')
    await page.waitForLoadState('networkidle')
    expect(await page.getByRole('row').count()).toBeLessThan(allRows)
  })
})
