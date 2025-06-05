import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { UnifiedContactForm } from '@/components/UnifiedContactForm';

// Mock fetch for form submissions
global.fetch = vi.fn();

// Polyfill ResizeObserver for jsdom environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver =
  (globalThis as any).ResizeObserver || MockResizeObserver;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('UnifiedContactForm', () => {
  const defaultProps = {
    endpoint: '/api/contact',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  it('renders basic form fields', () => {
    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('renders service field when includeService is true', () => {
    render(
      <UnifiedContactForm
        {...defaultProps}
        includeService
        serviceOptions={['Warehousing', 'Transportation']}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/service needed/i)).toBeInTheDocument();
  });

  it('renders privacy consent when includeConsent is true', () => {
    render(<UnifiedContactForm {...defaultProps} includeConsent />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByLabelText(/privacy policy/i)).toBeInTheDocument();
  });

  it('applies default values correctly', () => {
    const defaultValues = {
      name: 'John Doe',
      email: 'john@example.com',
      service: 'Warehousing',
    };

    render(
      <UnifiedContactForm
        {...defaultProps}
        includeService
        serviceOptions={['Warehousing', 'Transportation']}
        defaultValues={defaultValues}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
      expect(screen.getByText(/company is required/i)).toBeInTheDocument();
      expect(screen.getByText(/project details are required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '123'); // Too short

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/phone number must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('validates privacy consent when required', async () => {
    const user = userEvent.setup();
    render(<UnifiedContactForm {...defaultProps} includeConsent />, {
      wrapper: createWrapper(),
    });

    // Fill in all other required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/you must agree to the privacy policy/i)).toBeInTheDocument();
    });
  });

  it('validates service selection when required', async () => {
    const user = userEvent.setup();
    render(
      <UnifiedContactForm
        {...defaultProps}
        includeService
        serviceOptions={['Warehousing', 'Transportation']}
      />,
      { wrapper: createWrapper() }
    );

    // Fill in all other required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/service selection is required/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project description');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          company: 'ACME Corp',
          message: 'Test project description',
        }),
      });
    });
  });

  it('submits form with service and consent data', async () => {
    const user = userEvent.setup();
    render(
      <UnifiedContactForm
        {...defaultProps}
        includeService
        includeConsent
        serviceOptions={['Warehousing', 'Transportation']}
      />,
      { wrapper: createWrapper() }
    );

    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project description');

    // Select service
    const serviceSelect = screen.getByLabelText(/service needed/i);
    await user.click(serviceSelect);
    await user.click(screen.getByText('Warehousing'));

    // Check privacy consent
    const consentCheckbox = screen.getByLabelText(/privacy policy/i);
    await user.click(consentCheckbox);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          company: 'ACME Corp',
          message: 'Test project description',
          service: 'Warehousing',
          privacyConsent: true,
        }),
      });
    });
  });

  it('handles form submission errors', async () => {
    const user = userEvent.setup();
    (fetch as any).mockRejectedValue(new Error('Network error'));

    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project description');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to submit/i)).toBeInTheDocument();
    });
  });

  it('handles server error responses', async () => {
    const user = userEvent.setup();
    (fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project description');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (fetch as any).mockReturnValue(promise);

    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project description');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });

    await waitFor(() => {
      expect(screen.getByText(/submit/i)).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<UnifiedContactForm {...defaultProps} />, { wrapper: createWrapper() });

    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/company name/i), 'ACME Corp');
    await user.type(screen.getByLabelText(/project details/i), 'Test project description');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Form should be reset
    });
  });

  it('has proper accessibility attributes', () => {
    render(<UnifiedContactForm {...defaultProps} includeConsent />, {
      wrapper: createWrapper(),
    });

    // Check for proper form structure
    expect(screen.getByRole('form')).toBeInTheDocument();

    // Check for proper input labels
    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toHaveAttribute('required');

    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute('type', 'email');

    const phoneInput = screen.getByLabelText(/phone number/i);
    expect(phoneInput).toHaveAttribute('type', 'tel');

    // Check submit button
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
});