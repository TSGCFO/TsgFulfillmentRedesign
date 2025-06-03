import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Award, TrendingUp, Users } from 'lucide-react';
import { EnhancedImage } from '@/components/ui/enhanced-image';

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const AboutSection: React.FC = () => {
  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8 mb-4 text-primary" />,
      value: "200+",
      label: "Active Clients",
      description: "Trusted by leading brands"
    },
    {
      icon: <Award className="w-8 h-8 mb-4 text-primary" />,
      value: "15+",
      label: "Years Experience",
      description: "Industry expertise"
    },
    {
      icon: <Users className="w-8 h-8 mb-4 text-primary" />,
      value: "99.8%",
      label: "Accuracy Rate",
      description: "Quality assurance"
    }
  ];

  const highlights = [
    "Strategic Locations",
    "Technology-Driven Operations",
    "Dedicated Account Management",
    "Scalable Solutions",
    "Industry Expertise",
    "Quality Assurance"
  ];

  return (
    <>
      {/* About Section 1 - Why Choose Us */}
      <section 
        id="why-us" 
        className="py-24 bg-gray-50"
        aria-labelledby="why-us-heading"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <meta itemProp="name" content="TSG Fulfillment Services" />
        <meta itemProp="url" content="https://tsgfulfillment.com" />
        <meta itemProp="foundingDate" content="2008" />
        <meta itemProp="email" content="info@tsgfulfillment.com" />
        <meta itemProp="telephone" content="+1-832-321-3353" />
        
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Why Choose Us</span>
            <h2 
              id="why-us-heading" 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-6"
              itemProp="slogan"
            >
              Your <span className="text-primary">Trusted Partner</span> for Logistics Excellence
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              We combine cutting-edge technology, strategic locations, and industry expertise to deliver 
              exceptional fulfillment solutions that help your business thrive.
            </p>
          </motion.div>
          
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="bg-white p-8 rounded-lg shadow-sm text-center"
              >
                <div className="flex justify-center">
                  {stat.icon}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <div className="text-lg font-semibold text-gray-800 mb-1">{stat.label}</div>
                <p className="text-gray-600">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Content with Image */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
            >
              <EnhancedImage 
                src="https://images.unsplash.com/photo-1581972876890-4159567fd774?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                alt="Modern logistics warehouse with advanced technology and organized operations" 
                width={1074}
                height={600}
                className="rounded-lg shadow-md w-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
              itemProp="description"
            >
              <h3 className="text-2xl font-bold mb-6">Streamlining Your Supply Chain</h3>
              <p className="text-gray-600 mb-8">
                At TSG Fulfillment, we understand the complexities of modern logistics. Our team of experts 
                implements practical and cost-effective solutions to help you overcome your fulfillment challenges 
                and achieve operational excellence.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {highlights.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="text-primary h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="bg-primary text-white hover:bg-primary/90 flex items-center px-8 py-6"
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 100,
                      behavior: 'smooth',
                    });
                  }
                }}
                aria-label="Learn more about our services and contact us"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Full JSON-LD for Company Information */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "TSG Fulfillment Services",
          "url": "https://tsgfulfillment.com",
          "logo": "https://tsgfulfillment.com/logo.png",
          "foundingDate": "2008",
          "founders": [
            {
              "@type": "Person",
              "name": "TSG Founder"
            }
          ],
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
            "email": "info@tsgfulfillment.com",
            "availableLanguage": ["English"]
          },
          "sameAs": [
            "https://www.facebook.com/tsgfulfillment",
            "https://www.linkedin.com/company/tsg-fulfillment",
            "https://twitter.com/tsgfulfillment"
          ],
          "description": "TSG Fulfillment provides end-to-end logistics and fulfillment solutions for eCommerce and retail businesses. Our advanced technology and strategic locations help businesses optimize their supply chain operations."
        })}} />
      </section>
      
      {/* About Section 2 - Company Overview */}
      <section 
        id="about" 
        className="py-24 bg-white"
        aria-labelledby="about-heading"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2 order-2 lg:order-1"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
            >
              <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">About TSG Fulfillment</span>
              <h2 
                id="about-heading" 
                className="text-3xl md:text-4xl font-bold mt-2 mb-6"
              >
                Excellence in Every <span className="text-primary">Package</span>
              </h2>
              
              <p className="text-gray-600 mb-6">
                TSG Fulfillment is a mid-size fulfillment company specializing in retail, e-commerce, and B2B fulfillment. 
                We not only want to help companies succeed but also grow with them. Our customer-centric approach and 
                commitment to quality have made us a trusted partner for businesses of all sizes.
              </p>
              <p className="text-gray-600 mb-8">
                Our mission is to empower businesses with efficient, reliable, and scalable fulfillment solutions that 
                enable growth and customer satisfaction. With strategically located facilities and cutting-edge 
                technology, we deliver exceptional logistics services that help you stay ahead of the competition.
              </p>
              
              <Button 
                className="bg-primary text-white hover:bg-primary/90 flex items-center px-8 py-6"
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 100,
                      behavior: 'smooth',
                    });
                  }
                }}
                aria-label="Contact us to learn more about our company"
              >
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 order-1 lg:order-2 mb-10 lg:mb-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
            >
              <div className="relative">
                <EnhancedImage 
                  src="https://images.unsplash.com/photo-1566232392379-afd9a0db2138?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="TSG Fulfillment warehouse operations showing organized logistics processes" 
                  width={1170}
                  height={700}
                  className="rounded-lg shadow-lg w-full object-cover"
                />
                
                {/* Experience badge */}
                <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 rounded-lg shadow-lg">
                  <div className="text-3xl font-bold">15+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
