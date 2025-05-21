import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mail, Phone, MapPin, FileText, ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string[];
  link?: string;
}

const Contact: React.FC = () => {
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    interestType: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prevState => ({
      ...prevState,
      interestType: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the data to your server
    console.log('Form submitted:', formData);
    
    // Show success message
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you shortly.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
      interestType: ''
    });
  };
  
  // Contact information
  const contactInfo: ContactInfo[] = [
    {
      icon: <Phone className="h-10 w-10 text-primary" />,
      title: "Phone",
      details: ["(289) 815-5869", "Mon-Fri, 8am-5pm EST"],
      link: "tel:2898155869"
    },
    {
      icon: <Mail className="h-10 w-10 text-primary" />,
      title: "Email",
      details: ["info@tsgfulfillment.com", "support@tsgfulfillment.com"],
      link: "mailto:info@tsgfulfillment.com"
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: "Main Office",
      details: ["123 Logistics Way", "Houston, TX 77001"],
      link: "https://maps.google.com/?q=123+Logistics+Way+Houston+TX+77001"
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Sales Inquiries",
      details: ["sales@tsgfulfillment.com", "Request a custom quote"],
      link: "mailto:sales@tsgfulfillment.com"
    }
  ];
  
  // Service interest options
  const serviceOptions = [
    { value: "warehousing", label: "Warehousing" },
    { value: "fulfillment", label: "Fulfillment" },
    { value: "transportation", label: "Transportation" },
    { value: "value-added", label: "Value Added Services" },
    { value: "multiple", label: "Multiple Services" },
    { value: "other", label: "Other" }
  ];

  return (
    <>
      <Helmet>
        <title>Contact TSG Fulfillment | Logistics & Fulfillment Services in Vaughan, Ontario</title>
        <meta name="description" content="Contact TSG Fulfillment for information about our logistics and fulfillment services in Vaughan, Ontario. Request a quote, ask questions, or get support from our expert team." />
        <meta name="keywords" content="contact fulfillment services, logistics company contact, warehousing contact, supply chain solutions, vaughan ontario fulfillment, contact tsg" />
        <meta property="og:title" content="Contact TSG Fulfillment | Logistics & Fulfillment Services in Vaughan" />
        <meta property="og:description" content="Contact TSG Fulfillment for information about our logistics and fulfillment services in Vaughan, Ontario. Request a quote, ask questions, or get support from our expert team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tsgfulfillment.com/contact" />
        <meta property="og:image" content="https://tsgfulfillment.com/images/contact-hero.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact TSG Fulfillment | Logistics & Fulfillment Services" />
        <meta name="twitter:description" content="Contact TSG Fulfillment for logistics and fulfillment solutions based in Vaughan, Ontario." />
        <link rel="canonical" href="https://tsgfulfillment.com/contact" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact TSG Fulfillment",
            "description": "Get in touch with TSG Fulfillment for logistics and fulfillment services in Vaughan, Ontario.",
            "url": "https://tsgfulfillment.com/contact",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-289-815-5869",
              "contactType": "customer service",
              "email": "info@tsgfulfillment.com",
              "areaServed": "CA",
              "availableLanguage": ["English"]
            },
            "location": {
              "@type": "Place",
              "name": "TSG Fulfillment Services",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "6750 Langstaff Road",
                "addressLocality": "Vaughan",
                "addressRegion": "Ontario",
                "postalCode": "L4H 5K2",
                "addressCountry": "CA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 43.8013,
                "longitude": -79.5425
              }
            }
          })}
        </script>
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
            alt="Customer service contact center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 py-16 md:py-20">
          {/* Breadcrumb */}
          <div className="mb-8 text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Contact Us</span>
          </div>
          
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Get In <span className="font-light">Touch</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Have questions about our services? Ready to optimize your logistics operations? 
              Our team is here to help you find the right fulfillment solutions for your business.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Information Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ 
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {contactInfo.map((info, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-8 rounded-lg shadow-sm text-center"
                variants={fadeIn}
              >
                <div className="flex justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{info.title}</h3>
                <div className="mb-4">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className={`${idx === 0 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {detail}
                    </p>
                  ))}
                </div>
                {info.link && (
                  <a 
                    href={info.link} 
                    className="text-primary inline-flex items-center hover:underline font-medium"
                    target={info.link.startsWith('http') ? '_blank' : undefined}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {info.title === 'Main Office' ? 'View on Map' : 'Contact Us'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Contact Form</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                Send Us a <span className="text-primary">Message</span>
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Fill out the form below, and one of our logistics experts will get back to you 
                within one business day to discuss your specific needs.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 md:p-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(123) 456-7890"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-gray-700 font-medium mb-2">
                      Company Name
                    </label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Your Company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="interestType" className="block text-gray-700 font-medium mb-2">
                      Service Interest *
                    </label>
                    <Select value={formData.interestType} onValueChange={handleSelectChange} required>
                      <SelectTrigger className="w-full p-3 h-auto border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g., Request for Quote"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Your Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please tell us about your logistics needs and any specific requirements..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                
                <div className="text-center">
                  <Button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/90 py-6 px-10 rounded-md font-semibold flex items-center justify-center mx-auto"
                  >
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block text-primary font-semibold uppercase tracking-wider mb-3">Our Locations</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              Visit Our <span className="text-primary">Facilities</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our strategically located fulfillment centers across the United States allow us to provide 
              efficient, cost-effective shipping to customers nationwide.
            </p>
          </motion.div>
          
          <motion.div
            className="h-[500px] bg-gray-200 rounded-lg overflow-hidden shadow-md"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            {/* This would normally be replaced with an actual Google Maps embed */}
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Map Placeholder</h3>
                <p className="text-gray-600 mt-2">
                  In a real implementation, this would be an interactive Google Map showing our facilities.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Logistics?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're looking for a complete fulfillment solution or specialized services, 
              our team is ready to help you optimize your supply chain.
            </p>
            <Button 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
              onClick={() => window.location.href = 'tel:8005551234'}
            >
              Call Us Now: (800) 555-1234
              <Phone className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Contact;