import { render, screen } from '@testing-library/react';
import Home from '../Home';

describe('Home page', () => {
  it('renders hero heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', {
        name: /E-Commerce Experience/i,
      })
    ).toBeInTheDocument();
  });
});
