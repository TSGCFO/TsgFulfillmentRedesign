/**
 * Quote Button Testing Utility
 * 
 * This utility tests all quote-related buttons and links across the website
 * to ensure they properly redirect to the quote form section
 */

export interface QuoteButton {
  selector: string;
  description: string;
  expectedAction: 'scroll' | 'navigate';
  target: string;
  page?: string;
}

export const QUOTE_BUTTONS: QuoteButton[] = [
  // Navbar buttons
  {
    selector: '[data-testid="navbar-quote-button"], .navbar button:contains("Get a Quote")',
    description: 'Main navigation "Get a Quote" button',
    expectedAction: 'scroll',
    target: 'contact'
  },
  {
    selector: '[data-testid="mobile-quote-button"], .mobile-menu button:contains("Get a Quote")',
    description: 'Mobile navigation "Get a Quote" button',
    expectedAction: 'scroll',
    target: 'contact'
  },

  // Hero section buttons
  {
    selector: '[data-testid="hero-quote-button"], .hero button:contains("Request a Quote")',
    description: 'Hero section "Request a Quote" button',
    expectedAction: 'scroll',
    target: 'contact'
  },

  // CTA section buttons
  {
    selector: '[data-testid="cta-quote-button"], .cta button:contains("Get a Free Quote")',
    description: 'CTA section "Get a Free Quote" button',
    expectedAction: 'scroll',
    target: 'contact'
  },

  // Service detail page buttons
  {
    selector: '[data-testid="service-quote-button"], .service-detail button:contains("Request a Quote")',
    description: 'Service detail page "Request a Quote" button',
    expectedAction: 'scroll',
    target: 'contact',
    page: '/services/*'
  },

  // Contact section buttons
  {
    selector: '[data-testid="contact-quote-form"]',
    description: 'Contact section quote form',
    expectedAction: 'scroll',
    target: 'contact'
  },

  // OWD Style Home page buttons
  {
    selector: '.owd-home button:contains("Request a Quote")',
    description: 'OWD Home page "Request a Quote" button',
    expectedAction: 'scroll',
    target: 'contact',
    page: '/owd-home'
  },

  // New Home page buttons
  {
    selector: '.new-home button:contains("Request a Quote")',
    description: 'New Home page "Request a Quote" button',
    expectedAction: 'scroll',
    target: 'contact',
    page: '/new-home'
  },

  // Contact page buttons
  {
    selector: '.contact-page button:contains("Get a Quote")',
    description: 'Contact page quote buttons',
    expectedAction: 'scroll',
    target: 'contact',
    page: '/contact'
  },

  // Location page buttons
  {
    selector: '.locations-page button:contains("Request a Quote")',
    description: 'Locations page quote buttons',
    expectedAction: 'scroll',
    target: 'contact',
    page: '/locations'
  }
];

export interface TestResult {
  button: QuoteButton;
  found: boolean;
  clickable: boolean;
  functionsCorrectly: boolean;
  error?: string;
}

export class QuoteButtonTester {
  private results: TestResult[] = [];

  async testAllButtons(): Promise<TestResult[]> {
    this.results = [];
    
    for (const button of QUOTE_BUTTONS) {
      const result = await this.testButton(button);
      this.results.push(result);
    }

    return this.results;
  }

  private async testButton(button: QuoteButton): Promise<TestResult> {
    const result: TestResult = {
      button,
      found: false,
      clickable: false,
      functionsCorrectly: false
    };

    try {
      // Find the button element
      const element = this.findElement(button.selector);
      
      if (!element) {
        result.error = 'Button element not found';
        return result;
      }

      result.found = true;

      // Check if button is clickable
      if (element.disabled || element.style.pointerEvents === 'none') {
        result.error = 'Button is disabled or not clickable';
        return result;
      }

      result.clickable = true;

      // Test button functionality
      const functionTest = await this.testButtonFunction(element, button);
      result.functionsCorrectly = functionTest.success;
      
      if (!functionTest.success) {
        result.error = functionTest.error;
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private findElement(selector: string): HTMLElement | null {
    // Handle multiple selector types
    const selectors = selector.split(', ');
    
    for (const sel of selectors) {
      if (sel.includes(':contains(')) {
        // Handle :contains() pseudo-selector
        const match = sel.match(/(.+):contains\("(.+)"\)/);
        if (match) {
          const [, baseSelector, text] = match;
          const elements = document.querySelectorAll(baseSelector);
          
          for (const el of elements) {
            if (el.textContent?.includes(text)) {
              return el as HTMLElement;
            }
          }
        }
      } else {
        const element = document.querySelector(sel);
        if (element) {
          return element as HTMLElement;
        }
      }
    }

    return null;
  }

  private async testButtonFunction(element: HTMLElement, button: QuoteButton): Promise<{success: boolean, error?: string}> {
    return new Promise((resolve) => {
      try {
        // Store original scroll position
        const originalScrollY = window.scrollY;
        
        // Add a temporary event listener to detect scroll changes
        let scrollDetected = false;
        let targetFound = false;
        
        const scrollHandler = () => {
          scrollDetected = true;
        };

        window.addEventListener('scroll', scrollHandler);

        // Check if target element exists
        if (button.expectedAction === 'scroll') {
          const targetElement = document.getElementById(button.target);
          if (targetElement) {
            targetFound = true;
          }
        }

        // Simulate click
        element.click();

        // Wait a bit for any async operations
        setTimeout(() => {
          window.removeEventListener('scroll', scrollHandler);

          if (button.expectedAction === 'scroll') {
            if (!targetFound) {
              resolve({ success: false, error: `Target element #${button.target} not found` });
              return;
            }

            if (scrollDetected || window.scrollY !== originalScrollY) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: 'No scroll action detected after click' });
            }
          } else {
            // For navigation, check if URL changed or page navigated
            resolve({ success: true }); // Simplified for now
          }
        }, 1000);

      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Click test failed' });
      }
    });
  }

  generateReport(): string {
    const totalButtons = this.results.length;
    const foundButtons = this.results.filter(r => r.found).length;
    const workingButtons = this.results.filter(r => r.functionsCorrectly).length;
    const brokenButtons = this.results.filter(r => r.found && !r.functionsCorrectly);

    let report = `
QUOTE BUTTON TEST REPORT
========================

Summary:
- Total buttons tested: ${totalButtons}
- Buttons found: ${foundButtons}
- Working correctly: ${workingButtons}
- Broken buttons: ${brokenButtons.length}

`;

    if (brokenButtons.length > 0) {
      report += `\nBROKEN BUTTONS:\n`;
      brokenButtons.forEach((result, index) => {
        report += `${index + 1}. ${result.button.description}\n`;
        report += `   Selector: ${result.button.selector}\n`;
        report += `   Error: ${result.error}\n\n`;
      });
    }

    report += `\nDETAILED RESULTS:\n`;
    this.results.forEach((result, index) => {
      const status = result.functionsCorrectly ? '✅ WORKING' : result.found ? '❌ BROKEN' : '⚠️  NOT FOUND';
      report += `${index + 1}. ${status} - ${result.button.description}\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
    });

    return report;
  }
}

// Helper function to run the test from browser console
export function runQuoteButtonTest(): Promise<string> {
  const tester = new QuoteButtonTester();
  return tester.testAllButtons().then(() => tester.generateReport());
}

// Auto-run test when this module is loaded in browser
if (typeof window !== 'undefined') {
  (window as any).runQuoteButtonTest = runQuoteButtonTest;
  console.log('Quote button test utility loaded. Run runQuoteButtonTest() to test all buttons.');
}