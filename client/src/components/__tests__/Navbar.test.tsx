import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

describe.each([
  ['true', true],
  ['false', false],
])('Navbar when VITE_ANALYTICS_ENABLED=%s', (flag, shouldShowLink) => {
  beforeAll(() => {
    process.env.VITE_ANALYTICS_ENABLED = flag;
    (import.meta as any).env = {
      ...(import.meta as any).env,
      VITE_ANALYTICS_ENABLED: flag,
    };
  });

  afterAll(() => {
    delete process.env.VITE_ANALYTICS_ENABLED;
    delete (import.meta as any).env.VITE_ANALYTICS_ENABLED;
  });

  it(`${shouldShowLink ? 'contains' : 'does not contain'} a link to the Analytics page`, async () => {
    vi.resetModules();
    const { default: Navbar } = await import('../Navbar');
    render(<Navbar />);
    const analyticsLink = screen.queryByRole('link', { name: /analytics/i });
    if (shouldShowLink) {
      expect(analyticsLink).toHaveAttribute('href', '/analytics');
    } else {
      expect(analyticsLink).toBeNull();
    }
  });
});
