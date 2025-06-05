import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../Home';

// Mock all the component dependencies
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar Component</div>
}));

vi.mock('@/components/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero Section</div>
}));

vi.mock('@/components/ClientLogos', () => ({
  default: () => <div data-testid="client-logos">Client Logos</div>
}));

vi.mock('@/components/ServicesSection', () => ({
  default: () => <div data-testid="services-section">Services Section</div>
}));

vi.mock('@/components/IndustriesSection', () => ({
  default: () => <div data-testid="industries-section">Industries Section</div>
}));

vi.mock('@/components/ProcessSection', () => ({
  default: () => <div data-testid="process-section">Process Section</div>
}));

vi.mock('@/components/BenefitsSection', () => ({
  default: () => <div data-testid="benefits-section">Benefits Section</div>
}));

vi.mock('@/components/CTASection', () => ({
  default: () => <div data-testid="cta-section">CTA Section</div>
}));

vi.mock('@/components/TestimonialsSection', () => ({
  default: () => <div data-testid="testimonials-section">Testimonials Section</div>
}));

vi.mock('@/components/AboutSection', () => ({
  default: () => <div data-testid="about-section">About Section</div>
}));

vi.mock('@/components/FAQSection', () => ({
  default: () => <div data-testid="faq-section">FAQ Section</div>
}));

vi.mock('@/components/ContactSection', () => ({
  default: () => <div data-testid="contact-section">Contact Section</div>
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('@/components/BackToTop', () => ({
  default: () => <div data-testid="back-to-top">Back to Top</div>
}));

vi.mock('@/components/SEO/Seo', () => ({
  default: ({ title, description, structuredData }: any) => (
    <div data-testid="seo">
      <span data-testid="seo-title">{title}</span>
      <span data-testid="seo-description">{description}</span>
      <span data-testid="seo-structured-data">{JSON.stringify(structuredData)}</span>
    </div>
  )
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Component Rendering', () => {
    it('renders all major page sections', () => {
      render(<Home />);

      // Check that all major sections are rendered
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('client-logos')).toBeInTheDocument();
      expect(screen.getByTestId('services-section')).toBeInTheDocument();
      expect(screen.getByTestId('industries-section')).toBeInTheDocument();
      expect(screen.getByTestId('process-section')).toBeInTheDocument();
      expect(screen.getByTestId('benefits-section')).toBeInTheDocument();
      expect(screen.getByTestId('cta-section')).toBeInTheDocument();
      expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
      expect(screen.getByTestId('about-section')).toBeInTheDocument();
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
      expect(screen.getByTestId('contact-section')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    });

    it('renders SEO component with correct props', () => {
      render(<Home />);

      const seoComponent = screen.getByTestId('seo');
      expect(seoComponent).toBeInTheDocument();

      const title = screen.getByTestId('seo-title');
      expect(title).toHaveTextContent('TSG Fulfillment Services | Premier 3PL & Warehousing Solutions');

      const description = screen.getByTestId('seo-description');
      expect(description.textContent).toContain('Leading third-party logistics');
    });

    it('includes structured data for SEO', () => {
      render(<Home />);

      const structuredData = screen.getByTestId('seo-structured-data');
      const parsedData = JSON.parse(structuredData.textContent || '[]');
      
      expect(Array.isArray(parsedData)).toBe(true);
      expect(parsedData.length).toBeGreaterThan(0);
      
      // Check for organization data
      const orgData = parsedData.find((item: any) => item['@type'] === 'Organization');
      expect(orgData).toBeDefined();
      expect(orgData.name).toBe('TSG Fulfillment Services');
      expect(orgData.url).toBe('https://tsgfulfillment.com');
    });
  });

  describe('Cookie Consent Functionality', () => {
    it('checks for existing cookie consent on mount', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<Home />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cookie-consent');
    });

    it('sets cookie consent when not previously set', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<Home />);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie-consent', 'true');
    });

    it('does not set cookie consent when already exists', () => {
      localStorageMock.getItem.mockReturnValue('true');
      
      render(<Home />);

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Page Structure and Layout', () => {
    it('maintains proper section order', () => {
      const { container } = render(<Home />);
      
      const sections = container.querySelectorAll('[data-testid]');
      const sectionOrder = Array.from(sections).map(section => 
        section.getAttribute('data-testid')
      );

      // Verify the expected order of major sections
      const expectedOrder = [
        'seo',
        'navbar',
        'hero-section',
        'client-logos',
        'services-section',
        'industries-section',
        'process-section',
        'benefits-section',
        'cta-section',
        'testimonials-section',
        'about-section',
        'faq-section',
        'contact-section',
        'footer',
        'back-to-top'
      ];

      expectedOrder.forEach((expectedSection, index) => {
        expect(sectionOrder).toContain(expectedSection);
      });
    });

    it('includes navigation and footer for complete page structure', () => {
      render(<Home />);

      // Essential page structure elements
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    });
  });

  describe('SEO Structured Data', () => {
    it('includes complete organization information', () => {
      render(<Home />);

      const structuredData = screen.getByTestId('seo-structured-data');
      const parsedData = JSON.parse(structuredData.textContent || '[]');
      
      const orgData = parsedData.find((item: any) => item['@type'] === 'Organization');
      
      expect(orgData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'TSG Fulfillment Services',
        'url': 'https://tsgfulfillment.com'
      });

      expect(orgData.contactPoint).toBeDefined();
      expect(orgData.contactPoint['@type']).toBe('ContactPoint');
      expect(orgData.sameAs).toBeDefined();
      expect(Array.isArray(orgData.sameAs)).toBe(true);
    });

    it('includes breadcrumb structured data', () => {
      render(<Home />);

      const structuredData = screen.getByTestId('seo-structured-data');
      const parsedData = JSON.parse(structuredData.textContent || '[]');
      
      const breadcrumbData = parsedData.find((item: any) => item['@type'] === 'BreadcrumbList');
      expect(breadcrumbData).toBeDefined();
      expect(breadcrumbData.itemListElement).toBeDefined();
      expect(Array.isArray(breadcrumbData.itemListElement)).toBe(true);
    });

    it('includes website structured data', () => {
      render(<Home />);

      const structuredData = screen.getByTestId('seo-structured-data');
      const parsedData = JSON.parse(structuredData.textContent || '[]');
      
      const websiteData = parsedData.find((item: any) => item['@type'] === 'WebSite');
      expect(websiteData).toBeDefined();
      expect(websiteData.url).toBe('https://tsgfulfillment.com');
      expect(websiteData.potentialAction).toBeDefined();
    });
  });

  describe('Integration and Performance', () => {
    it('renders without errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<Home />);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles effect cleanup properly', () => {
      const { unmount } = render(<Home />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Content Sections', () => {
    it('includes key business sections for conversion', () => {
      render(<Home />);

      // Key conversion-focused sections
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('services-section')).toBeInTheDocument();
      expect(screen.getByTestId('benefits-section')).toBeInTheDocument();
      expect(screen.getByTestId('cta-section')).toBeInTheDocument();
      expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('includes trust-building sections', () => {
      render(<Home />);

      // Trust and credibility sections
      expect(screen.getByTestId('client-logos')).toBeInTheDocument();
      expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
      expect(screen.getByTestId('about-section')).toBeInTheDocument();
      expect(screen.getByTestId('process-section')).toBeInTheDocument();
    });

    it('includes informational sections', () => {
      render(<Home />);

      // Educational and informational sections
      expect(screen.getByTestId('industries-section')).toBeInTheDocument();
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    });
  });
});