import React from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ArrowRight } from 'lucide-react';
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

interface IndustryCardProps {
  title: string;
  description: string;
  image: string;
  slug: string;
}

const IndustryCard: React.FC<IndustryCardProps> = ({ title, description, image, slug }) => {
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/industries/${slug}`);
  };

  return (
    <motion.div 
      variants={fadeIn}
      className="group cursor-pointer"
      onClick={handleClick}
      itemScope
      itemType="https://schema.org/Service"
    >
      <meta itemProp="serviceType" content={`${title} Logistics Services`} />
      <meta itemProp="provider" content="TSG Fulfillment Services" />
      
      <div className="relative overflow-hidden rounded-lg shadow-md h-[280px]">
        <OptimizedImage 
          src={image}
          alt={`${title} logistics and fulfillment services`}
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6 text-white">
          <h3 className="text-xl font-bold mb-2" itemProp="name">{title}</h3>
          <p className="text-white/80 text-sm mb-4 line-clamp-2" itemProp="description">{description}</p>
          
          <div className="flex items-center text-sm font-medium transition-all opacity-70 group-hover:opacity-100">
            <span>Learn More</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const IndustriesSection: React.FC = () => {
  const industries = [
    {
      title: "E-Commerce",
      description: "Streamline your online retail operations with our end-to-end fulfillment solutions designed specifically for e-commerce businesses of all sizes.",
      image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      slug: "ecommerce"
    },
    {
      title: "Retail & CPG",
      description: "Our retail and consumer packaged goods logistics solutions help you manage inventory, streamline distribution, and meet evolving consumer demands.",
      image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
      slug: "retail-cpg"
    },
    {
      title: "Health & Beauty",
      description: "Specialized handling, storage, and fulfillment services for health, beauty, and personal care products with full regulatory compliance.",
      image: "https://images.unsplash.com/photo-1614859638024-82f09fca5668?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      slug: "health-beauty"
    },
    {
      title: "Technology",
      description: "Secure warehousing and efficient distribution for high-value electronics and technology products with specialized handling procedures.",
      image: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      slug: "technology"
    },
    {
      title: "Food & Beverage",
      description: "Temperature-controlled storage and specialized handling for food and beverage products with strict adherence to safety regulations.",
      image: "https://images.unsplash.com/photo-1576807444883-ab5e3a3cf241?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      slug: "food-beverage"
    },
    {
      title: "Subscription Boxes",
      description: "Custom kitting, assembly, and recurring shipment management for subscription box businesses with flexible scaling options.",
      image: "https://images.unsplash.com/photo-1608634950167-6c6c8412ba4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      slug: "subscription-boxes"
    }
  ];

  return (
    <section 
      id="industries" 
      className="py-24 bg-gray-50"
      aria-labelledby="industries-heading"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <meta itemProp="itemListOrder" content="Unordered" />
      <meta itemProp="numberOfItems" content={industries.length.toString()} />
      <meta itemProp="name" content="TSG Fulfillment Industries Served" />
      
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Industries We Serve</span>
          <h2 
            id="industries-heading" 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-6"
            itemProp="description"
          >
            Specialized Solutions for <span className="text-primary">Every Industry</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            We provide customized fulfillment and logistics services tailored to the unique requirements 
            of various industries, ensuring optimal performance for your supply chain.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          role="list"
          aria-label="Industries served by TSG Fulfillment"
        >
          {industries.map((industry, index) => (
            <div 
              key={index}
              role="listitem"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={(index + 1).toString()} />
              <IndustryCard
                title={industry.title}
                description={industry.description}
                image={industry.image}
                slug={industry.slug}
              />
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Structured data for industries */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": industries.map((industry, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Service",
            "name": `${industry.title} Logistics Services`,
            "description": industry.description,
            "provider": {
              "@type": "Organization",
              "name": "TSG Fulfillment Services"
            },
            "url": `https://tsgfulfillment.com/industries/${industry.slug}`,
            "image": industry.image
          }
        }))
      })}} />
    </section>
  );
};

export default IndustriesSection;