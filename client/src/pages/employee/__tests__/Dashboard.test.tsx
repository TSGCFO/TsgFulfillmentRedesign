import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployeeDashboard from '../Dashboard';
import { AuthProvider } from '@/hooks/use-employee-auth';

// Mock dependencies
vi.mock('@/hooks/use-employee-auth', () => ({
  useEmployeeAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('EmployeeDashboard', () => {
  let queryClient: QueryClient;
  let mockToken: string;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockToken = 'valid.jwt.token';

    vi.mocked(require('@/hooks/use-employee-auth')).useEmployeeAuth.mockReturnValue({
      token: mockToken
    });

    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockDashboardData = {
    data: {
      employee: {
        firstName: 'John',
        lastName: 'Doe',
        department: 'Sales',
        position: 'Sales Representative'
      },
      metrics: {
        assignedQuotes: 12,
        activeContracts: 8,
        pendingQuoteRequests: 5,
        lowStockItems: 3
      },
      recentActivity: [
        {
          description: 'Quote QUO-123 was created',
          timestamp: '2025-01-01T10:00:00Z'
        },
        {
          description: 'Contract CON-456 was signed',
          timestamp: '2025-01-01T09:30:00Z'
        }
      ]
    }
  };

  it('should render dashboard with welcome message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, John')).toBeInTheDocument();
    });
  });

  it('should display all metric cards with correct values', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Assigned Quotes')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Active quotes requiring attention')).toBeInTheDocument();

      expect(screen.getByText('Active Contracts')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Contracts in progress')).toBeInTheDocument();

      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('New quote requests to review')).toBeInTheDocument();

      expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Items requiring reorder')).toBeInTheDocument();
    });
  });

  it('should display recent activity section', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Quote QUO-123 was created')).toBeInTheDocument();
      expect(screen.getByText('Contract CON-456 was signed')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching data', () => {
    vi.mocked(fetch).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => mockDashboardData
        } as Response), 1000)
      )
    );

    renderWithProviders(<EmployeeDashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check for loading skeletons
    const skeletons = screen.getAllByTestId('loading-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should handle missing metrics data gracefully', async () => {
    const dataWithoutMetrics = {
      data: {
        employee: {
          firstName: 'John'
        },
        metrics: {},
        recentActivity: []
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithoutMetrics
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Should default to 0
    });
  });

  it('should handle empty recent activity', async () => {
    const dataWithEmptyActivity = {
      ...mockDashboardData,
      data: {
        ...mockDashboardData.data,
        recentActivity: []
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithEmptyActivity
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('should make API call with correct authorization header', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/employee/dashboard', {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<EmployeeDashboard />);

    // Should not crash the component
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should handle non-ok API responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    // Should not crash the component
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should refresh data every 30 seconds', async () => {
    vi.useFakeTimers();
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Fast forward 30 seconds
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });

  it('should display correct icons for each metric card', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      // Check for metric card icons (they should be rendered as SVG elements)
      const fileTextIcons = screen.getAllByTestId('file-text-icon');
      const usersIcon = screen.getByTestId('users-icon');
      const packageIcon = screen.getByTestId('package-icon');
      const alertTriangleIcon = screen.getByTestId('alert-triangle-icon');

      expect(fileTextIcons).toHaveLength(2); // Assigned Quotes and Pending Requests
      expect(usersIcon).toBeInTheDocument(); // Active Contracts
      expect(packageIcon).toBeInTheDocument(); // Low Stock Items
      expect(alertTriangleIcon).toBeInTheDocument(); // Low Stock Items
    });
  });

  it('should have proper card layout and styling', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-6');
    });
  });

  it('should handle null employee data', async () => {
    const dataWithNullEmployee = {
      data: {
        employee: null,
        metrics: mockDashboardData.data.metrics,
        recentActivity: []
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithNullEmployee
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      // Should not show welcome message with undefined name
      expect(screen.queryByText('Welcome back,')).not.toBeInTheDocument();
    });
  });

  it('should format large numbers correctly in metrics', async () => {
    const dataWithLargeNumbers = {
      data: {
        employee: { firstName: 'John' },
        metrics: {
          assignedQuotes: 1234,
          activeContracts: 567,
          pendingQuoteRequests: 89,
          lowStockItems: 0
        },
        recentActivity: []
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithLargeNumbers
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('should handle malformed API response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'response' })
    } as Response);

    renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      // Should show default values when data is malformed
      expect(screen.getAllByText('0')).toHaveLength(4);
    });
  });

  it('should stop auto-refresh when component unmounts', async () => {
    vi.useFakeTimers();
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockDashboardData
    } as Response);

    const { unmount } = renderWithProviders(<EmployeeDashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Fast forward 30 seconds after unmount
    vi.advanceTimersByTime(30000);

    // Should not make additional API calls after unmount
    expect(fetch).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});