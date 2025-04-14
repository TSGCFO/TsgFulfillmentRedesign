import React from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const ClientLogos: React.FC = () => {
  // Mock company names - in a real application these would come from an API or CMS
  const companies = [
    'COMPANY A',
    'COMPANY B',
    'COMPANY C',
    'COMPANY D',
    'COMPANY E',
    'COMPANY F'
  ];

  return (
    <section className="py-12 bg-accent">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <p className="text-gray-500 font-medium mb-1">TRUSTED BY LEADING BRANDS</p>
          <div className="w-20 h-1 bg-primary mx-auto mt-2"></div>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {companies.map((company, index) => (
            <motion.div 
              key={index}
              className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-gray-400 font-bold text-xl">{company}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
