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
  const { user, isLoading: authLoading } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const {
    data: fetchedFlags,
    error,
    isLoading: flagsLoading,
    refetch
  } = useQuery<Record<string, boolean>, Error>({
    queryKey: ["/api/feature-flags", user?.id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: true, // Always fetch, server will handle unauthenticated users
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Initialize flags with environment variables for unauthenticated users
  useEffect(() => {
    if (!user && !authLoading) {
      const envFlags = {
        employee_portal: getClientSideEnvFlag('employee_portal'),
        employee_auth: getClientSideEnvFlag('employee_auth'),
        employee_user_management: getClientSideEnvFlag('employee_user_management'),
        employee_customer_inquiries: getClientSideEnvFlag('employee_customer_inquiries'),
      };
      setFlags(envFlags);
    }
  }, [user, authLoading]);

  // Update local flags when server data changes
  useEffect(() => {
    if (fetchedFlags && user) {
      setFlags(fetchedFlags);
    }
  }, [fetchedFlags, user]);

  // Helper function to check if a flag is enabled
  const isEnabled = (flagName: string): boolean => {
    // If still loading auth, default to environment flags
    if (authLoading) {
      return getClientSideEnvFlag(flagName);
    }
    
    // For authenticated users, use server flags
    if (user) {
      return flags[flagName] || false;
    }
    
    // For unauthenticated users, use environment flags
    return getClientSideEnvFlag(flagName);
  };

  const refresh = () => {
    refetch();
  };

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags,
        isLoading: flagsLoading || authLoading,
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
  const { isEnabled, isLoading } = useFeatureFlags();
  
  // Show loading state while flags are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-lg mb-4"></div>
          <div className="h-4 w-32 bg-primary/20 rounded mb-3"></div>
          <div className="h-3 w-24 bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }
  
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
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