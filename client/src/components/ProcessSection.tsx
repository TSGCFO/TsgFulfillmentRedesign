import React from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/optimized-image';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  isReversed?: boolean;
  delay?: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ 
  number, 
  title, 
  description, 
  imageSrc, 
  imageAlt,
  isReversed = false,
  delay = 0
}) => {
  return (
    <motion.div 
      className="flex flex-col md:flex-row items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
      transition={{ delay }}
    >
      <div className={`md:w-1/2 md:pr-12 ${isReversed ? 'md:text-left order-2 md:order-3' : 'md:text-right order-2 md:order-1'}`}>
        {!isReversed ? (
          <>
            <h3 className="text-2xl font-semibold font-poppins mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">
              {description}
            </p>
          </>
        ) : (
          <OptimizedImage 
            src={imageSrc}
            width={800}
            height={600}
            className="rounded-lg shadow-lg w-full h-auto object-cover" 
            alt={imageAlt}
            priority={number === 1}
            loading={number === 1 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
      <div className="flex items-center justify-center md:w-24 md:mx-auto my-6 md:my-0 order-1 md:order-2 z-10">
        <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
          {number}
        </div>
      </div>
      <div className={`md:w-1/2 ${isReversed ? 'md:pr-12 md:text-right order-3 md:order-1' : 'md:pl-12 order-3'}`}>
        {isReversed ? (
          <>
            <h3 className="text-2xl font-semibold font-poppins mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">
              {description}
            </p>
          </>
        ) : (
          <OptimizedImage 
            src={imageSrc}
            width={800}
            height={600}
            className="rounded-lg shadow-lg w-full h-auto object-cover" 
            alt={imageAlt}
            priority={number === 1}
            loading={number === 1 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
    </motion.div>
  );
};

const ProcessSection: React.FC = () => {
  const processSteps = [
    {
      number: 1,
      title: "Receiving & Inbound Solutions",
      description: "We receive your inventory at our fulfillment center, performing detailed quality inspection to ensure everything is accounted for and in excellent condition. Our team meticulously documents and catalogs each item for accurate inventory tracking.",
      imageSrc: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80",
      imageAlt: "Receiving inventory at TSG Fulfillment",
      isReversed: false
    },
    {
      number: 2,
      title: "Warehousing & Inventory Management",
      description: "Your products are stored in our secure, climate-controlled facilities with advanced inventory management systems. We monitor stock levels in real-time, providing accurate reporting and ensuring efficient space utilization to keep your storage costs optimized.",
      imageSrc: "https://images.unsplash.com/photo-1507308820779-5b6fa128020c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "TSG Warehouse storage systems",
      isReversed: true
    },
    {
      number: 3,
      title: "Order Processing & Kitting",
      description: "When orders arrive, our integrated system processes them automatically with precision. Our expert team handles picking, kitting, and packing with attention to detail. We can assemble multi-component orders and create custom product bundles according to your specifications.",
      imageSrc: "https://images.unsplash.com/photo-1586528116493-da8c594c2ded?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "TSG Order processing system",
      isReversed: false
    },
    {
      number: 4,
      title: "Shipping & Freight Solutions",
      description: "We leverage our relationships with major carriers to optimize your shipping costs and transit times. Our team selects the most appropriate shipping method based on package size, destination, and delivery timeline requirements, ensuring your customers receive their orders promptly.",
      imageSrc: "https://images.unsplash.com/photo-1568910748155-01ca989dbdd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "TSG Shipping and freight solutions",
      isReversed: true
    },
    {
      number: 5,
      title: "Reverse Logistics",
      description: "Our comprehensive returns management system handles the entire returns process efficiently. We receive returns, inspect items, process them according to your specifications, and either restock them or dispose of them appropriately, reducing waste and improving customer satisfaction.",
      imageSrc: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      imageAlt: "TSG Returns management process",
      isReversed: false
    }
  ];

  return (
    <section className="py-20 bg-accent">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="text-primary font-medium">HOW IT WORKS</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">Our Fulfillment Process</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our streamlined logistics process is designed to increase efficiency, reduce costs, and help your business grow. 
            From receiving your inventory to managing returns, we handle every step with precision and care.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Process timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-primary/20 transform -translate-x-1/2 z-0"></div>
          
          <div className="flex flex-col space-y-12 relative z-10">
            {processSteps.map((step, index) => (
              <ProcessStep 
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                imageSrc={step.imageSrc}
                imageAlt={step.imageAlt}
                isReversed={step.isReversed}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
