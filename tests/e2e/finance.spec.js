import { test, expect } from '@playwright/test'

test.describe('Finance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spending')
    await page.waitForLoadState('networkidle')
  })

  test('renders page heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Finance Dashboard', level: 2 })).toBeVisible()
    await expect(page.getByText('Track revenue, costs, and financial performance')).toBeVisible()
  })

  test('renders summary KPI cards', async ({ page }) => {
    await expect(page.getByText('Total Revenue')).toBeVisible()
    await expect(page.getByText('Total Costs')).toBeVisible()
    await expect(page.getByText('Net Profit')).toBeVisible()
    await expect(page.getByText('Avg Order Value')).toBeVisible()
  })

  test('KPI values are non-empty dollar amounts', async ({ page }) => {
    const statValues = page.locator('.stat-value')
    const count = await statValues.count()
    expect(count).toBeGreaterThanOrEqual(4)
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = await statValues.nth(i).textContent()
      expect(text?.trim()).toMatch(/[\$¥]/)
    }
  })

  test('renders Monthly Revenue vs Costs chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Revenue vs Costs' })).toBeVisible()
  })

  test('renders Monthly Cost Flow chart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Cost Flow' })).toBeVisible()
  })

  test('renders Spending by Category section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Spending by Category' })).toBeVisible()
  })

  test('renders Recent Transactions table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Transactions' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Vendor' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Amount' })).toBeVisible()
    const rows = page.getByRole('row')
    expect(await rows.count()).toBeGreaterThan(1)
  })

  test('transaction amounts are currency values', async ({ page }) => {
    const amountCells = page.getByRole('row').filter({ hasText: /./ }).locator('td').last()
    const first = await amountCells.first().textContent()
    expect(first?.trim()).toMatch(/[\$¥]/)
  })
})
