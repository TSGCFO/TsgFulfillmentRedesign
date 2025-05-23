import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ArrowRight, ChevronDown } from 'lucide-react';

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

// Images for slider
const heroImages = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80",
  "https://images.unsplash.com/photo-1586528116493-ce31b741fdd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
];

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
      className="relative h-[80vh] md:h-[90vh] max-h-[900px] min-h-[600px] overflow-hidden bg-primary"
      aria-labelledby="hero-heading"
      itemScope 
      itemType="https://schema.org/WebPageElement"
    >
      <meta itemProp="name" content="Hero Section" />
      <meta itemProp="description" content="Logistics and fulfillment services overview from TSG Fulfillment Services" />
      
      {/* Hero background image with overlay */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroImages[0]}
          alt="Modern logistics and fulfillment center" 
          className="w-full h-full object-cover" 
          width={1920}
          height={1080}
          quality={90}
          loading="eager"
          priority={true}
        />
        <div className="absolute inset-0 bg-primary/70"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
        <motion.div
          className="max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.span
            className="inline-block mb-4 text-white/90 font-medium tracking-wider text-lg"
            variants={fadeIn}
          >
            LOGISTICS & FULFILLMENT SOLUTIONS
          </motion.span>
          
          <motion.h1 
            id="hero-heading" 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            itemProp="headline"
            variants={fadeIn}
          >
            Elevating Your <span className="text-white font-extrabold">E-Commerce Experience</span> Through Strategic Fulfillment
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-3xl"
            itemProp="text"
            variants={fadeIn}
          >
            TSG Fulfillment provides end-to-end supply chain solutions designed to streamline your operations and enhance customer satisfaction. With strategically located facilities and cutting-edge technology, we deliver exceptional logistics services to businesses of all sizes.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
            variants={fadeIn}
            aria-label="Hero navigation"
          >
            <Button 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
              onClick={() => scrollTo('contact')}
              aria-label="Request a quote for our services"
            >
              <span className="text-primary">Request a Quote</span>
              <ArrowRight className="ml-2 h-4 w-4 text-primary" />
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white bg-primary/80 text-white hover:bg-white hover:text-primary font-semibold text-base px-8 py-6 transition-all"
              onClick={() => scrollTo('services')}
              aria-label="Learn more about our services"
            >
              Explore Our Services
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll down indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
        <motion.button
          className="flex flex-col items-center cursor-pointer bg-primary/50 px-4 py-2 rounded-full"
          onClick={() => scrollTo('services')}
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 1, duration: 0.6 }
          }}
        >
          <span className="text-sm mb-2 text-white">Scroll Down</span>
          <motion.div
            animate={{
              y: [0, 8, 0],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <ChevronDown className="h-6 w-6 text-white" />
          </motion.div>
        </motion.button>
      </div>
      
      {/* Overlay pattern */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/30 z-[1]" 
        aria-hidden="true"
      ></div>
    </section>
  );
};

export default HeroSection;
