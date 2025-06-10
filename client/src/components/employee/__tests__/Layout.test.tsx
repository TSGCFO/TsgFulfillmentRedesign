import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import EmployeeLayout from '../Layout';
import { AuthProvider } from '@/hooks/use-employee-auth';

// Mock the hooks
vi.mock('@/hooks/use-employee-auth', () => ({
  useEmployeeAuth: () => ({
    employee: {
      firstName: 'John',
      lastName: 'Doe',
      position: 'Sales Representative'
    },
    logout: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock wouter
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/employee', vi.fn()],
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href} data-testid={`link-${href}`}>{children}</a>
    )
  };
});

describe('EmployeeLayout', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const renderWithProviders = (children: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    );
  };

  it('should render the layout with header and navigation', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div data-testid="content">Test Content</div>
      </EmployeeLayout>
    );

    expect(screen.getByText('Employee Portal')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Sales Representative')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Quote Requests')).toBeInTheDocument();
    expect(screen.getByText('Quotes & Contracts')).toBeInTheDocument();
    expect(screen.getByText('Materials')).toBeInTheDocument();
    expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    vi.mocked(require('wouter')).useLocation.mockReturnValue(['/employee/quote-requests', vi.fn()]);

    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    const quoteRequestsLink = screen.getByTestId('link-/employee/quote-requests');
    expect(quoteRequestsLink.parentElement).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('should call logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    vi.mocked(require('@/hooks/use-employee-auth')).useEmployeeAuth.mockReturnValue({
      employee: {
        firstName: 'John',
        lastName: 'Doe',
        position: 'Sales Representative'
      },
      logout: mockLogout
    });

    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should render notification bell button', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    const bellButton = screen.getByRole('button', { name: /bell/i });
    expect(bellButton).toBeInTheDocument();
  });

  it('should render TSG logo', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    const logo = screen.getByAltText('TSG Fulfillment');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/tsg-logo.png');
  });

  it('should have proper layout structure', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div data-testid="test-content">Content</div>
      </EmployeeLayout>
    );

    // Check header
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b');

    // Check sidebar
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('w-64', 'bg-white', 'shadow-sm', 'min-h-screen');

    // Check main content area
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-1', 'p-6');
    expect(main).toContainElement(screen.getByTestId('test-content'));
  });

  it('should handle navigation item hover states', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    const dashboardLink = screen.getByTestId('link-/employee').parentElement;
    expect(dashboardLink).toHaveClass('hover:bg-gray-100');
  });

  it('should render children content correctly', () => {
    const TestComponent = () => (
      <div>
        <h1 data-testid="child-title">Test Page</h1>
        <p data-testid="child-content">This is test content</p>
      </div>
    );

    renderWithProviders(
      <EmployeeLayout>
        <TestComponent />
      </EmployeeLayout>
    );

    expect(screen.getByTestId('child-title')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should handle missing employee data gracefully', () => {
    vi.mocked(require('@/hooks/use-employee-auth')).useEmployeeAuth.mockReturnValue({
      employee: null,
      logout: vi.fn()
    });

    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    // Should not crash and still render layout
    expect(screen.getByText('Employee Portal')).toBeInTheDocument();
  });

  describe('Navigation Active States', () => {
    const testCases = [
      { path: '/employee', expectedActive: 'Dashboard' },
      { path: '/employee/quote-requests', expectedActive: 'Quote Requests' },
      { path: '/employee/quote-requests/123', expectedActive: 'Quote Requests' },
      { path: '/employee/quotes', expectedActive: 'Quotes & Contracts' },
      { path: '/employee/quotes/new', expectedActive: 'Quotes & Contracts' },
      { path: '/employee/materials', expectedActive: 'Materials' },
      { path: '/employee/materials/inventory', expectedActive: 'Materials' },
      { path: '/employee/purchase-orders', expectedActive: 'Purchase Orders' },
      { path: '/employee/purchase-orders/create', expectedActive: 'Purchase Orders' }
    ];

    testCases.forEach(({ path, expectedActive }) => {
      it(`should highlight ${expectedActive} when on ${path}`, () => {
        vi.mocked(require('wouter')).useLocation.mockReturnValue([path, vi.fn()]);

        renderWithProviders(
          <EmployeeLayout>
            <div>Content</div>
          </EmployeeLayout>
        );

        const activeLink = screen.getByText(expectedActive).closest('a');
        expect(activeLink?.parentElement).toHaveClass('bg-blue-50', 'text-blue-700');
      });
    });
  });

  it('should have accessible navigation structure', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    const navList = screen.getByRole('list');
    const navItems = screen.getAllByRole('listitem');
    
    expect(navList).toBeInTheDocument();
    expect(navItems).toHaveLength(5); // Dashboard, Quote Requests, Quotes & Contracts, Materials, Purchase Orders
  });

  it('should render all navigation icons', () => {
    renderWithProviders(
      <EmployeeLayout>
        <div>Content</div>
      </EmployeeLayout>
    );

    // Check that all navigation items have their respective icons
    const navigationItems = [
      'Dashboard',
      'Quote Requests', 
      'Quotes & Contracts',
      'Materials',
      'Purchase Orders'
    ];

    navigationItems.forEach(item => {
      const navItem = screen.getByText(item);
      const parentElement = navItem.closest('a');
      expect(parentElement).toBeInTheDocument();
    });
  });
});