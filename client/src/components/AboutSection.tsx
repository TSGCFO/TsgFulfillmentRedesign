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
    <section id="about" className="py-20 bg-accent">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="text-primary font-medium">ABOUT US</span>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">Your Trusted Logistics Partner</h2>
            <p className="text-gray-600 mb-6">
              TSG Fulfillment Services has been providing exceptional logistics and fulfillment solutions since 2005. With a focus on technology, efficiency, and customer satisfaction, we've helped hundreds of businesses streamline their operations and grow.
            </p>
            <p className="text-gray-600 mb-6">
              Our team of logistics experts brings decades of combined experience to every client relationship. We understand the unique challenges of modern commerce and work tirelessly to create customized solutions that address your specific needs.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-lg mb-2">200+</h4>
                <p className="text-gray-600">Active Clients</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">15+</h4>
                <p className="text-gray-600">Years Experience</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">5M+</h4>
                <p className="text-gray-600">Orders Fulfilled</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">99.8%</h4>
                <p className="text-gray-600">Accuracy Rate</p>
              </div>
            </div>
            <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-7 font-medium text-base">
              Our Story
            </Button>
          </motion.div>
          <motion.div 
            className="lg:w-1/2 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1581972876890-4159567fd774?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
              alt="Modern logistics warehouse" 
              className="rounded-lg shadow-xl w-full object-cover"
              style={{ height: "500px" }} 
            />
            
            <div className="absolute bottom-6 right-6 bg-white p-6 rounded-lg shadow-lg max-w-xs">
              <h4 className="font-semibold text-lg mb-2 text-primary">Our Mission</h4>
              <p className="text-gray-600">
                To empower businesses with efficient, reliable, and scalable fulfillment solutions that enable growth and customer satisfaction.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
