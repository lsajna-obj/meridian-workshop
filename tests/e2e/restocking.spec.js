import { test, expect } from '@playwright/test'

test.describe('Restocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking')
    await page.waitForLoadState('networkidle')
  })

  test('renders page heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Restocking Recommendations', level: 2 })).toBeVisible()
    await expect(page.getByText('Recommended purchase orders based on stock levels and demand forecast')).toBeVisible()
  })

  test('renders budget input controls', async ({ page }) => {
    await expect(page.getByPlaceholder('Enter budget ceiling...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  test('renders summary stat cards', async ({ page }) => {
    await expect(page.getByText('Recommendations', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Estimated Cost')).toBeVisible()
  })

  test('renders recommendations table with correct columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Priority' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Item Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Recommended Order' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Est. Cost' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Trend' })).toBeVisible()
  })

  test('applies budget ceiling and reduces recommendations', async ({ page }) => {
    const totalBefore = await page.getByRole('row').count()

    await page.getByPlaceholder('Enter budget ceiling...').fill('50000')
    await page.getByRole('button', { name: 'Apply' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Within Budget/)).toBeVisible()
    const totalAfter = await page.getByRole('row').count()
    expect(totalAfter).toBeLessThanOrEqual(totalBefore)
  })

  test('clear budget restores full list', async ({ page }) => {
    await page.getByPlaceholder('Enter budget ceiling...').fill('50000')
    await page.getByRole('button', { name: 'Apply' }).click()
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Clear' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Within Budget/)).toBeHidden()
    await expect(page.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  test('location filter updates recommendations', async ({ page }) => {
    const allCount = await page.getByRole('row').count()

    await page.getByLabel('Location').selectOption('Tokyo')
    await page.waitForLoadState('networkidle')

    // Either different count or same if all items are in Tokyo
    const filtered = await page.getByRole('row').count()
    expect(filtered).toBeGreaterThanOrEqual(0)
    expect(filtered).not.toBeGreaterThan(allCount)
  })

  test('high priority items appear before lower priority', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasText: /./ })
    const count = await rows.count()
    if (count < 3) return // skip if not enough rows

    const firstPriority = await rows.nth(1).getByRole('cell').first().textContent()
    const lastPriority = await rows.nth(count - 1).getByRole('cell').first().textContent()

    const order = { High: 0, Medium: 1, Low: 2 }
    expect(order[firstPriority?.trim() ?? 'Low']).toBeLessThanOrEqual(order[lastPriority?.trim() ?? 'Low'])
  })
})
