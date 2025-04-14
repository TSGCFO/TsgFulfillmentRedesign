import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Box, Warehouse, Truck, Package, RotateCcw, Stethoscope } from 'lucide-react';
import { useLocation } from 'wouter';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
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

interface ServiceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  slug: string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ icon, title, description, slug }) => {
  const [, navigate] = useLocation();
  
  const handleLearnMore = () => {
    navigate(`/services/${slug}`);
  };

  return (
    <motion.div variants={fadeIn} className="service-card">
      <Card className="h-full transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-primary/20">
        <CardContent className="p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
            {icon}
          </div>
          <h3 className="text-xl font-semibold font-poppins mb-3">{title}</h3>
          <p className="text-gray-600 mb-4">
            {description}
          </p>
          <Button 
            variant="link" 
            onClick={handleLearnMore}
            className="text-primary font-medium p-0 h-auto flex items-center group"
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <Box className="text-primary text-2xl" />,
      title: "Order Fulfillment",
      description: "We handle the entire fulfillment process from receiving and storing your inventory to processing orders, picking, packing, and shipping products directly to your customers.",
      slug: "order-fulfillment"
    },
    {
      icon: <Warehouse className="text-primary text-2xl" />,
      title: "Warehousing Services",
      description: "Our climate-controlled warehousing facilities offer secure storage solutions with advanced inventory management systems to help you consolidate your supply chains.",
      slug: "warehousing-services"
    },
    {
      icon: <Package className="text-primary text-2xl" />,
      title: "Kitting Services",
      description: "We combine multiple components or products into a single package or kit, making it easier to manage inventory and fulfill orders for product bundles or special promotions.",
      slug: "kitting-services"
    },
    {
      icon: <Package className="text-primary text-2xl" />,
      title: "Hand Assembly",
      description: "Our hand assembly services include sorting, inserting, and collating items with meticulous attention to detail for your specialized packaging needs.",
      slug: "hand-assembly"
    },
    {
      icon: <RotateCcw className="text-primary text-2xl" />,
      title: "Reverse Logistics",
      description: "Our comprehensive returns management system handles product returns, exchanges, and repairs efficiently and cost-effectively, reducing waste and improving customer satisfaction.",
      slug: "reverse-logistics"
    },
    {
      icon: <Box className="text-primary text-2xl" />,
      title: "Inventory Management",
      description: "We provide real-time inventory tracking, automated reordering, and detailed reporting to help you maintain optimal stock levels and prevent stockouts or overstock situations.",
      slug: "inventory-management"
    },
    {
      icon: <Truck className="text-primary text-2xl" />,
      title: "Freight Forwarding",
      description: "We organize and manage the shipment of your goods across international borders, ensuring compliance with regulations and optimizing transportation costs.",
      slug: "freight-forwarding"
    },
    {
      icon: <Stethoscope className="text-primary text-2xl" />,
      title: "Healthcare Marketing Services",
      description: "Specialized fulfillment services for pharmaceutical and natural health industries with full compliance to regulatory requirements and quality standards.",
      slug: "healthcare-services"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="text-primary font-medium">OUR SERVICES</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">Comprehensive Fulfillment Solutions</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            From warehousing to shipping, we provide end-to-end logistics solutions 
            tailored to meet your specific business needs.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {services.map((service, index) => (
            <ServiceItem 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              slug={service.slug}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
