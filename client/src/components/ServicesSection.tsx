import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Warehouse, Truck, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import { OptimizedImage } from '@/components/ui/optimized-image';

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
  image: string;
  slug: string;
  backgroundColor: string;
  index: number;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ 
  icon, 
  title, 
  description, 
  image, 
  slug, 
  backgroundColor,
  index
}) => {
  const [, navigate] = useLocation();
  
  const handleLearnMore = () => {
    navigate(`/services/${slug}`);
  };

  return (
    <motion.article 
      variants={fadeIn} 
      className="service-card h-full relative group overflow-hidden"
      itemScope
      itemType="https://schema.org/Service"
    >
      <meta itemProp="serviceType" content={title} />
      <meta itemProp="provider" content="TSG Fulfillment Services" />
      <meta itemProp="url" content={`https://tsgfulfillment.com/services/${slug}`} />
      
      <div 
        className={`h-full transition-all duration-500 relative ${backgroundColor} group-hover:shadow-xl p-8 sm:p-10`}
      >
        {/* Background image with overlay - visible on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <OptimizedImage
            src={image}
            alt={title}
            width={600}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10">
          {/* Service Number */}
          <span className="inline-block text-2xl sm:text-3xl font-bold opacity-10 mb-4">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          
          {/* Service Icon */}
          <div className="mb-5" aria-hidden="true">
            {icon}
          </div>
          
          {/* Service Title */}
          <h3 
            className="text-xl font-bold mb-4 text-white"
            itemProp="name"
          >
            {title}
          </h3>
          
          {/* Service Description */}
          <div 
            className="text-white/80 mb-6 transition-all duration-300 h-[80px] overflow-hidden"
            itemProp="description"
          >
            <p>
              {description}
            </p>
          </div>
          
          {/* Learn More Button */}
          <Button 
            variant="outline" 
            onClick={handleLearnMore}
            className="border-white text-white hover:bg-white hover:text-primary transition-all duration-300 group-hover:translate-y-0 flex items-center"
            aria-label={`Learn more about ${title}`}
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <Warehouse className="text-white w-12 h-12" />,
      title: "Warehousing",
      description: "Strategic warehouse facilities optimized for efficient storage and inventory management with climate control and security monitoring.",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80",
      slug: "warehousing",
      backgroundColor: "bg-primary"
    },
    {
      icon: <Package className="text-white w-12 h-12" />,
      title: "Fulfillment",
      description: "End-to-end order fulfillment services including receiving, storage, pick & pack, and shipping with real-time tracking and reporting.",
      image: "https://images.unsplash.com/photo-1586528116493-ce31b741fdd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      slug: "fulfillment",
      backgroundColor: "bg-[#0C71C3]"
    },
    {
      icon: <Truck className="text-white w-12 h-12" />,
      title: "Transportation",
      description: "Comprehensive transportation and logistics solutions with optimized routing and carrier selection for timely delivery and cost efficiency.",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      slug: "transportation",
      backgroundColor: "bg-[#1976D2]"
    },
    {
      icon: <Clock className="text-white w-12 h-12" />,
      title: "Value Added Services",
      description: "Custom kitting, assembly, packaging, labeling, and quality control services tailored to your specific business requirements.",
      image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      slug: "value-added-services",
      backgroundColor: "bg-[#2196F3]"
    }
  ];

  return (
    <section 
      id="services" 
      className="py-24 bg-white"
      aria-labelledby="services-heading"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <meta itemProp="itemListOrder" content="Unordered" />
      <meta itemProp="numberOfItems" content={services.length.toString()} />
      <meta itemProp="name" content="TSG Fulfillment Services" />
      
      <div className="container mx-auto px-6">
        <motion.header 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Services</span>
          <h2 
            id="services-heading" 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-6"
            itemProp="description"
          >
            Comprehensive <span className="text-primary">Logistics Solutions</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            We provide end-to-end supply chain services tailored to meet your business needs, 
            from storage to shipping and everything in between.
          </p>
        </motion.header>
        
        <motion.div 
          role="list"
          aria-label="Logistics and fulfillment services"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {services.map((service, index) => (
            <div 
              key={index} 
              role="listitem" 
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
              className="h-full"
            >
              <meta itemProp="position" content={(index + 1).toString()} />
              <ServiceItem 
                icon={service.icon}
                title={service.title}
                description={service.description}
                image={service.image}
                slug={service.slug}
                backgroundColor={service.backgroundColor}
                index={index}
              />
            </div>
          ))}
        </motion.div>
        
        {/* Full JSON-LD for Services */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": services.map((service, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Service",
              "name": service.title,
              "description": service.description,
              "provider": {
                "@type": "Organization",
                "name": "TSG Fulfillment Services"
              },
              "url": `https://tsgfulfillment.com/services/${service.slug}`,
              "image": service.image
            }
          }))
        })}} />
      </div>
    </section>
  );
};

export default ServicesSection;
