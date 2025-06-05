import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import QuoteRequest from '@/pages/QuoteRequest';
import { vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}));

// Mock the UnifiedContactForm component
vi.mock('@/components/UnifiedContactForm', () => ({
  UnifiedContactForm: ({ endpoint, includeService, includeConsent, serviceOptions, defaultValues }: any) => (
    <div data-testid="unified-contact-form">
      <div>Endpoint: {endpoint}</div>
      <div>Include Service: {includeService?.toString()}</div>
      <div>Include Consent: {includeConsent?.toString()}</div>
      <div>Services: {serviceOptions?.join(', ')}</div>
      <div>Default Service: {defaultValues?.service}</div>
      <form>
        <input name="name" placeholder="Full Name" />
        <input name="email" placeholder="Email" />
        <button type="submit">Submit Quote Request</button>
      </form>
    </div>
  ),
}));

// Mock Navbar and Footer
vi.mock('@/components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Polyfill ResizeObserver for jsdom environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver || MockResizeObserver;

const renderQuoteRequest = (search = '') => {
  // Mock window.location.search
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      search,
      href: 'http://localhost:3000/quote' + search,
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <QuoteRequest />
      </Router>
    </QueryClientProvider>
  );
};

describe('QuoteRequest Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        back: vi.fn(),
      },
    });
  });

  it('renders the quote request page correctly', () => {
    renderQuoteRequest();

    expect(screen.getByText('Request a Quote')).toBeInTheDocument();
    expect(screen.getByText(/Get a customized quote for your fulfillment needs/)).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the unified contact form with correct props', () => {
    renderQuoteRequest();

    const form = screen.getByTestId('unified-contact-form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent('Endpoint: /api/quote-requests');
    expect(form).toHaveTextContent('Include Service: true');
    expect(form).toHaveTextContent('Include Consent: true');
    expect(form).toHaveTextContent('Services: Fulfillment Services, Warehousing, Transportation, Supply Chain Consulting, E-commerce Solutions, Inventory Management, Reverse Logistics, Value-Added Services, Custom Solutions');
  });

  it('handles preselected service from URL params', () => {
    renderQuoteRequest('?service=Warehousing');

    const form = screen.getByTestId('unified-contact-form');
    expect(form).toHaveTextContent('Default Service: Warehousing');
  });

  it('handles empty service param gracefully', () => {
    renderQuoteRequest('?service=');

    const form = screen.getByTestId('unified-contact-form');
    expect(form).toHaveTextContent('Default Service:');
  });

  it('renders the "What Happens Next?" section', () => {
    renderQuoteRequest();

    expect(screen.getByText('What Happens Next?')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Customize')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();

    expect(screen.getByText(/Our team analyzes your requirements/)).toBeInTheDocument();
    expect(screen.getByText(/We create a tailored solution/)).toBeInTheDocument();
    expect(screen.getByText(/We schedule a call to present/)).toBeInTheDocument();
  });

  it('handles back button click', () => {
    renderQuoteRequest();

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(window.history.back).toHaveBeenCalled();
  });

  it('renders service options correctly', () => {
    renderQuoteRequest();

    const expectedServices = [
      'Fulfillment Services',
      'Warehousing', 
      'Transportation',
      'Supply Chain Consulting',
      'E-commerce Solutions',
      'Inventory Management',
      'Reverse Logistics',
      'Value-Added Services',
      'Custom Solutions'
    ];

    const form = screen.getByTestId('unified-contact-form');
    expectedServices.forEach(service => {
      expect(form).toHaveTextContent(service);
    });
  });

  it('renders process steps with correct numbers', () => {
    renderQuoteRequest();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    renderQuoteRequest();

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Request a Quote');

    const sectionHeading = screen.getByRole('heading', { level: 2 });
    expect(sectionHeading).toHaveTextContent('What Happens Next?');

    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    renderQuoteRequest();

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen', 'bg-gray-50', 'pt-20');
  });
});