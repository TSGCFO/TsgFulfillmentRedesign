import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

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

interface TestimonialProps {
  quote: string;
  name: string;
  position: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, position }) => {
  return (
    <motion.div variants={fadeIn}>
      <Card className="bg-accent h-full">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <div className="text-primary">
              <Quote size={32} />
            </div>
          </div>
          <p className="text-gray-600 mb-6 italic">
            {quote}
          </p>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div>
              <h4 className="font-semibold">{name}</h4>
              <p className="text-sm text-gray-500">{position}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Since partnering with TSG Fulfillment, our shipping costs have decreased by 23% while our delivery times have improved. Our customers are happier, and we can focus on growing our business.",
      name: "Sarah Johnson",
      position: "CEO, Fashion Retail Co."
    },
    {
      quote: "TSG's technology integration was seamless. We now have real-time visibility into our inventory and order status, which has significantly improved our operational efficiency.",
      name: "Michael Chen",
      position: "Operations Director, Tech Gadgets Inc."
    },
    {
      quote: "During our peak season, TSG scaled operations flawlessly to handle a 300% increase in orders. Their flexibility and responsiveness have made them an invaluable partner.",
      name: "David Rodriguez",
      position: "Founder, Seasonal Gifts Co."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="text-primary font-medium">SUCCESS STORIES</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from businesses who have transformed their operations with TSG Fulfillment.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              position={testimonial.position}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
