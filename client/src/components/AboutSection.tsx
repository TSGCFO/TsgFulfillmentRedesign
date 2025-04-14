import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const AboutSection: React.FC = () => {
  return (
    <section 
      id="about" 
      className="py-20 bg-accent"
      aria-labelledby="about-heading"
      itemScope
      itemType="https://schema.org/Organization"
    >
      <meta itemProp="name" content="TSG Fulfillment Services" />
      <meta itemProp="url" content="https://tsgfulfillment.com" />
      <meta itemProp="foundingDate" content="2008" />
      <meta itemProp="email" content="info@tsgfulfillment.com" />
      <meta itemProp="telephone" content="+1-832-321-3353" />
      
      <div className="container mx-auto px-6">
        <article className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <header>
              <span className="text-primary font-medium">ABOUT US</span>
              <h2 
                id="about-heading" 
                className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6"
                itemProp="slogan"
              >
                Your Trusted Logistics Partner
              </h2>
            </header>
            
            <div itemProp="description">
              <p className="text-gray-600 mb-6">
                Who is TSG? We are a mid-size fulfillment company that specializes in retail, e-commerce, and B2B fulfillment. We not only want to help companies succeed, but also grow with them.
              </p>
              <p className="text-gray-600 mb-6">
                Our team understands complex logistics processes, and we implement practical and cost-effective solutions to help you overcome your fulfillment challenges. Whether you're looking for fulfillment, reverse logistics, or warehousing services, our TSG team is ready to help with all your shipping, supply chain logistics, and warehousing challenges.
              </p>
            </div>
            
            <dl className="grid grid-cols-2 gap-6 mb-8" aria-label="Company statistics">
              <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                <dt className="sr-only">Active Clients</dt>
                <dd className="font-semibold text-lg mb-2">200+</dd>
                <meta itemProp="ratingCount" content="200" />
                <dd className="text-gray-600">Active Clients</dd>
              </div>
              <div>
                <dt className="sr-only">Years Experience</dt>
                <dd className="font-semibold text-lg mb-2">15+</dd>
                <dd className="text-gray-600">Years Experience</dd>
              </div>
              <div>
                <dt className="sr-only">Orders Fulfilled</dt>
                <dd className="font-semibold text-lg mb-2">5M+</dd>
                <dd className="text-gray-600">Orders Fulfilled</dd>
              </div>
              <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                <dt className="sr-only">Accuracy Rate</dt>
                <dd className="font-semibold text-lg mb-2">99.8%</dd>
                <meta itemProp="ratingValue" content="4.99" />
                <meta itemProp="bestRating" content="5" />
                <dd className="text-gray-600">Accuracy Rate</dd>
              </div>
            </dl>
            
            <Button 
              className="bg-primary text-white hover:bg-primary/90 px-8 py-7 font-medium text-base"
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  window.scrollTo({
                    top: element.offsetTop - 100,
                    behavior: 'smooth',
                  });
                }
              }}
              aria-label="Learn more about our story and contact us"
            >
              Our Story
            </Button>
          </motion.div>
          
          <motion.figure 
            className="lg:w-1/2 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <img 
              src="https://images.unsplash.com/photo-1581972876890-4159567fd774?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
              alt="Modern logistics warehouse with organized shelving and equipment" 
              className="rounded-lg shadow-xl w-full object-cover"
              style={{ height: "500px" }} 
              itemProp="contentUrl"
              loading="lazy"
              width="1074"
              height="500"
            />
            <meta itemProp="name" content="TSG Fulfillment Warehouse Operations" />
            <meta itemProp="description" content="Modern logistics warehouse at TSG Fulfillment Services" />
            
            <aside className="absolute bottom-6 right-6 bg-white p-6 rounded-lg shadow-lg max-w-xs">
              <h3 className="font-semibold text-lg mb-2 text-primary">Our Mission</h3>
              <p className="text-gray-600" itemProp="knowsAbout">
                To empower businesses with efficient, reliable, and scalable fulfillment solutions that enable growth and customer satisfaction.
              </p>
            </aside>
          </motion.figure>
        </article>
      </div>
    </section>
  );
};

export default AboutSection;
