import React from 'react';
import { Link } from 'wouter';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, ArrowRight, Send, ChevronRight } from 'lucide-react';

const Footer: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscription successful",
        description: "Thank you for subscribing to our newsletter!",
      });
      setEmail('');
    } else {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
    }
  };

  interface ServiceLink {
    name: string;
    slug: string;
  }

  const services: ServiceLink[] = [
    { name: "Warehousing", slug: "warehousing" },
    { name: "Fulfillment", slug: "fulfillment" },
    { name: "Transportation", slug: "transportation" },
    { name: "Value Added Services", slug: "value-added-services" }
  ];

  interface QuickLink {
    name: string;
    href: string;
  }

  const quickLinks: QuickLink[] = [
    { name: "About Us", href: "/#about" },
    { name: "Industries", href: "/#industries" },
    { name: "Services", href: "/#services" },
    { name: "Locations", href: "/locations" },
    { name: "Contact Us", href: "/#contact" }
  ];

  const contactInfo = [
    { icon: <Phone className="h-5 w-5" />, text: "(289) 815-5869", href: "tel:2898155869" },
    { icon: <Mail className="h-5 w-5" />, text: "info@tsgfulfillment.com", href: "mailto:info@tsgfulfillment.com" },
    { icon: <MapPin className="h-5 w-5" />, text: "6750 Langstaff Road, Vaughan, Ontario, L4H 5K2", href: "https://maps.google.com" }
  ];

  return (
    <footer className="bg-gradient-to-b from-[#0F2149] to-[#05102D] text-white">
      {/* Footer Top - Contact Bar */}
      <div className="bg-primary py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold">Ready to optimize your logistics?</h3>
              <p className="text-white/80 mt-2">Get in touch with our experts for a free consultation.</p>
            </div>
            <Button 
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  window.scrollTo({
                    top: element.offsetTop - 100,
                    behavior: 'smooth',
                  });
                }
              }}
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 flex items-center"
            >
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center mb-8">
                <Logo theme="dark" />
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                TSG Fulfillment specializes in retail, e-commerce, and B2B fulfillment. 
                We provide practical, cost-effective logistics solutions tailored to your business needs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-[#0F2149] hover:bg-[#1C3A84] h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="bg-[#0F2149] hover:bg-[#1C3A84] h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="bg-[#0F2149] hover:bg-[#1C3A84] h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="bg-[#0F2149] hover:bg-[#1C3A84] h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[3px] after:w-[30px] after:bg-primary">Services</h3>
              <ul className="space-y-4">
                {services.map((service, index) => (
                  <li key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <a href={`/services/${service.slug}`} className="text-gray-300 hover:text-white transition-colors duration-300">
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[3px] after:w-[30px] after:bg-primary">Quick Links</h3>
              <ul className="space-y-4">
                {quickLinks.map((link, index) => (
                  <li key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-300">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:h-[3px] after:w-[30px] after:bg-primary">Contact Info</h3>
              <ul className="space-y-5">
                {contactInfo.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-[#0F2149] h-10 w-10 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      {item.icon}
                    </div>
                    <a href={item.href} className="text-gray-300 hover:text-white transition-colors duration-300">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Subscribe to Our Newsletter</h4>
                <form className="relative" onSubmit={handleSubscribe}>
                  <Input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full p-3 pl-4 pr-12 bg-[#0F2149] text-white border border-[#1C3A84] rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" className="absolute right-1 top-1 bg-primary text-white p-2 rounded-md hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-sm text-gray-400 mt-2">
                  Get the latest updates and insights directly to your inbox.
                </p>
              </div>
            </div>
          </div>
          
          <hr className="border-[#1C3A84] mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TSG Fulfillment Services Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cookie Consent Banner - Hidden by default, shown when no consent in localStorage */}
      <div id="cookie-consent-banner" className="fixed bottom-0 left-0 right-0 bg-white text-gray-800 shadow-lg z-50 hidden">
        <div className="container mx-auto p-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 pr-4">
            <h3 className="font-bold text-lg mb-1">Cookie Notice</h3>
            <p className="text-sm">We use cookies to enhance your experience on our website. By continuing to browse, you agree to our use of cookies and our privacy policy.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                document.getElementById('cookie-consent-banner')?.classList.add('hidden');
                localStorage.setItem('cookie-consent', 'false');
              }}
              className="text-sm"
            >
              Decline
            </Button>
            <Button 
              onClick={() => {
                document.getElementById('cookie-consent-banner')?.classList.add('hidden');
                localStorage.setItem('cookie-consent', 'true');
              }}
              className="bg-primary text-white hover:bg-primary/90 text-sm"
            >
              Accept All Cookies
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
