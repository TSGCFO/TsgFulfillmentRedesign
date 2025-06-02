import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedImage } from '@/components/ui/enhanced-image';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

// Define client logos with their images and names
const clientLogos = [
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    name: 'Walmart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
  },
  {
    name: 'Target',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg',
  },
  {
    name: 'Shopify',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
  },
  {
    name: 'Costco',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Costco_Wholesale_logo_2010-10-26.svg',
  }
];

const ClientLogos: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Trusted Partners & Integrations</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Powering Supply Chains for <span className="text-primary">Market Leaders</span></h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Our enterprise-grade logistics solutions serve leading brands across various industries.
          </p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {clientLogos.map((client, index) => (
            <motion.div 
              key={index}
              className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-500 transform hover:scale-110"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-16 md:h-20 w-32 md:w-40 flex items-center justify-center">
                <img 
                  src={client.logo} 
                  alt={`${client.name} logo - TSG Fulfillment client`} 
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
                <span className="sr-only">{client.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <p className="text-gray-500 italic">
            *These are representative logos. Our client list includes companies across retail, e-commerce, healthcare, and technology sectors.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogos;
