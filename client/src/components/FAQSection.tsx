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
      question: "What is order fulfillment?",
      answer: "Order fulfillment is the complete process from receiving and storing your inventory to processing orders, picking, packing, and shipping products directly to your customers. We handle the entire fulfillment process for you, allowing you to focus on growing your business."
    },
    {
      question: "How can TSG Fulfillment help my business?",
      answer: "TSG Fulfillment can help your business by providing professional warehousing, inventory management, kitting, hand assembly, and shipping services. We help you reduce operating costs, improve shipping efficiency, extend your market reach, enhance customer service, and leverage modern logistics technology."
    },
    {
      question: "What are your shipping times and rates?",
      answer: "We offer a variety of shipping options tailored to your business needs. By partnering with us, you can benefit from our volume discounts with major carriers. Shipping times vary depending on destination and service level chosen. We'll provide detailed shipping options and rates based on your specific requirements during consultation."
    },
    {
      question: "How do you handle returns?",
      answer: "Our reverse logistics process is designed to be efficient and cost-effective. We receive returns, inspect items, process them according to your specifications, and restock or dispose of items as needed. This comprehensive returns management system helps reduce waste and improve customer satisfaction."
    },
    {
      question: "What types of businesses do you work with?",
      answer: "We work with a wide range of businesses including eCommerce retailers, brick-and-mortar stores expanding online, direct-to-consumer brands, and businesses in the healthcare and pharmaceutical industries. Our mid-size company structure allows us to provide personalized service while handling significant order volumes."
    },
    {
      question: "Do you offer inventory management services?",
      answer: "Yes, we provide comprehensive inventory management services including real-time tracking, automated reordering, and detailed reporting. Our system helps you maintain optimal stock levels, prevent stockouts or overstock situations, and gain valuable insights into your inventory performance."
    }
  ];

  return (
    <section 
      id="faq"
      className="py-20 bg-white"
      aria-labelledby="faq-heading"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="container mx-auto px-6">
        <motion.header 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="text-primary font-medium">COMMON QUESTIONS</span>
          <h2 
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our fulfillment services.
          </p>
        </motion.header>
        
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          role="group"
          aria-label="Frequently Asked Questions"
        >
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                variants={fadeIn}
                itemScope
                itemType="https://schema.org/Question"
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="mb-4 border-none"
                >
                  <AccordionTrigger 
                    className="bg-accent rounded-lg px-6 py-4 text-left hover:bg-gray-200 transition-colors duration-300 text-lg font-semibold font-poppins"
                    itemProp="name"
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent 
                    className="bg-white px-6 py-4 rounded-b-lg shadow-inner text-gray-600"
                    itemScope
                    itemType="https://schema.org/Answer"
                    itemProp="acceptedAnswer"
                  >
                    <div itemProp="text">
                      {faq.answer}
                    </div>
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
