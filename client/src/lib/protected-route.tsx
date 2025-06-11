import { useAuth } from "@/hooks/use-auth";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRoles = [],
  featureFlag,
}: {
  path: string;
  component: React.ComponentType<any>;
  requiredRoles?: string[];
  featureFlag?: string;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();

  // Show loading while auth or flags are loading
  if (authLoading || flagsLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Check feature flag if specified
  if (featureFlag && !isEnabled(featureFlag)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Not Available</h1>
            <p className="text-gray-600">This feature is currently disabled.</p>
          </div>
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check role permissions if required roles are specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500">Required role: {requiredRoles.join(" or ")}</p>
          </div>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}