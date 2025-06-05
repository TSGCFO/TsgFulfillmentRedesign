import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UnifiedContactForm } from '../UnifiedContactForm';

// Mock the hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('UnifiedContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Form Rendering', () => {
    it('renders basic contact form fields', () => {
      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('renders service dropdown when includeService is true', () => {
      renderWithQueryClient(
        <UnifiedContactForm 
          endpoint="/api/quote" 
          includeService 
          serviceOptions={['Service 1', 'Service 2']}
        />
      );

      expect(screen.getByText(/select a service/i)).toBeInTheDocument();
    });

    it('renders consent checkbox when includeConsent is true', () => {
      renderWithQueryClient(
        <UnifiedContactForm 
          endpoint="/api/quote" 
          includeConsent
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders subject dropdown when includeSubject is true', () => {
      renderWithQueryClient(
        <UnifiedContactForm 
          endpoint="/api/contact" 
          includeSubject 
          subjectOptions={['Subject 1', 'Subject 2']}
        />
      );

      expect(screen.getByText(/select a subject/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
        expect(screen.getByText(/company name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates service selection when required', async () => {
      renderWithQueryClient(
        <UnifiedContactForm 
          endpoint="/api/quote" 
          includeService 
          serviceOptions={['Service 1']}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a service/i)).toBeInTheDocument();
      });
    });

    it('validates consent checkbox when required', async () => {
      renderWithQueryClient(
        <UnifiedContactForm 
          endpoint="/api/quote" 
          includeConsent
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/email address/i), { 
        target: { value: 'john@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), { 
        target: { value: '1234567890' } 
      });
      fireEvent.change(screen.getByLabelText(/company/i), { 
        target: { value: 'ACME Corp' } 
      });
      fireEvent.change(screen.getByLabelText(/message/i), { 
        target: { value: 'This is a test message' } 
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            company: 'ACME Corp',
            message: 'This is a test message',
          }),
        });
      });
    });

    it('shows success message after successful submission', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/email address/i), { 
        target: { value: 'john@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), { 
        target: { value: '1234567890' } 
      });
      fireEvent.change(screen.getByLabelText(/company/i), { 
        target: { value: 'ACME Corp' } 
      });
      fireEvent.change(screen.getByLabelText(/message/i), { 
        target: { value: 'This is a test message' } 
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/thank you! we will be in touch soon/i)).toBeInTheDocument();
      });
    });

    it('handles submission errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/email address/i), { 
        target: { value: 'john@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), { 
        target: { value: '1234567890' } 
      });
      fireEvent.change(screen.getByLabelText(/company/i), { 
        target: { value: 'ACME Corp' } 
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Form should still be visible (not showing success state)
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Default Values', () => {
    it('applies default values correctly', () => {
      renderWithQueryClient(
        <UnifiedContactForm 
          endpoint="/api/contact"
          includeService
          serviceOptions={['Service 1', 'Service 2']}
          defaultValues={{
            name: 'Default Name',
            email: 'default@example.com',
            service: 'Service 1'
          }}
        />
      );

      expect(screen.getByDisplayValue('Default Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('default@example.com')).toBeInTheDocument();
    });
  });

  describe('Form States', () => {
    it('disables submit button while submitting', async () => {
      const mockFetch = vi.mocked(fetch);
      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true }),
          } as Response), 100)
        )
      );

      renderWithQueryClient(
        <UnifiedContactForm endpoint="/api/contact" />
      );

      // Fill form
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/email address/i), { 
        target: { value: 'john@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), { 
        target: { value: '1234567890' } 
      });
      fireEvent.change(screen.getByLabelText(/company/i), { 
        target: { value: 'ACME Corp' } 
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });
});