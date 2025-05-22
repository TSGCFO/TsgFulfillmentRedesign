import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useEffect } from "react";
import { checkRedirect, setCanonicalUrl } from "./lib/redirects";
import CookieConsent from "@/components/CookieConsent";
import HelmetProvider from "@/components/SEO/HelmetProvider";

// Lazy load page components
const Home = lazy(() => import("@/pages/Home"));
const OWDStyleHome = lazy(() => import("@/pages/OWDStyleHome"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const IndustryDetail = lazy(() => import("@/pages/IndustryDetail"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Locations = lazy(() => import("@/pages/Locations"));
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
        <Route path="/" component={Home} />
        <Route path="/old-home" component={OWDStyleHome} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/industries/:slug" component={IndustryDetail} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/locations" component={Locations} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/analytics/reports" component={ReportGenerator} />
        <Route path="/analytics/comparison" component={PerformanceComparison} />
        <Route path="/analytics/dashboard" component={CustomDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// Add an animation to the global CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

function App() {
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
