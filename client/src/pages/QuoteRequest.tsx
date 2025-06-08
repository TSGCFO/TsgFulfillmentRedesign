import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UnifiedContactForm } from "@/components/UnifiedContactForm";
import SEOManager from "@/seo/SEOManager";
import { generateBreadcrumbs, generateServiceStructuredData } from "@/seo/utils";


const services = [
  "Fulfillment Services",
  "Warehousing",
  "Transportation",
  "Supply Chain Consulting",
  "E-commerce Solutions",
  "Inventory Management",
  "Reverse Logistics",
  "Value-Added Services",
  "Custom Solutions"
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const QuoteRequest = () => {
  const [, setLocation] = useLocation();
  // Get service from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedService = urlParams.get('service') || '';

  return (
    <>
      <SEOManager 
        page="quote"
        canonical="/quote"
        ogImage="/images/quote-hero.jpg"
        breadcrumbs={generateBreadcrumbs('/quote')}
        preloadImages={['/images/quote-hero.jpg']}
        structuredData={[
          generateServiceStructuredData(
            "Custom Fulfillment Quote",
            "Get a personalized quote for fulfillment services tailored to your business needs. Fast response and competitive pricing for all logistics solutions.",
            "/quote"
          )
        ]}
      />
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="max-w-4xl mx-auto text-center"
            >
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 mb-6"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-6">
                Request a Quote
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Get a customized quote for your fulfillment needs. Our team will analyze your requirements and provide competitive pricing within 24 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quote Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="mb-8"
              >
                <UnifiedContactForm
                  endpoint="/api/quote-requests"
                  includeService
                  includeConsent
                  serviceOptions={services}
                  defaultValues={{ service: preselectedService }}
                />
              </motion.div>
              
              {/* What Happens Next */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="grid gap-6 md:grid-cols-3 text-center"
              >
                <Card className="border-primary/10">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Review</h3>
                    <p className="text-sm text-gray-600">
                      Our team analyzes your requirements and current fulfillment challenges
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-lg">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Customize</h3>
                    <p className="text-sm text-gray-600">
                      We create a tailored solution and competitive pricing for your needs
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold text-lg">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Connect</h3>
                    <p className="text-sm text-gray-600">
                      We schedule a call to present your quote and answer questions
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default QuoteRequest;