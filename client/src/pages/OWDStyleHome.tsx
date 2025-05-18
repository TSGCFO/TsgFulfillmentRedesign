import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Box, BarChart2, Truck, Package, RefreshCw, Shield, Award, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoOnTransparent from '@assets/Original on Transparent.png';
import warehouseImage from '@assets/Original.png';

const OWDStyleHome: React.FC = () => {
  // Service data
  const services = [
    {
      id: 1,
      title: 'Warehousing',
      description: 'Strategic warehouse facilities across the country to store your inventory securely and efficiently.',
      icon: <Box size={40} className="text-blue-600" />,
      link: '/services/warehousing'
    },
    {
      id: 2,
      title: 'Order Fulfillment',
      description: 'Fast, accurate order processing and shipping to meet your customers\' expectations.',
      icon: <ShoppingCart size={40} className="text-blue-600" />,
      link: '/services/fulfillment'
    },
    {
      id: 3,
      title: 'Inventory Management',
      description: 'Real-time inventory tracking and management to optimize stock levels and reduce costs.',
      icon: <BarChart2 size={40} className="text-blue-600" />,
      link: '/services/inventory-management'
    },
    {
      id: 4,
      title: 'Kitting & Assembly',
      description: 'Custom kitting and product assembly services to enhance your product offerings.',
      icon: <Package size={40} className="text-blue-600" />,
      link: '/services/kitting'
    }
  ];

  // Benefits data
  const benefits = [
    {
      id: 1,
      title: 'Strategic Locations',
      description: 'Our facilities are strategically located to provide optimal shipping times and reduced costs.',
      icon: <Truck size={48} className="p-2 bg-blue-100 rounded-lg text-blue-600" />
    },
    {
      id: 2,
      title: 'Advanced Technology',
      description: 'Our proprietary technology provides real-time visibility and control over your inventory and orders.',
      icon: <BarChart2 size={48} className="p-2 bg-blue-100 rounded-lg text-blue-600" />
    },
    {
      id: 3,
      title: 'Accuracy & Quality',
      description: '99.9% order accuracy rate ensures your customers receive exactly what they ordered, when expected.',
      icon: <Shield size={48} className="p-2 bg-blue-100 rounded-lg text-blue-600" />
    },
    {
      id: 4,
      title: 'Scalable Solutions',
      description: 'Our flexible solutions grow with your business, from startup to enterprise-level operations.',
      icon: <Award size={48} className="p-2 bg-blue-100 rounded-lg text-blue-600" />
    }
  ];

  // Stats
  const stats = [
    { id: 1, value: '99.8%', label: 'Order Accuracy' },
    { id: 2, value: '98.5%', label: 'On-Time Shipping' },
    { id: 3, value: '500K+', label: 'Orders Processed Monthly' },
    { id: 4, value: '15+', label: 'Years of Experience' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top navigation bar */}
      <div className="bg-blue-900 text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (800) 555-1234
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@tsgfulfillment.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="hover:text-blue-200 transition">Client Login</a>
            <a href="/contact" className="hover:text-blue-200 transition">Contact Us</a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <a>
                <img src={logoOnTransparent} alt="TSG Fulfillment" className="h-12" />
              </a>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <a href="/services" className="text-gray-700 hover:text-blue-600 px-2 py-1 font-medium">
                  Services
                </a>
              </div>
              <a href="/industries" className="text-gray-700 hover:text-blue-600 px-2 py-1 font-medium">Industries</a>
              <a href="/technology" className="text-gray-700 hover:text-blue-600 px-2 py-1 font-medium">Technology</a>
              <a href="/why-us" className="text-gray-700 hover:text-blue-600 px-2 py-1 font-medium">Why TSG</a>
              <a href="/blog" className="text-gray-700 hover:text-blue-600 px-2 py-1 font-medium">Resources</a>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Get a Quote
              </Button>
            </nav>

            <button className="md:hidden p-2 text-gray-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-90"></div>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${warehouseImage})` }}
        ></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Next-Generation Fulfillment Solutions
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Streamline your logistics with TSG Fulfillment's 
              comprehensive warehousing, fulfillment, and distribution services. 
              Let us handle your supply chain while you focus on growing your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white hover:bg-gray-100 text-blue-900 font-bold px-8 py-6 text-lg">
                Get Started
              </Button>
              <Button className="bg-transparent hover:bg-blue-800 border-2 border-white font-bold px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Banner */}
      <section className="bg-gray-100 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-gray-500 text-lg mb-8">Trusted by Leading Brands</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="grayscale hover:grayscale-0 transition-all">
                <div className="h-12 w-36 bg-gray-300 rounded flex items-center justify-center">
                  Client {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Fulfillment Services</h2>
            <p className="text-gray-600 text-lg">
              From storage to shipping, we offer end-to-end logistics solutions customized to your business needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href={service.link}>
                    <a className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700">
                      Learn more <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Optimize Your Fulfillment?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get in touch with our team for a customized fulfillment solution that meets your business needs.
          </p>
          <Button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 text-lg font-bold">
            Request a Quote
          </Button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TSG Fulfillment</h2>
            <p className="text-gray-600 text-lg">
              Our cutting-edge technology and dedicated team deliver exceptional logistics services that help your business grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="flex">
                <div className="flex-shrink-0 mr-6">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Stats Counter */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-white p-6 rounded-lg shadow">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img src={logoOnTransparent} alt="TSG Fulfillment" className="h-12 mb-4 brightness-0 invert" />
              <p className="mb-4 text-gray-400">
                TSG Fulfillment is your trusted partner for warehousing and fulfillment services. 
                We help businesses of all sizes streamline their logistics operations.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li><a href="/services/warehousing" className="text-gray-400 hover:text-white transition-colors">Warehousing</a></li>
                <li><a href="/services/fulfillment" className="text-gray-400 hover:text-white transition-colors">Order Fulfillment</a></li>
                <li><a href="/services/kitting" className="text-gray-400 hover:text-white transition-colors">Kitting & Assembly</a></li>
                <li><a href="/services/reverse-logistics" className="text-gray-400 hover:text-white transition-colors">Reverse Logistics</a></li>
                <li><a href="/services/inventory-management" className="text-gray-400 hover:text-white transition-colors">Inventory Management</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/why-us" className="text-gray-400 hover:text-white transition-colors">Why Choose TSG</a></li>
                <li><a href="/industries" className="text-gray-400 hover:text-white transition-colors">Industries We Serve</a></li>
                <li><a href="/technology" className="text-gray-400 hover:text-white transition-colors">Technology</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400">
                    123 Logistics Way<br />
                    Warehouse District, CA 90210
                  </span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400">(800) 555-1234</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400">info@tsgfulfillment.com</span>
                </li>
              </ul>
              <div className="mt-6">
                <a href="/quote">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                    Request a Quote
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-gray-500 text-sm">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} TSG Fulfillment. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="/sitemap" className="hover:text-white transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OWDStyleHome;