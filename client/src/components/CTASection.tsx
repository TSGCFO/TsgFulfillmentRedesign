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

const CTASection: React.FC = () => {
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
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-6">
        <motion.div 
          className="bg-primary rounded-xl shadow-lg py-12 px-8 md:py-20 md:px-16 text-center max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6 leading-tight">
            Ready to Optimize Your Fulfillment Process?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Let's discuss how TSG Fulfillment can help streamline your operations and reduce costs while improving customer satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => scrollTo('contact')}
              className="btn-primary bg-white text-primary hover:bg-gray-100 px-8 py-7 font-medium text-base"
            >
              <span className="text-primary">Get a Free Quote</span>
            </Button>
            <Button 
              variant="outline" 
              className="btn-secondary bg-primary/80 text-white hover:bg-white hover:text-primary border-2 border-white px-8 py-7 font-medium text-base"
              onClick={() => scrollTo('services')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
