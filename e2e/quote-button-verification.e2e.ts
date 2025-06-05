import { test, expect } from '@playwright/test';

test.describe('Comprehensive Quote Button Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage for each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Navbar "Get a Quote" button navigates to /quote page', async ({ page }) => {
    // Find and click the navbar quote button
    const navbarQuoteButton = page.locator('nav').getByRole('button', { name: /get.*quote/i });
    await expect(navbarQuoteButton).toBeVisible();
    
    await navbarQuoteButton.click();
    
    // Verify navigation to quote page
    await expect(page).toHaveURL('/quote');
    
    // Verify quote page content loads
    await expect(page.getByRole('heading', { name: /request.*quote/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('Hero section "Request a Quote" button navigates to /quote page', async ({ page }) => {
    // Find and click the hero section quote button
    const heroQuoteButton = page.getByRole('button', { name: /request.*quote/i });
    await expect(heroQuoteButton).toBeVisible();
    
    await heroQuoteButton.click();
    
    // Verify navigation to quote page
    await expect(page).toHaveURL('/quote');
    
    // Verify quote form is present
    await expect(page.getByLabel(/company/i)).toBeVisible();
    await expect(page.getByLabel(/phone/i)).toBeVisible();
  });

  test('CTA section "Get a Free Quote" button navigates to /quote page', async ({ page }) => {
    // Scroll to CTA section first
    await page.locator('[data-testid="cta-section"], .cta-section').scrollIntoViewIfNeeded();
    
    // Find and click the CTA quote button
    const ctaQuoteButton = page.getByRole('button', { name: /get.*free.*quote/i });
    await expect(ctaQuoteButton).toBeVisible();
    
    await ctaQuoteButton.click();
    
    // Verify navigation to quote page
    await expect(page).toHaveURL('/quote');
    
    // Verify form functionality
    await expect(page.getByLabel(/service/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test('Mobile menu quote button navigates to /quote page', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const mobileMenuButton = page.getByLabel(/menu/i);
    await mobileMenuButton.click();
    
    // Click mobile quote button
    const mobileQuoteButton = page.getByRole('button', { name: /get.*quote/i });
    await expect(mobileQuoteButton).toBeVisible();
    await mobileQuoteButton.click();
    
    // Verify navigation
    await expect(page).toHaveURL('/quote');
    
    // Verify mobile-responsive form
    await expect(page.getByRole('heading', { name: /request.*quote/i })).toBeVisible();
  });

  test('Quote page form submission works correctly', async ({ page }) => {
    await page.goto('/quote');
    
    // Fill out the quote form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/phone/i).fill('555-123-4567');
    await page.getByLabel(/company/i).fill('Test Company');
    
    // Select service (assuming dropdown)
    await page.getByLabel(/service/i).click();
    await page.getByRole('option', { name: /fulfillment/i }).click();
    
    // Fill message
    await page.getByLabel(/message/i).fill('Test quote request message');
    
    // Check consent checkbox if present
    const consentCheckbox = page.getByLabel(/consent|agree|terms/i);
    if (await consentCheckbox.isVisible()) {
      await consentCheckbox.check();
    }
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /submit|send/i });
    await submitButton.click();
    
    // Verify success (adjust based on actual success behavior)
    await expect(page.getByText(/thank you|success|submitted/i)).toBeVisible({ timeout: 10000 });
  });

  test('All quote buttons are accessible and have proper ARIA labels', async ({ page }) => {
    // Test navbar button accessibility
    const navbarButton = page.locator('nav').getByRole('button', { name: /get.*quote/i });
    await expect(navbarButton).toHaveAttribute('aria-label');
    
    // Test hero button accessibility
    const heroButton = page.getByRole('button', { name: /request.*quote/i });
    await expect(heroButton).toHaveAttribute('aria-label');
    
    // Scroll to CTA section
    await page.locator('[data-testid="cta-section"], .cta-section').scrollIntoViewIfNeeded();
    
    // Test CTA button accessibility
    const ctaButton = page.getByRole('button', { name: /get.*free.*quote/i });
    await expect(ctaButton).toBeVisible();
  });

  test('Quote buttons work on service pages', async ({ page }) => {
    // Test quote buttons on a service page
    await page.goto('/services/order-fulfillment');
    await page.waitForLoadState('networkidle');
    
    // Find quote button on service page (may vary by implementation)
    const servicePageQuoteButton = page.getByRole('button', { name: /get.*quote|request.*quote/i }).first();
    
    if (await servicePageQuoteButton.isVisible()) {
      await servicePageQuoteButton.click();
      await expect(page).toHaveURL('/quote');
    }
  });

  test('Quote page loads correctly with pre-selected service', async ({ page }) => {
    // Test direct navigation to quote page with service parameter
    await page.goto('/quote?service=Fulfillment Services');
    
    // Verify the service is pre-selected
    await expect(page.getByLabel(/service/i)).toHaveValue(/fulfillment/i);
  });

  test('Quote page back button functionality', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to quote page
    const heroButton = page.getByRole('button', { name: /request.*quote/i });
    await heroButton.click();
    await expect(page).toHaveURL('/quote');
    
    // Test back button
    const backButton = page.getByRole('button', { name: /back/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('Cross-page consistency of quote button behavior', async ({ page }) => {
    const pagesToTest = [
      '/',
      '/about',
      '/services/order-fulfillment',
      '/old-home'
    ];

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Find any quote button on the page
      const quoteButtons = page.getByRole('button', { name: /get.*quote|request.*quote/i });
      const buttonCount = await quoteButtons.count();
      
      if (buttonCount > 0) {
        // Test first quote button found
        await quoteButtons.first().click();
        
        // Verify navigation to quote page
        await expect(page).toHaveURL('/quote');
        
        // Navigate back for next test
        await page.goBack();
      }
    }
  });

  test('Performance: Quote page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/quote');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Verify critical elements are visible
    await expect(page.getByRole('heading', { name: /request.*quote/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });
});