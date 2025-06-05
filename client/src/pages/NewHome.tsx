import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Box, BarChart2, TruckIcon, Package, RefreshCw, Shield, Award, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import warehouseImage from '@assets/Original.png'; // This will be replaced with a proper warehouse image

// Company logos for partners/clients section
const clientLogos = [
  { id: 1, name: 'Client 1', logo: 'https://via.placeholder.com/150x50?text=Client+Logo' },
  { id: 2, name: 'Client 2', logo: 'https://via.placeholder.com/150x50?text=Client+Logo' },
  { id: 3, name: 'Client 3', logo: 'https://via.placeholder.com/150x50?text=Client+Logo' },
  { id: 4, name: 'Client 4', logo: 'https://via.placeholder.com/150x50?text=Client+Logo' },
  { id: 5, name: 'Client 5', logo: 'https://via.placeholder.com/150x50?text=Client+Logo' },
  { id: 6, name: 'Client 6', logo: 'https://via.placeholder.com/150x50?text=Client+Logo' },
];

// Service boxes data
const services = [
  {
    id: 1,
    title: 'Warehousing',
    description: 'Strategic warehouse facilities across the country to store your inventory securely and efficiently.',
    icon: <Box className="h-10 w-10 text-[#0056B3]" />,
    link: '/services/warehousing',
  },
  {
    id: 2,
    title: 'Order Fulfillment',
    description: 'Fast, accurate order processing and shipping to meet your customers\' expectations.',
    icon: <ShoppingCart className="h-10 w-10 text-[#0056B3]" />,
    link: '/services/fulfillment',
  },
  {
    id: 3,
    title: 'Inventory Management',
    description: 'Real-time inventory tracking and management to optimize stock levels and reduce costs.',
    icon: <BarChart2 className="h-10 w-10 text-[#0056B3]" />,
    link: '/services/inventory-management',
  },
  {
    id: 4,
    title: 'Kitting & Assembly',
    description: 'Custom kitting and product assembly services to enhance your product offerings.',
    icon: <Package className="h-10 w-10 text-[#0056B3]" />,
    link: '/services/kitting',
  },
  {
    id: 5,
    title: 'Shipping & Distribution',
    description: 'Efficient shipping and distribution services to get your products where they need to go.',
    icon: <TruckIcon className="h-10 w-10 text-[#0056B3]" />,
    link: '/services/shipping',
  },
  {
    id: 6,
    title: 'Reverse Logistics',
    description: 'Hassle-free returns processing and management to maintain customer satisfaction.',
    icon: <RefreshCw className="h-10 w-10 text-[#0056B3]" />,
    link: '/services/reverse-logistics',
  },
];

// Why choose TSG Fulfillment data
const benefits = [
  {
    id: 1,
    title: 'Strategic Locations',
    description: 'Our facilities are strategically located to provide optimal shipping times and reduced costs.',
    icon: <TruckIcon className="h-12 w-12 p-2 bg-blue-100 rounded-lg text-[#0056B3]" />,
  },
  {
    id: 2,
    title: 'Advanced Technology',
    description: 'Our proprietary technology provides real-time visibility and control over your inventory and orders.',
    icon: <BarChart2 className="h-12 w-12 p-2 bg-blue-100 rounded-lg text-[#0056B3]" />,
  },
  {
    id: 3,
    title: 'Accuracy & Quality',
    description: '99.9% order accuracy rate ensures your customers receive exactly what they ordered, when expected.',
    icon: <Shield className="h-12 w-12 p-2 bg-blue-100 rounded-lg text-[#0056B3]" />,
  },
  {
    id: 4,
    title: 'Scalable Solutions',
    description: 'Our flexible solutions grow with your business, from startup to enterprise-level operations.',
    icon: <Award className="h-12 w-12 p-2 bg-blue-100 rounded-lg text-[#0056B3]" />,
  },
];

