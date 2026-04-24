import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders app header with company name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Meridian Components' })).toBeVisible()
    await expect(page.getByText('Inventory Management System')).toBeVisible()
  })

  test('renders all nav links', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Inventory' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Orders' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Finance' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Demand Forecast' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Reports' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Restocking' })).toBeVisible()
  })

  test('navigates to each main view', async ({ page }) => {
    const routes = [
      { link: 'Inventory', heading: 'Inventory' },
      { link: 'Orders', heading: 'Orders' },
      { link: 'Finance', heading: 'Finance Dashboard' },
      { link: 'Demand Forecast', heading: 'Demand Forecast' },
      { link: 'Reports', heading: 'Performance Reports' },
      { link: 'Restocking', heading: 'Restocking Recommendations' },
    ]

    for (const { link, heading } of routes) {
      await page.getByRole('link', { name: link }).click()
      await expect(page.getByRole('heading', { name: heading, level: 2 })).toBeVisible()
    }
  })

  test('filter bar is present on every view', async ({ page }) => {
    const links = ['Inventory', 'Orders', 'Finance', 'Reports', 'Restocking']
    for (const link of links) {
      await page.getByRole('link', { name: link }).click()
      await expect(page.getByRole('combobox').first()).toBeVisible()
    }
  })
})
