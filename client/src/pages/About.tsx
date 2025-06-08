import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Award, Users, MapPin, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { Separator } from '@/components/ui/separator';
import SEOManager from '@/seo/SEOManager';
import { generateBreadcrumbs, generateArticleStructuredData, generateLocalBusinessStructuredData } from '@/seo/utils';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

const About: React.FC = () => {
  // Company values
  const values = [
    {
      title: "Excellence",
      description: "We are committed to delivering exceptional service in every aspect of our operations, from logistics processes to customer service.",
      icon: <Star className="h-10 w-10 text-primary mb-4" />
    },
    {
      title: "Innovation",
      description: "We continuously seek innovative solutions to improve efficiency, reduce costs, and enhance the customer experience.",
      icon: <Award className="h-10 w-10 text-primary mb-4" />
    },
    {
      title: "Integrity",
      description: "We conduct our business with honesty, transparency, and ethical behavior in all interactions with clients and partners.",
      icon: <CheckCircle className="h-10 w-10 text-primary mb-4" />
    },
    {
      title: "Customer Focus",
      description: "We prioritize understanding and meeting our clients' needs, building lasting relationships based on trust and satisfaction.",
      icon: <Users className="h-10 w-10 text-primary mb-4" />
    }
  ];
  
  // Team members - replace with actual team information
  const teamMembers = [
    {
      name: "John Smith",
      title: "Chief Executive Officer",
      bio: "With over 20 years of experience in logistics and supply chain management, John leads our company with a focus on innovation and operational excellence.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      name: "Sarah Johnson",
      title: "Chief Operations Officer",
      bio: "Sarah brings 15 years of experience optimizing logistics operations and implementing cutting-edge technology solutions for supply chain efficiency.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80",
    },
    {
      name: "Michael Chen",
      title: "Chief Technology Officer",
      bio: "Michael leads our technology initiatives, bringing a wealth of experience in developing integrated solutions for logistics and inventory management.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      name: "Emily Rodriguez",
      title: "Director of Client Services",
      bio: "Emily ensures our clients receive exceptional support and service, with a focus on building strong relationships and understanding unique business needs.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
    }
  ];
  
  // Facility information
  const facilities = [
    {
      location: "Vaughan, Ontario",
      address: "6750 Langstaff Road, Vaughan, Ontario, L4H 5K2",
      size: "150,000+ sq ft",
      features: ["Temperature control", "High security", "24/7 operations", "Modern handling equipment", "Strategically located near GTA"],
      coordinates: { lat: 43.8013, lng: -79.5425 }
    }
  ];
  
  // Milestones in company history
  const milestones = [
    {
      year: "2015",
      title: "Company Founded",
      description: "TSG Fulfillment was established in Ontario with a vision to provide innovative logistics solutions to Canadian businesses."
    },
    {
      year: "2017",
      title: "Vaughan Facility",
      description: "Opened our state-of-the-art facility in Vaughan to serve the Greater Toronto Area with advanced fulfillment services."
    },
    {
      year: "2019",
      title: "Technology Platform Launch",
      description: "Developed and implemented our proprietary logistics management platform optimized for Canadian fulfillment needs."
    },
    {
      year: "2020",
      title: "E-commerce Specialization",
      description: "Expanded services to focus on e-commerce fulfillment during the pandemic, helping Canadian online retailers scale operations."
    },
    {
      year: "2022",
      title: "Sustainability Initiative",
      description: "Launched our eco-friendly operations program, implementing green practices throughout our Vaughan facility."
    },
    {
      year: "2023",
      title: "Technology Upgrade",
      description: "Implemented AI-driven logistics optimization and inventory management systems to enhance efficiency and accuracy."
    }
  ];

  // Define structured data for the About page
  const aboutPageData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TSG Fulfillment Services",
    "url": "https://tsgfulfillment.com",
    "logo": "https://tsgfulfillment.com/logo.png",
    "description": "TSG Fulfillment is a leading provider of logistics and fulfillment services in Canada, dedicated to helping businesses optimize their supply chain operations.",
    "foundingDate": "2015",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "6750 Langstaff Road",
      "addressLocality": "Vaughan",
      "addressRegion": "Ontario",
      "postalCode": "L4H 5K2",
      "addressCountry": "CA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-289-815-5869",
      "contactType": "customer service",
      "email": "info@tsgfulfillment.com"
    },
    "sameAs": [
      "https://www.facebook.com/tsgfulfillment",
      "https://www.linkedin.com/company/tsg-fulfillment",
      "https://twitter.com/tsgfulfillment"
    ]
  };

  return (
    <>
      <SEOManager 
        page="about"
        canonical="/about"
        ogImage="/images/about-hero.jpg"
        breadcrumbs={generateBreadcrumbs('/about')}
        preloadImages={['/images/about-hero.jpg', '/images/team-photo.jpg', '/images/facility-tour.jpg']}
        structuredData={[
          aboutPageData,
          generateArticleStructuredData(
            "About TSG Fulfillment Services",
            "Learn about TSG Fulfillment's mission, team, and commitment to providing exceptional logistics and fulfillment services across Ontario since 2015.",
            "/about",
            "2015-01-01",
            new Date().toISOString().split('T')[0]
          )
        ]}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1566232392379-afd9a0db2138?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
            alt="TSG Fulfillment warehouse operations"
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
            <span className="text-white">About Us</span>
          </div>
          
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="font-light">Story</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              TSG Fulfillment is a leading provider of logistics and fulfillment services, 
              dedicated to helping businesses of all sizes optimize their supply chains and deliver 
              exceptional customer experiences.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Company Overview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
            >
              <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">About TSG Fulfillment</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                Logistics Excellence Since <span className="text-primary">2008</span>
              </h2>
              
              <p className="text-gray-700 mb-6">
                Founded in 2008, TSG Fulfillment began with a simple mission: to provide businesses with reliable, 
                efficient logistics solutions that enable growth and customer satisfaction. What started as a small 
                operation in Houston has grown into a nationwide network of state-of-the-art fulfillment centers.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our foundation is built on understanding the unique challenges businesses face in today's 
                competitive market. We've developed our services and technology specifically to address these 
                challenges, helping our clients streamline operations, reduce costs, and improve the customer experience.
              </p>
              
              <p className="text-gray-700 mb-8">
                Today, we serve hundreds of clients across various industries, from e-commerce startups to 
                established retail brands. Our commitment to excellence, innovation, and customer satisfaction 
                has made us a trusted partner for businesses looking to optimize their fulfillment and logistics operations.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-gray-600">Years of Experience</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">200+</div>
                  <div className="text-gray-600">Active Clients</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">1</div>
                  <div className="text-gray-600">State-of-the-Art Facility</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">750K+</div>
                  <div className="text-gray-600">Orders Monthly</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1581872388288-bf2d207a7fbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80"
                  alt="TSG Fulfillment warehouse operations"
                  width={1025}
                  height={700}
                  className="rounded-lg shadow-lg w-full object-cover"
                />
                
                {/* Company mission statement badge */}
                <div className="absolute -bottom-6 -right-6 bg-white text-gray-800 p-6 rounded-lg shadow-lg max-w-xs">
                  <h3 className="font-bold text-lg mb-2">Our Mission</h3>
                  <p className="text-gray-600">
                    To empower businesses with efficient, reliable, and scalable fulfillment solutions that enable 
                    growth and customer satisfaction.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Company Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Core Values</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Principles That Guide <span className="text-primary">Our Work</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              At TSG Fulfillment, our values define who we are and how we operate. These principles guide our 
              decision-making and shape the way we interact with our clients, partners, and each other.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-lg shadow-md text-center h-full flex flex-col"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-600 flex-grow">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Leadership</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Meet The <span className="text-primary">Team</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our experienced leadership team brings decades of combined expertise in logistics, technology, 
              and customer service to drive innovation and excellence throughout our operations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-64 overflow-hidden">
                  <EnhancedImage 
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.title}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Facilities Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Facility</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Strategic <span className="text-primary">Location</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our state-of-the-art fulfillment center is strategically located in Vaughan, Ontario, 
              allowing us to provide efficient, cost-effective shipping to customers throughout Canada.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-48 bg-gray-300 flex items-center justify-center relative">
                  <MapPin className="text-primary h-12 w-12" />
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white py-2 px-4 font-bold">
                    {facility.location}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-3">{facility.address}</p>
                  <p className="text-gray-800 font-medium mb-4">Facility Size: {facility.size}</p>
                  <h4 className="font-medium mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {facility.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="text-primary h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Company Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Company <span className="text-primary">Milestones</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Since our founding in 2008, TSG Fulfillment has continuously evolved and expanded to better serve our clients' needs.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index}
                className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} mb-12 last:mb-0`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="w-32 flex-shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    {milestone.year.slice(-2)}
                  </div>
                  <div className="h-full w-1 bg-primary/20 my-2"></div>
                </div>
                <div className={`flex-grow pt-2 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                  <div className="bg-gray-50 rounded-lg p-6 shadow-sm inline-block">
                    <h3 className="text-xl font-bold mb-1">{milestone.year}</h3>
                    <h4 className="text-primary font-semibold mb-3">{milestone.title}</h4>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Contact our team today to discover how TSG Fulfillment can help optimize your logistics operations, 
              reduce costs, and improve customer satisfaction.
            </p>
            <Button 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
              onClick={() => {
                window.location.href = '/#contact';
              }}
            >
              Contact Us Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default About;