import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function AuthPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>You are successfully logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.email && (
                <div className="text-center text-sm text-muted-foreground">
                  {user.email}
                </div>
              )}
              <Button 
                asChild 
                className="w-full"
              >
                <Link href="/employee">Access Employee Portal</Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/logout'}
                className="w-full"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">TSG Fulfillment</CardTitle>
          <CardDescription>Employee Portal Access</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Sign in with your account to access the employee portal
            </p>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
