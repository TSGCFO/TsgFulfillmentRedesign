import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn().mockResolvedValue({}),
}));

import { QuoteForm } from '../ui/quote-form';
import { apiRequest } from '@/lib/queryClient';

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('QuoteForm', () => {
  it('shows validation messages for invalid input', async () => {
    render(<QuoteForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid business email address')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid mobile number')).toBeInTheDocument();
    expect(screen.getByText('Company name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Please select current monthly shipments')).toBeInTheDocument();
    expect(screen.getByText('Please select expected monthly shipments')).toBeInTheDocument();
    expect(screen.getByText('Please select fulfillment services')).toBeInTheDocument();
  });

  it('calls apiRequest on valid submit', async () => {
    render(<QuoteForm />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/^Name \*$/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/^Business Email \*$/i), 'john@example.com');
    await user.type(screen.getByPlaceholderText(/^Mobile Number \*$/i), '1234567890');
    await user.type(screen.getByPlaceholderText(/^Company Name \*$/i), 'ACME');

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], '250-500');
    await user.selectOptions(selects[1], '2000-10000');
    await user.selectOptions(selects[2], 'warehousing');

    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('POST', '/api/quote', {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      company: 'ACME',
      currentShipments: '250-500',
      expectedShipments: '2000-10000',
      services: 'warehousing',
      message: '',
    }));
  });
});
