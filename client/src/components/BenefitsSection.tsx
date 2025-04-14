import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Maximize, Headphones, Laptop, Activity } from 'lucide-react';

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

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => {
  return (
    <motion.div variants={fadeIn}>
      <div className="flex items-start mb-4">
        <div className="bg-primary/10 p-3 rounded-lg mr-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold font-poppins">{title}</h3>
      </div>
      <p className="text-gray-600 pl-14">
        {description}
      </p>
    </motion.div>
  );
};

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <DollarSign className="text-primary" />,
      title: "Lower Shipping Costs",
      description: "Leverage our volume discounts with major carriers to reduce your shipping costs significantly."
    },
    {
      icon: <TrendingUp className="text-primary" />,
      title: "Reduced Operating Costs",
      description: "Eliminate the need for warehouse space, staff, and equipment with our all-inclusive fulfillment services."
    },
    {
      icon: <Maximize className="text-primary" />,
      title: "Extend Your Reach",
      description: "Our strategically located facilities help you reach customers faster with shorter transit times."
    },
    {
      icon: <Headphones className="text-primary" />,
      title: "Improved Customer Service",
      description: "Provide faster shipping, accurate order fulfillment, and easy returns to enhance customer satisfaction."
    },
    {
      icon: <Laptop className="text-primary" />,
      title: "Advanced Technology",
      description: "Our integrated systems provide real-time inventory visibility and seamless order management."
    },
    {
      icon: <Activity className="text-primary" />,
      title: "Scale With Ease",
      description: "Our flexible solutions grow with your business, accommodating seasonal peaks and rapid expansion."
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/5 -z-10"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#28A745]/5 -z-10"></div>
      
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="text-primary font-medium">WHY CHOOSE US</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">The Benefits of TSG Fulfillment</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Partnering with TSG Fulfillment gives your business a competitive edge in today's fast-paced market.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {benefits.map((benefit, index) => (
            <BenefitItem 
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
