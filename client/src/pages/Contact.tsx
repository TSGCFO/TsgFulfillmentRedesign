import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mail, Phone, MapPin, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedContactForm } from '@/components/UnifiedContactForm';
import SEOManager from '@/seo/SEOManager';
import { generateBreadcrumbs, generateFAQStructuredData } from '@/seo/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string[];
  link?: string;
}

const Contact: React.FC = () => {
  
  // Contact information
  const contactInfo: ContactInfo[] = [
    {
      icon: <Phone className="h-10 w-10 text-primary" />,
      title: "Phone",
      details: ["(289) 815-5869", "Mon-Fri, 8am-5pm EST"],
      link: "tel:2898155869"
    },
    {
      icon: <Mail className="h-10 w-10 text-primary" />,
      title: "Email",
      details: ["info@tsgfulfillment.com", "support@tsgfulfillment.com"],
      link: "mailto:info@tsgfulfillment.com"
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: "Main Office",
      details: ["6750 Langstaff Road", "Vaughan, Ontario L4H 5K2"],
      link: "https://maps.google.com/?q=6750+Langstaff+Road+Vaughan+Ontario+L4H+5K2"
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Sales Inquiries",
      details: ["sales@tsgfulfillment.com", "Request a custom quote"],
      link: "mailto:sales@tsgfulfillment.com"
    }
  ];
  
  // Service interest options
  const serviceOptions = [
    { value: "warehousing", label: "Warehousing" },
    { value: "fulfillment", label: "Fulfillment" },
    { value: "transportation", label: "Transportation" },
    { value: "value-added", label: "Value Added Services" },
    { value: "multiple", label: "Multiple Services" },
    { value: "other", label: "Other" }
  ];

  const subjects = [
    "General Inquiry",
    "Request a Quote",
    "Partnership Opportunity",
    "Other"
  ];

  // Define structured data for the Contact page
  const contactPageData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact TSG Fulfillment",
    "description": "Get in touch with TSG Fulfillment for logistics and fulfillment services in Vaughan, Ontario.",
    "url": "https://tsgfulfillment.com/contact",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-289-815-5869",
      "contactType": "customer service",
      "email": "info@tsgfulfillment.com",
      "areaServed": "CA",
      "availableLanguage": ["English"]
    },
    "location": {
      "@type": "Place",
      "name": "TSG Fulfillment Services",
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
      }
    }
  };

  return (
    <>
      <SEOManager 
        page="contact"
        canonical="/contact"
        ogImage="/images/contact-hero.jpg"
        breadcrumbs={generateBreadcrumbs('/contact')}
        preloadImages={['/images/contact-hero.jpg', '/images/warehouse-contact.jpg']}
        structuredData={[
          contactPageData,
          generateFAQStructuredData([
            {
              question: "How can I contact TSG Fulfillment?",
              answer: "You can contact us by phone at (289) 815-5869, email at info@tsgfulfillment.com, or by visiting our location at 6750 Langstaff Road, Vaughan, Ontario."
            },
            {
              question: "What information do I need to provide for a quote?",
              answer: "For an accurate quote, please provide details about your product types, expected order volumes, storage requirements, and any special handling needs."
            },
            {
              question: "How quickly can TSG respond to my inquiry?",
              answer: "We typically respond to all inquiries within 24 hours during business days. For urgent requests, please call us directly."
            }
          ])
        ]}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
            alt="Customer service contact center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 py-16 md:py-20">
          {/* Breadcrumb */}
          <div className="mb-8 text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Contact Us</span>
          </div>
          
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Get In <span className="font-light">Touch</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Have questions about our services? Ready to optimize your logistics operations? 
              Our team is here to help you find the right fulfillment solutions for your business.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Information Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ 
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {contactInfo.map((info, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-8 rounded-lg shadow-sm text-center"
                variants={fadeIn}
              >
                <div className="flex justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{info.title}</h3>
                <div className="mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className={`${idx === 0 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {detail}
                    </p>
                  ))}
                </div>
                {info.link && (
                  <a 
                    href={info.link} 
                    className="text-primary inline-flex items-center hover:underline font-medium"
                    target={info.link.startsWith('http') ? '_blank' : undefined}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {info.title === 'Main Office' ? 'View on Map' : 'Contact Us'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Contact Form</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                Send Us a <span className="text-primary">Message</span>
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Fill out the form below, and one of our logistics experts will get back to you 
                within one business day to discuss your specific needs.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 md:p-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <UnifiedContactForm
                endpoint="/api/contact"
                includeService
                includeSubject
                serviceOptions={serviceOptions.map(o => o.label)}
                subjectOptions={subjects}
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Locations</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Visit Our <span className="text-primary">Facilities</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our strategically located fulfillment centers across the United States allow us to provide 
              efficient, cost-effective shipping to customers nationwide.
            </p>
          </motion.div>
          
          <motion.div
            className="h-[500px] bg-gray-200 rounded-lg overflow-hidden shadow-md"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            {/* This would normally be replaced with an actual Google Maps embed */}
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Map Placeholder</h3>
                <p className="text-gray-600 mt-2">
                  In a real implementation, this would be an interactive Google Map showing our facilities.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Logistics?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're looking for a complete fulfillment solution or specialized services, 
              our team is ready to help you optimize your supply chain.
            </p>
            <Button 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
              onClick={() => window.location.href = 'tel:8005551234'}
            >
              Call Us Now: (800) 555-1234
              <Phone className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Contact;