import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div 
          className="flex flex-col md:flex-row items-center"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.div 
            className="md:w-1/2 md:pr-12 mb-10 md:mb-0"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins text-gray-900 leading-tight mb-6">
              Streamline Your <span className="text-primary">Order Fulfillment</span> Process
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Focus on growing your business while we handle your warehousing, shipping, and fulfillment needs with precision and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                className="btn-primary bg-primary text-white px-8 py-7 hover:bg-primary/90 font-medium text-base"
                onClick={() => scrollTo('contact')}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="btn-secondary border-2 border-primary text-primary hover:bg-primary/5 px-8 py-7 font-medium text-base"
                onClick={() => scrollTo('services')}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2 relative"
            variants={fadeIn}
          >
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80" 
                alt="Modern warehouse fulfillment center" 
                className="rounded-lg shadow-2xl w-full md:w-11/12 h-auto object-cover" 
                style={{ minHeight: "400px" }} 
              />
            </div>
            <motion.div 
              className="absolute -bottom-10 -right-10 bg-[#28A745] text-white p-6 rounded-lg shadow-lg max-w-xs"
              variants={fadeIn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-lg font-medium mb-2">Trusted by 200+ businesses</p>
              <p className="text-sm opacity-90">Reliable fulfillment services for eCommerce and retail businesses</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/4 h-screen bg-accent -z-10 transform translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/5 -z-10"></div>
    </section>
  );
};

export default HeroSection;
