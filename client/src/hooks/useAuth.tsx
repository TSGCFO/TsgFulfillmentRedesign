import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Redirect to logout endpoint which will handle the OIDC logout
      window.location.href = '/api/logout';
    },
    onSuccess: () => {
      // Clear the cache after logout
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logoutMutation,
  };
}