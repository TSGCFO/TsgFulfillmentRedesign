import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useEffect } from "react";
import { checkRedirect, setCanonicalUrl } from "./lib/redirects";
import CookieConsent from "@/components/CookieConsent";
import HelmetProvider from "@/components/SEO/HelmetProvider";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Lazy load page components
const Home = lazy(() => import("@/pages/Home"));
const OWDStyleHome = lazy(() => import("@/pages/OWDStyleHome"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const IndustryDetail = lazy(() => import("@/pages/IndustryDetail"));
const About = lazy(() => import("@/pages/About"));
const Locations = lazy(() => import("@/pages/Locations"));
const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
const Analytics = lazy(() => import("@/pages/Analytics"));
const ReportGenerator = lazy(() => import("@/pages/ReportGenerator"));
const PerformanceComparison = lazy(() => import("@/pages/PerformanceComparison"));
const CustomDashboard = lazy(() => import("@/pages/CustomDashboard"));
const ImageManagement = lazy(() => import("@/pages/image-management"));
const QuoteButtonTest = lazy(() => import("@/pages/QuoteButtonTest"));
const ContactForm = lazy(() => import("@/pages/ContactForm"));
const QuoteRequest = lazy(() => import("@/pages/QuoteRequest"));
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

// Error fallback component for when lazy loading fails
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center p-6">
      <div className="w-20 h-20 mx-auto mb-4 text-red-500">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-6">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
        <button
          onClick={() => window.location.assign('/')}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

function Router() {
  const [location, setLocation] = useLocation();
  
  // Track page views when routes change
  useAnalytics();
  
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
        <Route path="/" component={Home} />
        <Route path="/old-home" component={OWDStyleHome} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/industries/:slug" component={IndustryDetail} />
        <Route path="/about" component={About} />
        <Route path="/locations" component={Locations} />
        {analyticsEnabled && (
          <>
            <Route path="/analytics" component={Analytics} />
            <Route path="/analytics/reports" component={ReportGenerator} />
            <Route path="/analytics/comparison" component={PerformanceComparison} />
            <Route path="/analytics/dashboard" component={CustomDashboard} />
          </>
        )}
        <Route path="/admin/images" component={ImageManagement} />
        <Route path="/test/quote-buttons" component={QuoteButtonTest} />
        <Route path="/contact-form" component={ContactForm} />
        <Route path="/quote" component={QuoteRequest} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    initGA();
  }, []);

  // Global error handler for unhandled promise rejections and errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      // You can add error reporting service here
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can add error reporting service here
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router />
        <Toaster />
        <CookieConsent />
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
