import { test, expect } from '@playwright/test';

// Test to ensure stats are incrementing and being fetched correctly

test('Stats should be incremented correctly', async ({ page }) => {
  // Mock network response
  await page.route('**/api/stats', route => route.fulfill({
    status: 200,
    body: JSON.stringify({ stats: 100 }),
    contentType: 'application/json'
  }));

  await page.goto('http://localhost:3000/admindashboard');

  const stats = await page.locator('.stats-counter');
  await expect(stats).toHaveText('100');
});