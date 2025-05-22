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
import Seo from '@/components/SEO/Seo';

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

  // Combined structured data for the homepage
  const combinedStructuredData = [
    // Organization data
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TSG Fulfillment Services",
      "url": "https://tsgfulfillment.com",
      "logo": "https://tsgfulfillment.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-289-815-5869",
        "contactType": "customer service",
        "areaServed": "CA",
        "availableLanguage": ["English"]
      },
      "sameAs": [
        "https://www.facebook.com/tsgfulfillment",
        "https://www.linkedin.com/company/tsg-fulfillment",
        "https://twitter.com/tsgfulfillment"
      ]
    },
    // Local Business data
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "TSG Fulfillment Services",
      "image": "https://tsgfulfillment.com/images/warehouse.jpg",
      "@id": "https://tsgfulfillment.com",
      "url": "https://tsgfulfillment.com",
      "telephone": "+1-289-815-5869",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "6750 Langstaff Road",
        "addressLocality": "Vaughan",
        "addressRegion": "Ontario",
        "postalCode": "L4H 5K2",
        "addressCountry": "CA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 43.8013,
        "longitude": -79.5425
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "17:00"
      },
      "priceRange": "$$"
    }
  ];

  return (
    <div className="min-h-screen">
      <Seo 
        title="TSG Fulfillment - Professional Logistics & Fulfillment Services"
        description="TSG Fulfillment provides end-to-end logistics and fulfillment solutions for eCommerce and retail businesses, including warehousing, order fulfillment, and transportation services."
        keywords="fulfillment services, logistics, warehousing, ecommerce fulfillment, order fulfillment, transportation, supply chain"
        canonical="https://tsgfulfillment.com"
        ogType="website"
        ogUrl="https://tsgfulfillment.com"
        ogImage="https://tsgfulfillment.com/images/og-image.jpg"
        twitterCard="summary_large_image"
        twitterTitle="TSG Fulfillment - Professional Logistics & Fulfillment Services"
        twitterDescription="TSG Fulfillment provides end-to-end logistics and fulfillment solutions for eCommerce and retail businesses."
        structuredData={combinedStructuredData}
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
