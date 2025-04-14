import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';

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
    <section 
      className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden" 
      aria-labelledby="hero-heading" 
      itemScope 
      itemType="https://schema.org/WebPageElement"
    >
      <meta itemProp="name" content="Hero Section" />
      <meta itemProp="description" content="Logistics and fulfillment services overview from TSG Fulfillment Services" />
      
      <div className="container mx-auto px-6">
        <motion.article 
          className="flex flex-col md:flex-row items-center"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.header 
            className="md:w-1/2 md:pr-12 mb-10 md:mb-0"
            variants={fadeIn}
          >
            <h1 
              id="hero-heading" 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins text-gray-900 leading-tight mb-6"
              itemProp="headline"
            >
              What An <span className="text-primary">Order Fulfillment Centre</span> Can Do For You
            </h1>
            <p 
              className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed"
              itemProp="text"
            >
              Inventory gone missing? Slow shipping times? Back-logged orders? Order fulfillment is the bread and butter for any organization, be they eCommerce or brick-and-mortar companies. With the marketplace advancing and the way we communicate evolving, how you respond to your customer's needs and requests from the point of sale becomes that much more crucial.
            </p>
            <nav className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4" aria-label="Hero navigation">
              <Button 
                className="btn-primary bg-primary text-white px-8 py-7 hover:bg-primary/90 font-medium text-base"
                onClick={() => scrollTo('contact')}
                aria-label="Contact us to get started"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="btn-secondary border-2 border-primary text-primary hover:bg-primary/5 px-8 py-7 font-medium text-base"
                onClick={() => scrollTo('services')}
                aria-label="Learn more about our services"
              >
                Learn More
              </Button>
            </nav>
          </motion.header>
          
          <motion.figure 
            className="md:w-1/2 relative"
            variants={fadeIn}
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <div className="relative z-10">
              <OptimizedImage 
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80" 
                alt="Modern warehouse fulfillment center with organized shelving and logistics operations" 
                className="rounded-lg shadow-2xl w-full md:w-11/12 h-auto" 
                width={1035}
                height={600}
                itemProp="contentUrl"
                loading="eager"
                priority={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
                objectFit="cover"
                style={{ minHeight: "400px" }}
              />
              <meta itemProp="name" content="TSG Fulfillment Warehouse Operations" />
              <meta itemProp="description" content="Modern warehouse with fulfillment operations at TSG Fulfillment Services" />
            </div>
            
            <motion.aside 
              className="absolute -bottom-10 -right-10 bg-[#28A745] text-white p-6 rounded-lg shadow-lg max-w-xs z-10"
              variants={fadeIn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              aria-label="Benefits overview"
            >
              <h2 className="text-lg font-medium mb-2">Benefits of Our Services</h2>
              <ul className="list-none text-sm opacity-90">
                <li>Lower Shipping Cost</li>
                <li>Reduced Operating Cost</li>
                <li>Extending your Reach</li>
                <li>Improved Customer Service</li>
                <li>Harnessing Technology</li>
              </ul>
            </motion.aside>
          </motion.figure>
        </motion.article>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/4 h-screen bg-accent -z-10 transform translate-x-1/2" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/5 -z-10" aria-hidden="true"></div>
    </section>
  );
};

export default HeroSection;
