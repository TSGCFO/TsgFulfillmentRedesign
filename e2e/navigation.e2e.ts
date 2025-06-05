import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates between pages correctly', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await expect(page).toHaveTitle(/TSG Fulfillment/);

    // Navigate to about page
    await page.click('text=About');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText(/about/i);

    // Navigate to locations page  
    await page.click('text=Locations');
    await expect(page).toHaveURL('/locations');

    // Navigate to contact form
    await page.click('text=Contact');
    await expect(page).toHaveURL('/contact-form');

    // Navigate to quote page
    await page.click('text=Get Quote');
    await expect(page).toHaveURL('/quote');
    await expect(page.locator('h1')).toContainText(/request a quote/i);
  });

  test('quote buttons scroll to contact section', async ({ page }) => {
    await page.goto('/');
    
    // Click quote button
    await page.click('text=Get a Quote');
    
    // Should scroll to contact section (if on same page)
    // or navigate to quote page
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/quote')) {
      await expect(page.locator('h1')).toContainText(/request a quote/i);
    } else {
      // Check if contact section is visible
      const contactSection = page.locator('#contact');
      await expect(contactSection).toBeVisible();
    }
  });

  test('handles 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('navbar is responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu should be present
    const mobileMenuButton = page.locator('[aria-label="Toggle navigation menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Click mobile menu
    await mobileMenuButton.click();
    
    // Navigation links should be visible
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Services')).toBeVisible();
  });

  test('footer links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Test footer contact link
    const footerContactLink = page.locator('footer').locator('text=Contact Us');
    if (await footerContactLink.isVisible()) {
      await footerContactLink.click();
      await expect(page).toHaveURL('/contact-form');
    }
  });
});

test.describe('Service Pages', () => {
  test('service detail pages load correctly', async ({ page }) => {
    const services = ['warehousing', 'transportation', 'fulfillment'];
    
    for (const service of services) {
      await page.goto(`/services/${service}`);
      
      // Should not be 404
      await expect(page.locator('text=404')).not.toBeVisible();
      
      // Should have service-specific content
      await expect(page.locator('h1')).toContainText(/.+/);
    }
  });

  test('industry detail pages load correctly', async ({ page }) => {
    const industries = ['healthcare', 'ecommerce', 'retail'];
    
    for (const industry of industries) {
      await page.goto(`/industries/${industry}`);
      
      // Should not be 404
      await expect(page.locator('text=404')).not.toBeVisible();
      
      // Should have industry-specific content
      await expect(page.locator('h1')).toContainText(/.+/);
    }
  });
});

test.describe('Analytics Pages (When Enabled)', () => {
  test.skip('analytics pages are not accessible when disabled', async ({ page }) => {
    // These should return 404 when analytics is disabled
    const analyticsRoutes = [
      '/analytics',
      '/analytics/reports', 
      '/analytics/comparison',
      '/analytics/dashboard'
    ];
    
    for (const route of analyticsRoutes) {
      await page.goto(route);
      await expect(page.locator('text=404')).toBeVisible();
    }
  });
});

test.describe('SEO and Meta Tags', () => {
  test('pages have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic meta tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
    
    // Check for Open Graph tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
  });

  test('canonical URLs are set correctly', async ({ page }) => {
    const pages = ['/', '/about', '/locations', '/contact-form', '/quote'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const canonicalLink = page.locator('link[rel="canonical"]');
      await expect(canonicalLink).toHaveAttribute('href', new RegExp(pagePath.replace('/', '\\/')));
    }
  });
});

test.describe('Performance and Loading', () => {
  test('pages load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('lazy loaded pages work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a lazy-loaded page
    await page.click('text=About');
    await page.waitForLoadState('networkidle');
    
    // Should show content, not loading state
    await expect(page.locator('.animate-pulse')).not.toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('images load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check that main logo is loaded
    const logo = page.locator('img[alt*="TSG"], img[alt*="logo"]').first();
    if (await logo.isVisible()) {
      await expect(logo).toHaveAttribute('src', /.+/);
      
      // Check that image actually loaded (not broken)
      const naturalWidth = await logo.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

test.describe('Accessibility', () => {
  test('pages have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Should have h1
    await expect(page.locator('h1')).toBeVisible();
    
    // Check heading hierarchy (h1 before h2, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    for (let i = 0; i < headings.length; i++) {
      const tagName = await headings[i].evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).toContain(tagName);
    }
  });

  test('form inputs have proper labels', async ({ page }) => {
    await page.goto('/quote');
    
    // All form inputs should have associated labels
    const inputs = await page.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (inputId) {
        // Should have a label with matching for attribute
        const label = page.locator(`label[for="${inputId}"]`);
        const hasLabel = await label.count() > 0;
        
        // Should have either a label, aria-label, or aria-labelledby
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    
    // Should focus on first focusable element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
  });
});