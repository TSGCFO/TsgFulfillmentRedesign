import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Layout from '../Layout';

// Mock the Logo component since it uses image imports
vi.mock('@assets/Original on Transparent.png', () => ({
  default: 'mocked-logo.png'
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header and Navigation', () => {
    it('renders the main logo', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const logos = screen.getAllByAltText('TSG Fulfillment');
      expect(logos.length).toBeGreaterThan(0);
    });

    it('renders desktop navigation links', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByRole('button', { name: /services/i })).toBeInTheDocument();
      expect(screen.getByText('Industries')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Why TSG')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get a quote/i })).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger is clicked', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenuButton).toBeInTheDocument();

      // Mobile menu should be hidden initially
      const mobileNav = screen.getByRole('navigation', { hidden: true });
      expect(mobileNav).toHaveClass('hidden');

      // Click to open mobile menu
      fireEvent.click(mobileMenuButton);
      
      // Mobile menu should now be visible
      expect(mobileNav).toHaveClass('block');
    });

    it('shows services dropdown items', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Services dropdown should contain service links
      expect(screen.getByText('Warehousing')).toBeInTheDocument();
      expect(screen.getByText('Order Fulfillment')).toBeInTheDocument();
      expect(screen.getByText('Kitting & Assembly')).toBeInTheDocument();
      expect(screen.getByText('Reverse Logistics')).toBeInTheDocument();
    });
  });

  describe('Top Bar Contact Information', () => {
    it('renders contact information in top bar', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('(800) 555-1234')).toBeInTheDocument();
      expect(screen.getByText('info@tsgfulfillment.com')).toBeInTheDocument();
      expect(screen.getByText(/123 Logistics Way/)).toBeInTheDocument();
    });

    it('renders contact links with correct href attributes', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const phoneLink = screen.getByRole('link', { name: /\(800\) 555-1234/ });
      expect(phoneLink).toHaveAttribute('href', 'tel:+18005551234');

      const emailLink = screen.getByRole('link', { name: /info@tsgfulfillment\.com/ });
      expect(emailLink).toHaveAttribute('href', 'mailto:info@tsgfulfillment.com');
    });

    it('renders client login and contact us links', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const clientLoginLink = screen.getByRole('link', { name: /client login/i });
      expect(clientLoginLink).toHaveAttribute('href', '/login');

      const contactLinks = screen.getAllByRole('link', { name: /contact us/i });
      expect(contactLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Main Content Area', () => {
    it('renders children content', () => {
      render(
        <Layout>
          <div data-testid="test-content">Test Content Here</div>
        </Layout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content Here')).toBeInTheDocument();
    });

    it('wraps content in main element with correct classes', () => {
      const { container } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('flex-grow');
    });
  });

  describe('Footer Section', () => {
    it('renders footer with company description', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText(/TSG Fulfillment is your trusted partner/)).toBeInTheDocument();
    });

    it('renders footer navigation sections', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });

    it('renders service links in footer', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Check footer service links
      const footerServices = [
        'Warehousing',
        'Order Fulfillment', 
        'Kitting & Assembly',
        'Reverse Logistics',
        'Inventory Management',
        'Shipping & Distribution'
      ];

      footerServices.forEach(service => {
        expect(screen.getByText(service)).toBeInTheDocument();
      });
    });

    it('renders quick links in footer', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const quickLinks = [
        'About Us',
        'Why Choose TSG',
        'Industries We Serve',
        'Technology',
        'Locations'
      ];

      quickLinks.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('renders footer contact information', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Contact information should appear in footer as well
      expect(screen.getByText(/123 Logistics Way/)).toBeInTheDocument();
      expect(screen.getByText('(800) 555-1234')).toBeInTheDocument();
      expect(screen.getByText('info@tsgfulfillment.com')).toBeInTheDocument();
    });

    it('renders copyright with current year', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`${currentYear} TSG Fulfillment`))).toBeInTheDocument();
    });

    it('renders footer legal links', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Sitemap')).toBeInTheDocument();
    });

    it('renders social media links', () => {
      const { container } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Check for social media SVG icons (should be 5 social links)
      const socialLinks = container.querySelectorAll('footer svg');
      expect(socialLinks.length).toBeGreaterThanOrEqual(5);
    });

    it('renders request quote button in footer', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByRole('button', { name: /request a quote/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('hides top bar on mobile using CSS classes', () => {
      const { container } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const topBar = container.querySelector('.bg-\\[\\#0056B3\\]');
      expect(topBar).toHaveClass('hidden', 'md:block');
    });

    it('shows mobile-only elements', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    it('renders mobile navigation with correct structure', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Mobile menu should contain all the same links as desktop
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(mobileMenuButton);

      // Check mobile-specific elements
      expect(screen.getByText('Get a Quote')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper button roles and labels', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('provides proper link accessibility', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // All links should have accessible names or text content
      links.forEach(link => {
        const hasAccessibleName = link.hasAttribute('aria-label') || 
                                 link.textContent?.trim() || 
                                 link.querySelector('img')?.getAttribute('alt');
        expect(hasAccessibleName).toBeTruthy();
      });
    });
  });
});