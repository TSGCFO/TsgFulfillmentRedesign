import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useEmployeeAuth, AuthProvider } from '../use-employee-auth';

// Mock fetch globally
global.fetch = vi.fn();

describe('useEmployeeAuth Hook', () => {
  let queryClient: QueryClient;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        })
      }
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  describe('Initial State', () => {
    it('should initialize with null user and employee when no token exists', () => {
      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      expect(result.current.user).toBeNull();
      expect(result.current.employee).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should initialize with token from localStorage', () => {
      mockLocalStorage['employee_token'] = 'stored.jwt.token';

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      expect(result.current.token).toBe('stored.jwt.token');
    });

    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useEmployeeAuth());
      }).toThrow('useEmployeeAuth must be used within AuthProvider');
    });
  });

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      const mockLoginResponse = {
        token: 'new.jwt.token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'sales_rep'
        },
        employee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          department: 'Sales',
          position: 'Sales Representative',
          permissions: {}
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(fetch).toHaveBeenCalledWith('/api/employee/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' })
      });

      expect(result.current.user).toEqual(mockLoginResponse.user);
      expect(result.current.employee).toEqual(mockLoginResponse.employee);
      expect(result.current.token).toBe('new.jwt.token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('employee_token', 'new.jwt.token');
    });

    it('should handle login failure with invalid credentials', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' })
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('wronguser', 'wrongpass');
        });
      }).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.employee).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors during login', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('testuser', 'password123');
        });
      }).rejects.toThrow('Network error');
    });

    it('should handle login response without error message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('testuser', 'password123');
        });
      }).rejects.toThrow('Login failed');
    });

    it('should set loading state during login', async () => {
      vi.mocked(fetch).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              token: 'token',
              user: { id: 1, username: 'test', role: 'user' },
              employee: { id: 1, firstName: 'Test', lastName: 'User' }
            })
          } as Response), 100)
        )
      );

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      act(() => {
        result.current.login('testuser', 'password123');
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Profile Fetching', () => {
    it('should fetch profile when token exists', async () => {
      const mockProfile = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        department: 'Sales',
        position: 'Sales Representative'
      };

      mockLocalStorage['employee_token'] = 'valid.token';

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProfile })
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await waitFor(() => {
        expect(result.current.employee).toEqual(mockProfile);
      });

      expect(fetch).toHaveBeenCalledWith('/api/employee/profile', {
        headers: { Authorization: 'Bearer valid.token' }
      });
    });

    it('should not fetch profile when no token exists', () => {
      renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle profile fetch errors', async () => {
      mockLocalStorage['employee_token'] = 'invalid.token';

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Unauthorized'));

      renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      // Should not crash the hook
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it('should handle profile fetch with non-ok response', async () => {
      mockLocalStorage['employee_token'] = 'invalid.token';

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response);

      renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should clear all authentication data on logout', async () => {
      // First login
      const mockLoginResponse = {
        token: 'jwt.token',
        user: { id: 1, username: 'test', role: 'user' },
        employee: { id: 1, firstName: 'Test', lastName: 'User' }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.employee).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('employee_token');
    });

    it('should clear query client on logout', async () => {
      const clearSpy = vi.spyOn(queryClient, 'clear');

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      act(() => {
        result.current.logout();
      });

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('Authentication State', () => {
    it('should return true for isAuthenticated when both user and employee exist', async () => {
      const mockLoginResponse = {
        token: 'jwt.token',
        user: { id: 1, username: 'test', role: 'user' },
        employee: { id: 1, firstName: 'Test', lastName: 'User' }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false for isAuthenticated when user exists but no employee', async () => {
      const mockLoginResponse = {
        token: 'jwt.token',
        user: { id: 1, username: 'test', role: 'user' },
        employee: null
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return false for isAuthenticated when employee exists but no user', () => {
      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      // Manually set employee without user
      act(() => {
        (result.current as any).setEmployee({ id: 1, firstName: 'Test' });
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should start with loading true and set to false after initialization', async () => {
      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle loading state with profile fetch', async () => {
      mockLocalStorage['employee_token'] = 'valid.token';

      // Mock slow profile fetch
      vi.mocked(fetch).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ data: { id: 1, firstName: 'Test' } })
          } as Response), 100)
        )
      );

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 200 });
    });
  });

  describe('Query Client Integration', () => {
    it('should set authorization header on successful login', async () => {
      const mockLoginResponse = {
        token: 'new.jwt.token',
        user: { id: 1, username: 'test', role: 'user' },
        employee: { id: 1, firstName: 'Test', lastName: 'User' }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse
      } as Response);

      const setDefaultOptionsSpy = vi.spyOn(queryClient, 'setDefaultOptions');

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await act(async () => {
        await result.current.login('testuser', 'password');
      });

      expect(setDefaultOptionsSpy).toHaveBeenCalledWith({
        queries: {
          meta: {
            headers: { Authorization: 'Bearer new.jwt.token' }
          }
        }
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON response during login', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('testuser', 'password');
        });
      }).rejects.toThrow('Invalid JSON');
    });

    it('should handle empty credentials gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Username and password required' })
      } as Response);

      const { result } = renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('', '');
        });
      }).rejects.toThrow('Username and password required');
    });

    it('should handle profile stale time correctly', async () => {
      mockLocalStorage['employee_token'] = 'valid.token';

      const mockProfile = { id: 1, firstName: 'Test' };
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProfile })
      } as Response);

      renderHook(() => useEmployeeAuth(), {
        wrapper: createWrapper
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Should not fetch again due to stale time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});