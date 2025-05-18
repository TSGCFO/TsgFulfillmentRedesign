import { Switch, Route, useLocation, useRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useEffect } from "react";
import { checkRedirect, setCanonicalUrl } from "./lib/redirects";

// Lazy load page components
const Home = lazy(() => import("@/pages/Home"));
const OWDStyleHome = lazy(() => import("@/pages/OWDStyleHome"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const ReportGenerator = lazy(() => import("@/pages/ReportGenerator"));
const PerformanceComparison = lazy(() => import("@/pages/PerformanceComparison"));
const CustomDashboard = lazy(() => import("@/pages/CustomDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-16 h-16 bg-primary/20 rounded-lg mb-4"></div>
      <div className="h-4 w-32 bg-primary/20 rounded mb-3"></div>
      <div className="h-3 w-24 bg-primary/10 rounded"></div>
    </div>
  </div>
);

function Router() {
  const [location, setLocation] = useLocation();
  
  // Handle 301 redirects and set canonical URLs
  useEffect(() => {
    // Check if we need to redirect
    const redirectTo = checkRedirect(location);
    if (redirectTo) {
      // Use 301 redirect - add history entry for browser back button
      window.history.replaceState(null, '', redirectTo);
      setLocation(redirectTo);
    } else {
      // Set canonical URL for current page
      setCanonicalUrl(location);
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location, setLocation]);
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={OWDStyleHome} />
        <Route path="/old-home" component={Home} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/analytics/reports" component={ReportGenerator} />
        <Route path="/analytics/comparison" component={PerformanceComparison} />
        <Route path="/analytics/dashboard" component={CustomDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
