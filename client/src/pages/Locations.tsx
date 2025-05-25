import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { MapPin, Building, Warehouse, Truck, Clock, Phone, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Seo from '@/components/SEO/Seo';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface FacilityLocation {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  email: string;
  image: string;
  size: string;
  features: string[];
  services: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const Locations: React.FC = () => {
  // Facility locations data
  const facilities: FacilityLocation[] = [
    {
      id: "vaughan",
      name: "Vaughan, Ontario",
      address: {
        street: "6750 Langstaff Road",
        city: "Vaughan",
        state: "Ontario",
        zip: "L4H 5K2"
      },
      phone: "(905) 555-1234",
      email: "info@tsgfulfillment.com",
      image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      size: "150,000 sq ft",
      features: [
        "Modern warehousing environment",
        "High security with 24/7 monitoring",
        "Strategic location near Highway 407",
        "Modern loading docks",
        "Advanced inventory management systems",
        "Organized storage solutions"
      ],
      services: [
        "Warehousing",
        "Order fulfillment",
        "Kitting & assembly",
        "E-commerce logistics",
        "Inventory management",
        "Returns processing"
      ],
      description: "Our state-of-the-art Vaughan facility serves as our headquarters and fulfillment center. Strategically located in the Greater Toronto Area with easy access to major highways and transportation hubs, we efficiently serve Canadian and cross-border logistics needs with comprehensive fulfillment solutions.",
      coordinates: {
        lat: 43.8177,
        lng: -79.5323
      }
    }
  ];

  // Define structured data for the location page
  const locationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TSG Fulfillment Services",
    "url": "https://tsgfulfillment.com",
    "logo": "https://tsgfulfillment.com/logo.png",
    "description": "TSG Fulfillment provides logistics and fulfillment services from our Vaughan, Ontario facility.",
    "location": {
      "@type": "Place",
      "name": "TSG Fulfillment Services - Vaughan Facility",
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
      "telephone": "+1-289-815-5869",
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
      }
    }
  };

  return (
    <>
      <Seo
        title="Our Vaughan, Ontario Facility | TSG Fulfillment"
        description="TSG Fulfillment's state-of-the-art facility in Vaughan, Ontario provides comprehensive logistics and fulfillment services for businesses across Canada."
        keywords="vaughan fulfillment center, ontario logistics facility, canadian fulfillment services, tsg fulfillment location, 6750 langstaff road, warehousing vaughan, gta logistics"
        canonical="https://tsgfulfillment.com/locations"
        ogType="website"
        ogUrl="https://tsgfulfillment.com/locations"
        ogImage="https://tsgfulfillment.com/images/warehouse-facility.jpg"
        twitterCard="summary_large_image"
        twitterTitle="Our Vaughan, Ontario Facility | TSG Fulfillment"
        twitterDescription="TSG Fulfillment's state-of-the-art facility in Vaughan, Ontario provides comprehensive logistics and fulfillment services for businesses across Canada."
        structuredData={locationData}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <OptimizedImage 
            src="https://images.unsplash.com/photo-1609867053361-e5ebb5a2f129?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
            alt="TSG Fulfillment Vaughan facility"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 py-16 md:py-20">
          {/* Breadcrumb */}
          <div className="mb-8 text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Locations</span>
          </div>
          
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="font-light">Facility</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              TSG Fulfillment operates a state-of-the-art facility in Vaughan, Ontario,
              providing comprehensive logistics services to minimize shipping times and costs for businesses of all sizes.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Overview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Strategic Location</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Greater Toronto Area <span className="text-primary">Hub</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Our facility is strategically positioned in Vaughan, Ontario to efficiently serve the Greater Toronto Area and beyond. 
              With excellent highway access, we provide optimal coverage for Canadian e-commerce, retail, and B2B distribution needs.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-100 rounded-xl p-8 md:p-10 max-w-5xl mx-auto mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">1</h3>
                <p className="text-gray-600">Modern Facility</p>
              </div>
              <div>
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">90%</h3>
                <p className="text-gray-600">Canadian Coverage in 2 Days</p>
              </div>
              <div>
                <Warehouse className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">150,000+</h3>
                <p className="text-gray-600">Square Feet of Space</p>
              </div>
            </div>
          </motion.div>
          
          {/* Location Map (Placeholder) */}
          <motion.div
            className="rounded-lg overflow-hidden shadow-lg h-[500px] mb-20 bg-gray-200"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            {/* This would be replaced with an actual map component in production */}
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Canada-Wide Service</h3>
                <p className="text-gray-600">
                  This would be an interactive map showing our Vaughan facility 
                  and service coverage area in a real implementation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Facilities</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              State-of-the-Art <span className="text-primary">Distribution Centers</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Each of our facilities is equipped with advanced technology and systems to ensure 
              efficient, accurate fulfillment services for our clients.
            </p>
          </motion.div>
          
          {facilities.map((facility, index) => (
            <motion.div 
              key={facility.id}
              id={facility.id}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 mb-20 last:mb-0`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              {/* Facility Image */}
              <div className="lg:w-1/2">
                <div className="relative h-full">
                  <OptimizedImage 
                    src={facility.image}
                    alt={`TSG Fulfillment ${facility.name} facility`}
                    width={800}
                    height={500}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute top-0 left-0 bg-primary text-white px-6 py-3 rounded-tl-lg rounded-br-lg font-bold">
                    {facility.name}
                  </div>
                </div>
              </div>
              
              {/* Facility Details */}
              <div className="lg:w-1/2">
                <h3 className="text-2xl font-bold mb-4">{facility.name} Facility</h3>
                <p className="text-gray-700 mb-6">{facility.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                  <div>
                    <h4 className="font-semibold text-primary mb-2 flex items-center">
                      <Building className="h-5 w-5 mr-2" /> Facility Details
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Size: {facility.size}</span>
                      </li>
                      <li>
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Address:<br />
                            {facility.address.street}<br />
                            {facility.address.city}, {facility.address.state} {facility.address.zip}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Phone className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{facility.phone}</span>
                      </li>
                      <li className="flex items-start">
                        <Mail className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{facility.email}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-primary mb-2 flex items-center">
                      <Truck className="h-5 w-5 mr-2" /> Services Offered
                    </h4>
                    <ul className="space-y-2">
                      {facility.services.map((service, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <h4 className="font-semibold text-primary mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2" /> Facility Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                  {facility.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="bg-primary text-white hover:bg-primary/90 flex items-center"
                  onClick={() => {
                    window.location.href = `mailto:${facility.email}`;
                  }}
                >
                  Contact Our Facility
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Advantages</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Benefits of Our <span className="text-primary">Vaughan Facility</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our state-of-the-art Vaughan facility provides numerous advantages for businesses 
              looking to optimize their logistics operations throughout Canada.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="bg-gray-50 p-8 rounded-lg shadow-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Truck className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Strategic GTA Location</h3>
              <p className="text-gray-600">
                Located in Vaughan with easy access to Highway 407, our facility enables quick delivery 
                throughout the Greater Toronto Area and efficient distribution across Canada.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-gray-50 p-8 rounded-lg shadow-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Building className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Canadian Market Expertise</h3>
              <p className="text-gray-600">
                Our specialized knowledge of Canadian shipping regulations, customs, and market requirements 
                helps ensure smooth distribution throughout Canada and for cross-border shipments.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-gray-50 p-8 rounded-lg shadow-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Clock className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Modern Infrastructure</h3>
              <p className="text-gray-600">
                Our facility features advanced technology and equipment to handle diverse 
                inventory types with efficiency, accuracy, and scalability for growing businesses.
              </p>
            </motion.div>
          </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Optimize Your Distribution?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Contact our team today to learn how our strategic network of facilities can help 
              you reduce shipping costs and delivery times.
            </p>
            <Button 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
              onClick={() => {
                window.location.href = '/#contact';
              }}
            >
              Request a Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Locations;