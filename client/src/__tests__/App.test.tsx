import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '@/App';

// Mock all the lazy loaded components
vi.mock('@/pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('@/pages/OWDStyleHome', () => ({
  default: () => <div data-testid="owd-home-page">OWD Home Page</div>,
}));

vi.mock('@/pages/ServiceDetail', () => ({
  default: () => <div data-testid="service-detail-page">Service Detail Page</div>,
}));

vi.mock('@/pages/IndustryDetail', () => ({
  default: () => <div data-testid="industry-detail-page">Industry Detail Page</div>,
}));

vi.mock('@/pages/About', () => ({
  default: () => <div data-testid="about-page">About Page</div>,
}));

vi.mock('@/pages/Locations', () => ({
  default: () => <div data-testid="locations-page">Locations Page</div>,
}));

vi.mock('@/pages/Analytics', () => ({
  default: () => <div data-testid="analytics-page">Analytics Page</div>,
}));

vi.mock('@/pages/ReportGenerator', () => ({
  default: () => <div data-testid="report-generator-page">Report Generator Page</div>,
}));

vi.mock('@/pages/PerformanceComparison', () => ({
  default: () => <div data-testid="performance-comparison-page">Performance Comparison Page</div>,
}));

vi.mock('@/pages/CustomDashboard', () => ({
  default: () => <div data-testid="custom-dashboard-page">Custom Dashboard Page</div>,
}));

vi.mock('@/pages/image-management', () => ({
  default: () => <div data-testid="image-management-page">Image Management Page</div>,
}));

vi.mock('@/pages/QuoteButtonTest', () => ({
  default: () => <div data-testid="quote-button-test-page">Quote Button Test Page</div>,
}));

vi.mock('@/pages/ContactForm', () => ({
  default: () => <div data-testid="contact-form-page">Contact Form Page</div>,
}));

vi.mock('@/pages/QuoteRequest', () => ({
  default: () => <div data-testid="quote-request-page">Quote Request Page</div>,
}));

vi.mock('@/pages/not-found', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock other components
vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

vi.mock('@/components/CookieConsent', () => ({
  default: () => <div data-testid="cookie-consent">Cookie Consent</div>,
}));

vi.mock('@/components/SEO/HelmetProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="helmet-provider">{children}</div>
  ),
}));

// Mock redirects lib
vi.mock('@/lib/redirects', () => ({
  checkRedirect: vi.fn(() => null),
  setCanonicalUrl: vi.fn(),
}));

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_ANALYTICS_ENABLED: 'false',
  },
}));

// Polyfill ResizeObserver for jsdom environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver || MockResizeObserver;

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

const renderWithPath = (path: string) => {
  // Mock window.location
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      pathname: path,
      href: `http://localhost:3000${path}`,
    },
  });

  // Mock history API
  Object.defineProperty(window, 'history', {
    writable: true,
    value: {
      replaceState: vi.fn(),
      pushState: vi.fn(),
    },
  });

  return render(<App />);
};

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home page on root path', async () => {
    renderWithPath('/');
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders quote request page on /quote path', async () => {
    renderWithPath('/quote');
    
    await waitFor(() => {
      expect(screen.getByTestId('quote-request-page')).toBeInTheDocument();
    });
  });

  it('renders contact form page on /contact-form path', async () => {
    renderWithPath('/contact-form');
    
    await waitFor(() => {
      expect(screen.getByTestId('contact-form-page')).toBeInTheDocument();
    });
  });

  it('renders about page on /about path', async () => {
    renderWithPath('/about');
    
    await waitFor(() => {
      expect(screen.getByTestId('about-page')).toBeInTheDocument();
    });
  });

  it('renders locations page on /locations path', async () => {
    renderWithPath('/locations');
    
    await waitFor(() => {
      expect(screen.getByTestId('locations-page')).toBeInTheDocument();
    });
  });

  it('renders OWD home page on /old-home path', async () => {
    renderWithPath('/old-home');
    
    await waitFor(() => {
      expect(screen.getByTestId('owd-home-page')).toBeInTheDocument();
    });
  });

  it('renders service detail page with slug', async () => {
    renderWithPath('/services/warehousing');
    
    await waitFor(() => {
      expect(screen.getByTestId('service-detail-page')).toBeInTheDocument();
    });
  });

  it('renders industry detail page with slug', async () => {
    renderWithPath('/industries/healthcare');
    
    await waitFor(() => {
      expect(screen.getByTestId('industry-detail-page')).toBeInTheDocument();
    });
  });

  it('renders admin image management page', async () => {
    renderWithPath('/admin/images');
    
    await waitFor(() => {
      expect(screen.getByTestId('image-management-page')).toBeInTheDocument();
    });
  });

  it('renders quote button test page', async () => {
    renderWithPath('/test/quote-buttons');
    
    await waitFor(() => {
      expect(screen.getByTestId('quote-button-test-page')).toBeInTheDocument();
    });
  });

  it('renders 404 page for unknown routes', async () => {
    renderWithPath('/unknown-route');
    
    await waitFor(() => {
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  it('renders loading state initially', () => {
    renderWithPath('/');
    
    // Check for loading animation elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('includes all global components', async () => {
    renderWithPath('/');
    
    await waitFor(() => {
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
      expect(screen.getByTestId('cookie-consent')).toBeInTheDocument();
      expect(screen.getByTestId('helmet-provider')).toBeInTheDocument();
    });
  });

  describe('Analytics Routes (Disabled)', () => {
    it('does not render analytics routes when disabled', async () => {
      renderWithPath('/analytics');
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });

    it('does not render report generator when analytics disabled', async () => {
      renderWithPath('/analytics/reports');
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  describe('Page Loading Animation', () => {
    it('applies fadeIn animation CSS correctly', () => {
      renderWithPath('/');
      
      // Check if the animation styles were added to document head
      const styles = Array.from(document.head.getElementsByTagName('style'));
      const animationStyle = styles.find(style => 
        style.textContent?.includes('@keyframes fadeIn')
      );
      
      expect(animationStyle).toBeTruthy();
      expect(animationStyle?.textContent).toContain('fadeIn 0.5s ease-out forwards');
    });
  });

  describe('Scroll Behavior', () => {
    it('scrolls to top on route change', async () => {
      renderWithPath('/about');
      
      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      });
    });
  });
});