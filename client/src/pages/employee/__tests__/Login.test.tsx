import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import EmployeeLogin from '../Login';
import { AuthProvider } from '@/hooks/use-employee-auth';

// Mock dependencies
vi.mock('@/hooks/use-employee-auth', () => ({
  useEmployeeAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()]
}));

describe('EmployeeLogin', () => {
  let queryClient: QueryClient;
  let mockLogin: ReturnType<typeof vi.fn>;
  let mockToast: ReturnType<typeof vi.fn>;
  let mockSetLocation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockLogin = vi.fn();
    mockToast = vi.fn();
    mockSetLocation = vi.fn();

    vi.mocked(require('@/hooks/use-employee-auth')).useEmployeeAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      isAuthenticated: false
    });

    vi.mocked(require('@/hooks/use-toast')).useToast.mockReturnValue({
      toast: mockToast
    });

    vi.mocked(require('wouter')).useLocation.mockReturnValue(['/', mockSetLocation]);

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

  it('should render login form with all required fields', () => {
    renderWithProviders(<EmployeeLogin />);

    expect(screen.getByText('Employee Portal')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render TSG logo', () => {
    renderWithProviders(<EmployeeLogin />);

    const logo = screen.getByAltText('TSG Fulfillment');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/tsg-logo.png');
  });

  it('should handle form submission with valid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('should show success toast and redirect on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Login successful",
        description: "Welcome to the Employee Portal"
      });
      expect(mockSetLocation).toHaveBeenCalledWith('/employee');
    });
  });

  it('should show error toast on login failure', async () => {
    const user = userEvent.setup();
    const loginError = new Error('Invalid credentials');
    mockLogin.mockRejectedValue(loginError);

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive"
      });
    });
  });

  it('should handle non-Error exceptions during login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue('String error');

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive"
      });
    });
  });

  it('should disable form fields and show loading spinner when loading', () => {
    vi.mocked(require('@/hooks/use-employee-auth')).useEmployeeAuth.mockReturnValue({
      login: mockLogin,
      isLoading: true,
      isAuthenticated: false
    });

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should redirect to employee dashboard if already authenticated', () => {
    vi.mocked(require('@/hooks/use-employee-auth')).useEmployeeAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      isAuthenticated: true
    });

    renderWithProviders(<EmployeeLogin />);

    expect(mockSetLocation).toHaveBeenCalledWith('/employee');
  });

  it('should require username and password fields', async () => {
    const user = userEvent.setup();

    renderWithProviders(<EmployeeLogin />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should handle form submission with keyboard', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.keyboard('{Enter}');

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
  });

  it('should clear form on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/employee');
    });
  });

  it('should maintain form state on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    // Form should maintain values for retry
    expect(usernameInput.value).toBe('wronguser');
    expect(passwordInput.value).toBe('wrongpass');
  });

  it('should have proper form accessibility attributes', () => {
    renderWithProviders(<EmployeeLogin />);

    const form = screen.getByRole('form', { name: /sign in/i });
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(form).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(usernameInput).toHaveAttribute('id', 'username');
    expect(passwordInput).toHaveAttribute('id', 'password');
  });

  it('should have proper styling and layout', () => {
    renderWithProviders(<EmployeeLogin />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'items-center', 'justify-center');

    const card = container.firstChild;
    expect(card).toHaveClass('w-full', 'max-w-md');
  });

  it('should handle rapid form submissions gracefully', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<EmployeeLogin />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    
    // Click multiple times rapidly
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Should only call login once due to loading state
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });
});