import { test, expect } from '@playwright/test';

test('submit quote form', async ({ page }) => {
  await page.goto('/quote');
  await page.fill('input[placeholder="John Doe"]', 'John Doe');
  await page.fill('input[placeholder="john@company.com"]', 'john@example.com');
  await page.fill('input[placeholder="(555) 123-4567"]', '1234567890');
  await page.fill('input[placeholder="Your Company Inc."]', 'ACME');
  await page.click('text=Select a service');
  await page.click('text=Warehousing');
  await page.fill('textarea[placeholder^="Please describe"]', 'Test project');
  await page.check('input[type="checkbox"]');
  await page.click('text=Submit Quote Request');
  const response = await page.waitForResponse(r => r.url().includes('/api/quote-requests'));
  expect(response.ok()).toBeTruthy();
});
