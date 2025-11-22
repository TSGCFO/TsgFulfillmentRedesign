import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package2, 
  TruckIcon, 
  WarehouseIcon, 
  ChartBarIcon, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo and Company Name */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Package2 className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold">
                TSG Fulfillment
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Employee Portal Access
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Welcome to the Employee Portal
            </h2>
            <p className="text-lg text-muted-foreground">
              Access your employee dashboard, manage customer inquiries, track materials, 
              and collaborate with your team all in one place.
            </p>
          </div>

          {/* Sign In Button */}
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign in with Your Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <Users className="w-10 h-10 text-primary" />
                <h3 className="font-semibold text-lg">Customer Management</h3>
                <p className="text-sm text-muted-foreground">
                  Handle customer inquiries and manage relationships efficiently
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <WarehouseIcon className="w-10 h-10 text-primary" />
                <h3 className="font-semibold text-lg">Materials Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor inventory levels and manage material orders
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <ChartBarIcon className="w-10 h-10 text-primary" />
                <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  View performance metrics and generate comprehensive reports
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="mt-16 space-y-8 max-w-3xl">
            <h3 className="text-2xl font-semibold">Why TSG Fulfillment?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Industry-Leading Solutions</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive fulfillment services tailored to your needs
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Expert Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Dedicated professionals committed to your success
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Advanced Technology</h4>
                  <p className="text-sm text-muted-foreground">
                    State-of-the-art systems for efficient operations
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Protected portal with enterprise-grade security
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-12 flex items-center space-x-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-5 h-5" />
            <span>Secure authentication powered by Replit</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Package2 className="w-6 h-6 text-primary" />
              <span className="font-semibold">TSG Fulfillment</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="/about" className="hover:text-primary transition-colors">
                About Us
              </a>
              <a href="/services/fulfillment" className="hover:text-primary transition-colors">
                Services
              </a>
              <a href="/contact" className="hover:text-primary transition-colors">
                Contact
              </a>
              <a href="/locations" className="hover:text-primary transition-colors">
                Locations
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TSG Fulfillment. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}