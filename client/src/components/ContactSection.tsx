import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteForm } from '@/components/ui/quote-form';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface ContactInfoItemProps {
  icon: React.ReactNode;
  title: string;
  details: string;
}

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({ icon, title, details }) => {
  return (
    <div className="flex items-start">
      <div className="bg-primary text-white p-3 rounded-lg mr-4">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-gray-600">{details}</p>
      </div>
    </div>
  );
};

const ContactSection: React.FC = () => {
  const contactInfo = [
    {
      icon: <MapPin size={18} />,
      title: "Our Location",
      details: "13329, Lyons Avenue, Suite 18, Plano, TX, 75074"
    },
    {
      icon: <Phone size={18} />,
      title: "Phone Number",
      details: "(800) 480-2176"
    },
    {
      icon: <Mail size={18} />,
      title: "Email Address",
      details: "info@tsgfulfillment.com"
    },
    {
      icon: <Clock size={18} />,
      title: "Business Hours",
      details: "Monday - Friday: 9:00 AM - 5:00 PM CT"
    }
  ];

  const socialLinks = [
    { name: 'LinkedIn', icon: 'fab fa-linkedin-in' },
    { name: 'Twitter', icon: 'fab fa-twitter' },
    { name: 'Facebook', icon: 'fab fa-facebook-f' },
    { name: 'Instagram', icon: 'fab fa-instagram' }
  ];

  return (
    <section id="contact" className="py-20 bg-accent relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row">
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="text-primary font-medium">GET IN TOUCH</span>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-10">
              Want to learn more about our fulfillment services? Fill out the form, and one of our logistics experts will contact you promptly. We're here to answer your questions and find practical, cost-effective solutions for your fulfillment challenges.
            </p>
            
            <div className="space-y-6 mb-10">
              {contactInfo.map((item, index) => (
                <ContactInfoItem 
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  details={item.details}
                />
              ))}
            </div>
            
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="bg-white text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 shadow-md"
                  aria-label={link.name}
                >
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold font-poppins mb-6">Get a Free Quote</h3>
                <QuoteForm />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
