import { test, expect } from '@playwright/test';

test('submit quote form', async ({ page }) => {
  await page.goto('/quote');
  await page.fill('input[placeholder="Name *"]', 'John');
  await page.fill('input[placeholder="Business Email *"]', 'john@example.com');
  await page.fill('input[placeholder="Mobile Number *"]', '1234567890');
  await page.fill('input[placeholder="Company Name *"]', 'ACME');
  await page.click('text=Submit Request');
  const response = await page.waitForResponse(r => r.url().includes('/api/quote'));
  expect(response.ok()).toBeTruthy();
});
