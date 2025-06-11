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
import { FeatureFlagsProvider, FeatureFlag } from "@/hooks/use-feature-flags";

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
const FeatureFlagAdmin = lazy(() => import("@/pages/FeatureFlagAdmin"));
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
        
        {/* Authentication route - controlled by feature flag */}
        <FeatureFlag flag="employee_auth">
          <Route path="/auth" component={AuthPage} />
        </FeatureFlag>
        
        {/* Employee Portal routes - controlled by feature flags */}
        <ProtectedRoute 
          path="/employee" 
          component={EmployeePortal} 
          requiredRoles={["SuperAdmin", "Admin", "User"]} 
          featureFlag="employee_portal"
        />
        
        <ProtectedRoute 
          path="/employee/users" 
          component={UserManagement} 
          requiredRoles={["SuperAdmin", "Admin"]} 
          featureFlag="employee_user_management"
        />
        
        <ProtectedRoute 
          path="/employee/inquiries" 
          component={CustomerInquiries} 
          requiredRoles={["SuperAdmin", "Admin", "User"]} 
          featureFlag="employee_customer_inquiries"
        />
        
        {/* Feature Flag Administration - SuperAdmin only */}
        <ProtectedRoute 
          path="/admin/feature-flags" 
          component={FeatureFlagAdmin} 
          requiredRoles={["SuperAdmin"]} 
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
        <FeatureFlagsProvider>
          <HelmetProvider>
            <Router />
            <Toaster />
            <CookieConsent />
          </HelmetProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
