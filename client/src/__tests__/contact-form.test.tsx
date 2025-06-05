import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import QuoteRequest from '@/pages/QuoteRequest';

// Polyfill ResizeObserver for jsdom environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver || MockResizeObserver;

const renderForm = () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <QuoteRequest />
      </Router>
    </QueryClientProvider>
  );
};

describe('Unified Quote Request Form', () => {
  it('renders all expected inputs', () => {
    renderForm();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Needed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/privacy policy/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit quote request/i })
    ).toBeInTheDocument();
  });
});
