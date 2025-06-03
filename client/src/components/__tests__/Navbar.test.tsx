import { render, screen } from '@testing-library/react';

describe('Navbar', () => {
  beforeAll(() => {
    process.env.VITE_ANALYTICS_ENABLED = 'true';
  });

  afterAll(() => {
    delete process.env.VITE_ANALYTICS_ENABLED;
  });
  it('contains a link to the Analytics page', async () => {
    const { default: Navbar } = await import('../Navbar');
    render(<Navbar />);
    const analyticsLink = screen.getByRole('link', { name: /analytics/i });
    expect(analyticsLink).toHaveAttribute('href', '/analytics');
  });
});
