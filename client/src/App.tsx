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
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { FeatureFlagProvider } from "@/hooks/use-feature-flags";
import { FeatureBoundary } from "@/components/FeatureWrapper";
import { FeatureFlag } from "../../shared/feature-flags";

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
const EmployeePortal = lazy(() => import("@/pages/EmployeePortal"));
const UserManagement = lazy(() => import("@/pages/user-management"));
const CustomerInquiries = lazy(() => import("@/pages/customer-inquiries"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const NotFound = lazy(() => import("@/pages/not-found"));
const FeatureFlagDemo = lazy(() => import("@/pages/FeatureFlagDemo"));

// Import feature flag components
import { FeatureWrapper, FeatureToggle } from "@/components/FeatureWrapper";
import { useFeatureFlag } from "@/hooks/use-feature-flags";

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
  
  // Track page views when routes change
  useAnalytics();
  
  // Example feature flag usage in routing
  const isNewDashboardEnabled = useFeatureFlag(FeatureFlag.NEW_DASHBOARD);
  const isEnhancedSearchEnabled = useFeatureFlag(FeatureFlag.ENHANCED_SEARCH);
  
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
        {/* Feature Flag Example: Conditional Home Page */}
        <Route path="/" component={Home} />
        <Route path="/old-home" component={OWDStyleHome} />
        
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/industries/:slug" component={IndustryDetail} />
        <Route path="/about" component={About} />
        <Route path="/locations" component={Locations} />
        
        {/* Feature Flag Example: Analytics routes with enhanced features */}
        {analyticsEnabled && (
          <>
            <Route path="/analytics" component={Analytics} />
            <Route path="/analytics/reports" component={ReportGenerator} />
            <Route path="/analytics/comparison" component={PerformanceComparison} />
            
            {/* Feature Flag Example: New Dashboard */}
            <FeatureWrapper
              feature={FeatureFlag.NEW_DASHBOARD}
              fallback={<Route path="/analytics/dashboard" component={CustomDashboard} />}
            >
              <Route path="/analytics/dashboard" component={CustomDashboard} />
            </FeatureWrapper>
          </>
        )}
        
        <Route path="/admin/images" component={ImageManagement} />
        <Route path="/test/quote-buttons" component={QuoteButtonTest} />
        
        {/* Feature Flag Example: Enhanced vs Basic Contact Form */}
        <FeatureToggle
          feature={FeatureFlag.ENHANCED_SEARCH}
          enabled={<Route path="/contact-form" component={ContactForm} />}
          disabled={<Route path="/contact-form" component={ContactForm} />}
        />
        
        <Route path="/quote" component={QuoteRequest} />
        <Route path="/auth" component={AuthPage} />
        
        {/* Feature Flag Demo Page */}
        <Route path="/feature-flags-demo" component={FeatureFlagDemo} />
        
        {/* Feature Flag Example: Enhanced Employee Portal */}
        <FeatureWrapper
          feature={FeatureFlag.NEW_DASHBOARD}
          fallback={
            <ProtectedRoute
              path="/employee"
              component={EmployeePortal}
              requiredRoles={["SuperAdmin", "Admin", "User"]}
            />
          }
        >
          <ProtectedRoute
            path="/employee"
            component={EmployeePortal}
            requiredRoles={["SuperAdmin", "Admin", "User"]}
          />
        </FeatureWrapper>
        
        <ProtectedRoute
          path="/employee/users"
          component={UserManagement}
          requiredRoles={["SuperAdmin", "Admin"]}
        />
        <ProtectedRoute
          path="/employee/inquiries"
          component={CustomerInquiries}
          requiredRoles={["SuperAdmin", "Admin", "User"]}
        />
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
  // Initialize Google Analytics when app loads
  useEffect(() => {
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeatureFlagProvider
          debug={import.meta.env.DEV}
          refreshInterval={5 * 60 * 1000} // 5 minutes
          maxRetries={3}
          fallbackFlags={{
            [FeatureFlag.NEW_DASHBOARD]: false,
            [FeatureFlag.ENHANCED_SEARCH]: false,
            [FeatureFlag.DOCUMENT_SIGNING]: false,
            [FeatureFlag.HUBSPOT_V2]: false,
            [FeatureFlag.PERFORMANCE_CACHING]: false
          }}
        >
          <HelmetProvider>
            <FeatureBoundary>
              <Router />
            </FeatureBoundary>
            <Toaster />
            <CookieConsent />
          </HelmetProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
