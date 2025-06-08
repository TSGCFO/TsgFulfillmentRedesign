import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ClientLogos from '@/components/ClientLogos';
import ServicesSection from '@/components/ServicesSection';
import IndustriesSection from '@/components/IndustriesSection';
import ProcessSection from '@/components/ProcessSection';
import BenefitsSection from '@/components/BenefitsSection';
import CTASection from '@/components/CTASection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AboutSection from '@/components/AboutSection';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import EnhancedSEOManager from '@/seo/EnhancedSEOManager';
import { STRUCTURED_DATA_TEMPLATES } from '@/seo/seo-config';
import { generatePageSchema } from '@/seo/advanced-schema';

const Home: React.FC = () => {
  // Setup cookie consent functionality
  useEffect(() => {
    // Check if cookie consent already exists
    const hasConsent = localStorage.getItem('cookie-consent');
    
    if (!hasConsent) {
      // We would show cookie consent banner here
      // For now, just setting it to true as if user accepted
      localStorage.setItem('cookie-consent', 'true');
    }
  }, []);



  return (
    <div className="min-h-screen">
      <EnhancedSEOManager 
        page="home"
        canonical="/"
        ogImage="/images/og-home.jpg"
        criticalImages={['/images/hero-fulfillment-center.jpg', '/images/logo.png']}
        preloadResources={['/css/critical.css', '/js/tracking.js']}
        prefetchPages={['/services', '/about', '/contact', '/quote']}
        enablePerformanceOptimization={true}
        breadcrumbs={[
          { name: 'Home', url: '/' }
        ]}
        structuredData={[
          STRUCTURED_DATA_TEMPLATES.faq([
            {
              question: "What fulfillment services does TSG offer?",
              answer: "TSG Fulfillment provides comprehensive order fulfillment, warehousing, kitting, assembly, and freight forwarding services for eCommerce and retail businesses."
            },
            {
              question: "Where is TSG Fulfillment located?",
              answer: "Our modern fulfillment center is located at 6750 Langstaff Road, Vaughan, Ontario, strategically positioned to serve the Greater Toronto Area."
            },
            {
              question: "How can I get a quote for fulfillment services?",
              answer: "You can request a personalized quote by visiting our quote page, calling (289) 815-5869, or emailing info@tsgfulfillment.com."
            }
          ])
        ]}
      />
      
      <Navbar />
      <main>
        <HeroSection />
        <ClientLogos />
        <ServicesSection />
        <IndustriesSection />
        <AboutSection />
        <ProcessSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Home;
