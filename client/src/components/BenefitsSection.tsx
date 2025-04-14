import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, Clock, Truck, Users, BarChart3, Globe } from 'lucide-react';

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
    <motion.div variants={fadeIn} className="benefit-card">
      <Card className="h-full border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="mr-4 text-primary">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold font-poppins mb-2">{title}</h3>
              <p className="text-gray-600">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Lower Shipping Cost",
      description: "Benefit from our volume discounts with major carriers and optimized shipping routes to reduce your overall shipping expenses."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Reduced Operating Cost",
      description: "Eliminate the need for warehouse space, staff, and equipment by outsourcing your fulfillment operations to us."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Extending Your Reach",
      description: "Easily expand into new markets with our strategically located warehouses and international shipping capabilities."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Improved Customer Service",
      description: "Enhance customer satisfaction with faster deliveries, accurate order fulfillment, and professional packaging."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Efficiency",
      description: "Focus on growing your business while we handle the time-consuming tasks of storing, packing, and shipping your products."
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Harnessing Technology",
      description: "Leverage our advanced inventory management systems and real-time tracking to optimize your supply chain."
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="text-primary font-medium">BENEFITS</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">Why Choose TSG Fulfillment</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Here at TSG, we want to help smooth out the process and make sure that you can focus on what matters: 
            the customer and your product. Promote, market, sell! Leave the heavy lifting to us.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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