// Industries we serve
const industries = [
  { id: 1, name: 'E-commerce', image: 'https://via.placeholder.com/300x200?text=E-Commerce' },
  { id: 2, name: 'Retail', image: 'https://via.placeholder.com/300x200?text=Retail' },
  { id: 3, name: 'Health & Beauty', image: 'https://via.placeholder.com/300x200?text=Health+Beauty' },
  { id: 4, name: 'Consumer Electronics', image: 'https://via.placeholder.com/300x200?text=Electronics' },
];

// Testimonials
const testimonials = [
  {
    id: 1,
    quote: "TSG Fulfillment has been instrumental in our company's growth. Their efficient order processing and accurate inventory management have allowed us to focus on expanding our product line.",
    author: "Jane Smith",
    title: "CEO, Fashion Brand",
    company: "StyleCo",
  },
  {
    id: 2,
    quote: "Since partnering with TSG Fulfillment, our shipping times have decreased by 40% and customer satisfaction has increased significantly. Their technology integration with our e-commerce platform is seamless.",
    author: "Michael Johnson",
    title: "Operations Manager",
    company: "Tech Gadgets Inc.",
  },
  {
    id: 3,
    quote: "The team at TSG Fulfillment has been exceptional to work with. They've helped us manage seasonal inventory spikes and maintain consistent delivery times throughout the year.",
    author: "Sarah Williams",
    title: "Logistics Director",
    company: "Seasonal Goods Co.",
  },
];

// Stats
const stats = [
  { id: 1, value: '99.8%', label: 'Order Accuracy' },
  { id: 2, value: '98.5%', label: 'On-Time Shipping' },
  { id: 3, value: '500K+', label: 'Orders Processed Monthly' },
  { id: 4, value: '15+', label: 'Years of Experience' },
];

const NewHome: React.FC = () => {
  return (
    <Layout>
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

      {/* Logo Banner Section */}
      <section className="bg-gray-100 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-gray-500 text-lg mb-8">Trusted by Leading Brands</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {clientLogos.map((client) => (
              <div key={client.id} className="grayscale hover:grayscale-0 transition-all">
                <img src={client.logo} alt={client.name} className="h-12 object-contain" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link href={service.link}>
                    <a className="inline-flex items-center font-medium text-[#0056B3] hover:text-blue-700">
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
      <section className="bg-[#0056B3] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Optimize Your Fulfillment?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get in touch with our team for a customized fulfillment solution that meets your business needs.
          </p>
          <Button 
            className="bg-white hover:bg-gray-100 text-[#0056B3] px-8 py-3 text-lg font-bold"
            onClick={() => {
              window.location.href = '/contact-form';
            }}
          >
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
                <div className="text-3xl md:text-4xl font-bold text-[#0056B3] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Industries We Serve</h2>
            <p className="text-gray-600 text-lg">
              We provide specialized fulfillment solutions for a wide range of industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry) => (
              <div key={industry.id} className="group relative overflow-hidden rounded-lg shadow-lg h-64">
                <img 
                  src={industry.image} 
                  alt={industry.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{industry.name}</h3>
                  <Link href={`/industries/${industry.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <a className="inline-flex items-center text-sm font-medium text-white hover:text-blue-200">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/industries">
              <Button className="bg-[#0056B3] hover:bg-blue-700 text-white">
                View All Industries
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-300 text-lg">
              Read about how TSG Fulfillment has helped businesses optimize their logistics operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-800 p-8 rounded-lg">
                <div className="text-[#0056B3] mb-4">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-6">{testimonial.quote}</p>
                <div className="font-bold">{testimonial.author}</div>
                <div className="text-gray-400 text-sm">{testimonial.title}, {testimonial.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transform Your Logistics Operations Today</h2>
            <p className="text-xl mb-8">
              Partner with TSG Fulfillment and experience the difference that efficient, technology-driven logistics can make for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white hover:bg-gray-100 text-blue-800 font-bold px-8 py-3 text-lg"
                onClick={() => {
                  window.location.href = '/contact-form';
                }}
              >
                Request a Quote
              </Button>
              <Link href="/contact-form">
                <Button className="bg-transparent hover:bg-blue-700 border-2 border-white font-bold px-8 py-3 text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewHome;