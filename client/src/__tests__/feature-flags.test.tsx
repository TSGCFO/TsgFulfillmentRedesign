import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeatureWrapper } from '../components/FeatureWrapper';
import { useFeatureFlags, FeatureFlagProvider } from '../hooks/use-feature-flags';
import { FeatureFlag } from '../../../shared/feature-flags';

// Mock the feature flag utilities
vi.mock('../utils/feature-flags', () => ({
  getFeatureFlags: vi.fn(),
  isFeatureEnabled: vi.fn(),
  getFeatureFlagContext: vi.fn(),
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Feature Flags Frontend Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider>
        {children}
      </FeatureFlagProvider>
    </QueryClientProvider>
  );

  describe('FeatureWrapper Component', () => {
    it('should render children when feature is enabled', async () => {
      // Mock the API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            flag: FeatureFlag.NEW_DASHBOARD,
            enabled: true
          }
        })
      });

      render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Feature content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Feature content')).toBeInTheDocument();
      });
    });

    it('should not render children when feature is disabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            flag: FeatureFlag.NEW_DASHBOARD,
            enabled: false
          }
        })
      });

      render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Feature content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Feature content')).not.toBeInTheDocument();
      });
    });

    it('should render fallback component when feature is disabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            flag: FeatureFlag.NEW_DASHBOARD,
            enabled: false
          }
        })
      });

      render(
        <TestWrapper>
          <FeatureWrapper 
            feature={FeatureFlag.NEW_DASHBOARD}
            fallback={<div>Fallback content</div>}
          >
            <div>Feature content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback content')).toBeInTheDocument();
        expect(screen.queryByText('Feature content')).not.toBeInTheDocument();
      });
    });

    it('should show loading state while fetching', () => {
      // Mock a delayed response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: { flag: FeatureFlag.NEW_DASHBOARD, enabled: true }
            })
          }), 100)
        )
      );

      render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Feature content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByTestId('feature-loading')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Feature content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        // Should not render content on error (fail safely)
        expect(screen.queryByText('Feature content')).not.toBeInTheDocument();
      });
    });

    it('should handle invalid API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Feature content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Feature content')).not.toBeInTheDocument();
      });
    });
  });

  describe('useFeatureFlags Hook', () => {
    it('should return feature flag state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            flags: {
              [FeatureFlag.NEW_DASHBOARD]: true,
              [FeatureFlag.ENHANCED_SEARCH]: false
            }
          }
        })
      });

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          [FeatureFlag.NEW_DASHBOARD]: true,
          [FeatureFlag.ENHANCED_SEARCH]: false
        });
      });
    });

    it('should handle loading state', () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: { flags: {} }
            })
          }), 100)
        )
      );

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('should refetch data when called', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { flags: { [FeatureFlag.NEW_DASHBOARD]: false } }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { flags: { [FeatureFlag.NEW_DASHBOARD]: true } }
          })
        });

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result.current.data?.[FeatureFlag.NEW_DASHBOARD]).toBe(false);
      });

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data?.[FeatureFlag.NEW_DASHBOARD]).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Feature Flag Caching', () => {
    it('should cache API responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { flags: { [FeatureFlag.NEW_DASHBOARD]: true } }
        })
      });

      // Render first hook
      const { result: result1 } = renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result1.current.data).toBeDefined();
      });

      // Render second hook - should use cache
      const { result: result2 } = renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result2.current.data).toBeDefined();
      });

      // Should only fetch once due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should respect cache time', async () => {
      const shortCacheClient = new QueryClient({
        defaultOptions: {
          queries: { 
            retry: false,
            staleTime: 0, // No cache
            cacheTime: 0
          }
        }
      });

      const ShortCacheWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <QueryClientProvider client={shortCacheClient}>
          <FeatureFlagProvider>
            {children}
          </FeatureFlagProvider>
        </QueryClientProvider>
      );

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { flags: { [FeatureFlag.NEW_DASHBOARD]: true } }
        })
      });

      // First render
      renderHook(() => useFeatureFlags(), {
        wrapper: ShortCacheWrapper
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Second render should fetch again due to no cache
      renderHook(() => useFeatureFlags(), {
        wrapper: ShortCacheWrapper
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance', () => {
    it('should handle multiple simultaneous feature checks efficiently', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            flags: {
              [FeatureFlag.NEW_DASHBOARD]: true,
              [FeatureFlag.ENHANCED_SEARCH]: false,
              [FeatureFlag.PERFORMANCE_CACHING]: true
            }
          }
        })
      });

      // Render multiple components simultaneously
      render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Dashboard</div>
          </FeatureWrapper>
          <FeatureWrapper feature={FeatureFlag.ENHANCED_SEARCH}>
            <div>Search</div>
          </FeatureWrapper>
          <FeatureWrapper feature={FeatureFlag.PERFORMANCE_CACHING}>
            <div>Caching</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.queryByText('Search')).not.toBeInTheDocument();
        expect(screen.getByText('Caching')).toBeInTheDocument();
      });

      // Should only make one API call for all feature flags
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should debounce rapid feature flag checks', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { flags: { [FeatureFlag.NEW_DASHBOARD]: true } }
        })
      });

      const { rerender } = render(
        <TestWrapper>
          <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
            <div>Content</div>
          </FeatureWrapper>
        </TestWrapper>
      );

      // Rapid re-renders
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
              <div>Content {i}</div>
            </FeatureWrapper>
          </TestWrapper>
        );
      }

      await waitFor(() => {
        expect(screen.getByText('Content 4')).toBeInTheDocument();
      });

      // Should still only make one API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Context and Environment', () => {
    it('should include environment context in API calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { flags: {} }
        })
      });

      renderHook(() => useFeatureFlags(), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/feature-flags'),
          expect.objectContaining({
            method: 'GET'
          })
        );
      });
    });

    it('should handle batch feature flag requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            flags: {
              [FeatureFlag.NEW_DASHBOARD]: true,
              [FeatureFlag.ENHANCED_SEARCH]: false
            }
          }
        })
      });

      // This would be implemented if the hook supports batch requests
      const { result } = renderHook(() => useFeatureFlags([
        FeatureFlag.NEW_DASHBOARD,
        FeatureFlag.ENHANCED_SEARCH
      ]), {
        wrapper: TestWrapper
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({
          [FeatureFlag.NEW_DASHBOARD]: true,
          [FeatureFlag.ENHANCED_SEARCH]: false
        });
      });
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', () => {
      const ThrowingComponent = () => {
        throw new Error('Component error');
      };

      // This would need an error boundary wrapper in the actual implementation
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <TestWrapper>
            <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
              <ThrowingComponent />
            </FeatureWrapper>
          </TestWrapper>
        );
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });
});