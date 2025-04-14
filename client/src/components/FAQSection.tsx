import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How quickly can you start fulfilling my orders?",
      answer: "Once we receive your inventory, we can typically begin fulfilling orders within 1-3 business days. The exact timeline depends on the complexity of your products, special requirements, and current volume. We'll provide a specific timeline during our onboarding process."
    },
    {
      question: "How do you integrate with my eCommerce platform?",
      answer: "We integrate seamlessly with most major eCommerce platforms including Shopify, WooCommerce, Magento, BigCommerce, and Amazon. Our API also allows for custom integrations with proprietary systems. During onboarding, our tech team will work with you to ensure a smooth connection."
    },
    {
      question: "What are your shipping times and rates?",
      answer: "We offer a variety of shipping options from economy to express, both domestic and international. Shipping times typically range from 1-7 business days depending on the destination and service level. Our rates are highly competitive thanks to our volume discounts with major carriers. We can provide a detailed quote based on your specific shipping needs."
    },
    {
      question: "How do you handle returns?",
      answer: "Our reverse logistics process is designed to be efficient and cost-effective. We can receive returns, inspect items for damage, restock eligible items, and process refunds or exchanges according to your policies. We provide detailed reporting on all returns, giving you visibility into return reasons and trends."
    },
    {
      question: "Do you offer custom packaging options?",
      answer: "Yes, we offer a wide range of custom packaging solutions. From branded boxes and poly mailers to custom inserts and gift wrapping, we can help enhance your customer's unboxing experience. Our team can work with you to design packaging that reflects your brand identity while remaining cost-effective."
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
          <span className="text-primary font-medium">COMMON QUESTIONS</span>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our fulfillment services.
          </p>
        </motion.div>
        
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={fadeIn}>
                <AccordionItem value={`item-${index}`} className="mb-4 border-none">
                  <AccordionTrigger className="bg-accent rounded-lg px-6 py-4 text-left hover:bg-gray-200 transition-colors duration-300 text-lg font-semibold font-poppins">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="bg-white px-6 py-4 rounded-b-lg shadow-inner text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
