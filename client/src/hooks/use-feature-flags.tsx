/**
 * Client-side Feature Flag Hooks
 * 
 * Provides React hooks and context for checking feature flags
 */

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { useAuth } from "./use-auth";

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  isLoading: boolean;
  error: Error | null;
  isEnabled: (flagName: string) => boolean;
  refresh: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const {
    data: fetchedFlags,
    error,
    isLoading,
    refetch
  } = useQuery<Record<string, boolean>, Error>({
    queryKey: ["/api/feature-flags", user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only fetch when user is authenticated
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Update local flags when data changes
  useEffect(() => {
    if (fetchedFlags) {
      setFlags(fetchedFlags);
    }
  }, [fetchedFlags]);

  // Helper function to check if a flag is enabled
  const isEnabled = (flagName: string): boolean => {
    // For unauthenticated users, check environment-based flags
    if (!user) {
      return getClientSideEnvFlag(flagName);
    }
    
    return flags[flagName] || false;
  };

  const refresh = () => {
    refetch();
  };

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags,
        isLoading,
        error,
        isEnabled,
        refresh,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagsProvider");
  }
  return context;
}

/**
 * Hook to check a specific feature flag
 */
export function useFeatureFlag(flagName: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagName);
}

/**
 * Hook for conditional rendering based on feature flags
 */
export function useFeatureGate(flagName: string) {
  const isEnabled = useFeatureFlag(flagName);
  
  return {
    isEnabled,
    FeatureGate: ({ children, fallback = null }: { 
      children: ReactNode; 
      fallback?: ReactNode;
    }) => {
      return isEnabled ? <>{children}</> : <>{fallback}</>;
    }
  };
}

/**
 * Component for conditional rendering based on feature flags
 */
export function FeatureFlag({ 
  flag, 
  children, 
  fallback = null 
}: { 
  flag: string; 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * Get environment-based feature flags for client-side
 * This is a fallback for unauthenticated users
 */
function getClientSideEnvFlag(flagName: string): boolean {
  // Map flag names to environment variables
  const envMapping: Record<string, string> = {
    employee_portal: 'VITE_EMPLOYEE_PORTAL_ENABLED',
    employee_auth: 'VITE_EMPLOYEE_AUTH_ENABLED',
    employee_user_management: 'VITE_EMPLOYEE_USER_MANAGEMENT_ENABLED',
    employee_customer_inquiries: 'VITE_EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED',
  };

  const envVar = envMapping[flagName];
  if (!envVar) return false;

  const value = import.meta.env[envVar];
  return value === 'true';
}

/**
 * Hook to check multiple feature flags at once
 */
export function useFeatureFlags_Multiple(flagNames: string[]): Record<string, boolean> {
  const { flags } = useFeatureFlags();
  
  return flagNames.reduce((acc, flagName) => {
    acc[flagName] = flags[flagName] || false;
    return acc;
  }, {} as Record<string, boolean>);
}