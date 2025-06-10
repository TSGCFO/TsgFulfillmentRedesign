import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  permissions: Record<string, any>;
}

interface User {
  id: number;
  username: string;
  role: string;
}

export function useEmployeeAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('employee_token')
  );
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/employee/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setEmployee(data.employee);
      setToken(data.token);
      localStorage.setItem('employee_token', data.token);
    }
  });

  // Check for existing token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('employee_token');
    if (savedToken) {
      setToken(savedToken);
      // Could fetch profile here if needed
    }
  }, []);

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    setUser(null);
    setEmployee(null);
    setToken(null);
    localStorage.removeItem('employee_token');
    queryClient.clear();
  };

  return {
    user,
    employee,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading: loginMutation.isPending
  };
}