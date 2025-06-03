import { render, screen } from '@testing-library/react';
import Home from '../Home';
import HelmetProvider from '@/components/SEO/HelmetProvider';

describe('Home page', () => {
  it('renders hero heading', () => {
    render(
      <HelmetProvider>
        <Home />
      </HelmetProvider>
    );
    expect(
      screen.getByRole('heading', {
        name: /E-Commerce Experience/i,
      })
    ).toBeInTheDocument();
  });
});
