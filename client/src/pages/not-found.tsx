import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useEffect } from "react";
import Footer from "../components/Footer";
import { useLocation } from "wouter";
import Seo from "@/components/SEO/Seo";

export default function NotFound() {
  const [, setLocation] = useLocation();

  // We no longer need to manually update document metadata
  // The Seo component will handle this for us

  // Define SEO properties for the 404 page
  const notFoundSeo = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Not Found | TSG Fulfillment",
    "description": "The page you are looking for could not be found. Return to the TSG Fulfillment homepage.",
    "url": "https://tsgfulfillment.com/404",
    "isPartOf": {
      "@type": "WebSite",
      "name": "TSG Fulfillment",
      "url": "https://tsgfulfillment.com"
    }
  };

  return (
    <>
      <Seo
        title="Page Not Found | TSG Fulfillment"
        description="The page you are looking for could not be found. Return to the TSG Fulfillment homepage."
        ogType="website"
        structuredData={notFoundSeo}
      />
      <div className="min-h-screen w-full flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-16 px-4">
          <Card className="w-full max-w-lg shadow-md">
            <CardContent className="pt-10 pb-10 px-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">404 Page Not Found</h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're sorry, but the page you were looking for doesn't exist or has been moved.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  className="flex items-center gap-2" 
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                  onClick={() => setLocation("/")}
                >
                  <Home className="h-4 w-4" />
                  Return to Homepage
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                <p>Looking for our services? <a href="/services/order-fulfillment" className="text-primary hover:underline">View our fulfillment services</a> or <a href="/#contact" className="text-primary hover:underline">contact our team</a>.</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
}
