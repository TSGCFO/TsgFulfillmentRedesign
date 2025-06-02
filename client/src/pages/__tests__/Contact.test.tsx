import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../Contact';

describe('Contact page', () => {
  it('submits the contact form', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<Contact />);

    await user.type(screen.getByLabelText(/your name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Quote');
    await user.type(screen.getByLabelText(/your message/i), 'Hello');
    await user.selectOptions(screen.getByLabelText(/service interest/i), ['warehousing']);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
