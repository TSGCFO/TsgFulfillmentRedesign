import React, { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Box, Warehouse, Truck, Package, RotateCcw, Stethoscope, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { OptimizedImage } from '@/components/ui/optimized-image';
import LazySection from '@/components/ui/lazy-section';
import Seo from '@/components/SEO/Seo';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface ServiceData {
  title: string;
  description: string;
  icon: React.ReactNode;
  slug: string;
  longDescription: string[];
  features: string[];
  benefits: string[];
  callToAction: string;
  featuredImage?: string;
}

const serviceDetails: ServiceData[] = [
  {
    icon: <Package className="text-primary text-4xl" />,
    title: "Value-Added Services",
    description: "Our value-added services allow you to tailor your products to your customers' needs, from simple tasks like applying stickers to complex multi-layered kitting projects.",
    slug: "value-added-services",
    longDescription: [
      "TSG Fulfillment offers a comprehensive suite of value-added services that enable you to customize your inventory to meet specific customer requirements. Our skilled team can handle everything from simple product enhancements to complex assembly projects.",
      "These services help you differentiate your products in the marketplace, meet special customer requests, and create a more personalized unboxing experience. We maintain strict quality control throughout all value-added processes to ensure consistent results.",
      "Our flexible approach allows you to scale these services up or down based on seasonal demands or special promotions, without investing in additional staff or equipment. We work closely with you to develop efficient workflows that meet your exact specifications."
    ],
    features: [
      "Product labeling and stickering",
      "Custom packaging and gift wrapping",
      "Product bundling and kitting",
      "Assembly of multi-component products",
      "Quality inspection and testing",
      "Gift messaging and inserts",
      "Promotional material insertion",
      "Special packaging for fragile items"
    ],
    benefits: [
      "Customize products for specific customer needs",
      "Create unique unboxing experiences",
      "Add value to your products without increasing internal costs",
      "Easily accommodate seasonal or promotional variations",
      "Maintain consistent quality across all customizations"
    ],
    callToAction: "Ready to enhance your products with our value-added services? Contact us today to discuss how we can help you create custom solutions that delight your customers.",
    featuredImage: "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Box className="text-primary text-4xl" />,
    title: "Order Fulfillment",
    description: "We handle the entire fulfillment process from receiving and storing your inventory to processing orders, picking, packing, and shipping products directly to your customers.",
    slug: "order-fulfillment",
    longDescription: [
      "TSG Fulfillment provides comprehensive order fulfillment services to help businesses streamline their operations and improve customer satisfaction. Our nationwide fulfillment centers are strategically located to optimize shipping times and costs.",
      "We handle all aspects of the order fulfillment process, from inventory management to shipping, allowing you to focus on growing your business. Our team of experts is dedicated to ensuring your orders are processed accurately and efficiently.",
      "Our state-of-the-art systems integrate seamlessly with your e-commerce platform, ensuring real-time inventory updates and order tracking. We work with all major shipping carriers to get your products to your customers quickly and cost-effectively."
    ],
    features: [
      "Warehousing and storage solutions",
      "Order processing and management",
      "Picking, packing, and shipping",
      "Real-time inventory tracking",
      "Integration with major e-commerce platforms",
      "Custom packaging options",
      "Same-day shipping for orders placed before noon",
      "Returns management"
    ],
    benefits: [
      "Reduce shipping costs with our strategic locations",
      "Improve customer satisfaction with faster delivery",
      "Scale your business without increasing operational costs",
      "Eliminate the need for warehouse space and staff",
      "Focus on your core business while we handle logistics"
    ],
    callToAction: "Ready to streamline your order fulfillment process? Contact us today for a customized solution that fits your business needs.",
    featuredImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Warehouse className="text-primary text-4xl" />,
    title: "Warehousing Services",
    description: "Our climate-controlled warehousing facility offers secure storage solutions with advanced inventory management systems to help you consolidate your supply chains.",
    slug: "warehousing-services",
    longDescription: [
      "TSG Fulfillment offers a modern, climate-controlled warehousing facility designed to protect your products and optimize your supply chain. Our facility is equipped with state-of-the-art security systems and staffed by experienced professionals.",
      "Our warehousing services are scalable to accommodate your business's changing needs. Whether you require short-term storage for seasonal inventory or long-term solutions, we have options to fit your requirements and budget.",
      "Our advanced inventory management system provides real-time visibility into your stock levels, allowing you to make informed decisions about reordering and product allocation. We maintain strict quality control standards to ensure your products are handled with care."
    ],
    features: [
      "Climate-controlled facility",
      "24/7 security monitoring",
      "Barcode scanning systems",
      "Advanced inventory management",
      "Batch and lot tracking",
      "Cross-docking capabilities",
      "Long and short-term storage options",
      "Dock-high loading areas"
    ],
    benefits: [
      "Reduce capital expenditure on warehouse space",
      "Scale storage capacity based on seasonal needs",
      "Improve inventory accuracy and reduce shrinkage",
      "Access real-time inventory data from anywhere",
      "Optimize warehouse space utilization"
    ],
    callToAction: "Looking for reliable warehousing solutions? Contact our team today to discuss how we can help you optimize your storage and inventory management.",
    featuredImage: "https://images.unsplash.com/photo-1583302729124-de1f8e61bcf5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Package className="text-primary text-4xl" />,
    title: "Kitting Services",
    description: "We combine multiple components or products into a single package or kit, making it easier to manage inventory and fulfill orders for product bundles or special promotions.",
    slug: "kitting-services",
    longDescription: [
      "TSG Fulfillment's kitting services streamline your fulfillment process by pre-assembling multiple items into a single package before shipping. This is ideal for subscription boxes, product bundles, promotional materials, or any situation where multiple components need to be shipped together.",
      "Our experienced team ensures accurate assembly of kits according to your specifications. We can handle everything from simple combinations to complex multi-component kits, always maintaining strict quality control standards.",
      "Kitting services can help you reduce shipping costs, improve order accuracy, and enhance the unboxing experience for your customers. We can create customized workflows to match your unique requirements."
    ],
    features: [
      "Assembly of multiple items into ready-to-ship kits",
      "Custom packaging solutions",
      "Quality control checks",
      "Inventory management for kit components",
      "Subscription box preparation",
      "Promotional bundle assembly",
      "Special packaging inserts",
      "Seasonal kit variations"
    ],
    benefits: [
      "Reduce shipping and handling costs",
      "Streamline the fulfillment process",
      "Improve order accuracy and reduce errors",
      "Create a consistent unboxing experience",
      "Simplify inventory management for bundled products"
    ],
    callToAction: "Ready to simplify your product bundling and kitting process? Contact us today to learn how our kitting services can save you time and money.",
    featuredImage: "https://images.unsplash.com/photo-1600494448655-ae58f58bb945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Package className="text-primary text-4xl" />,
    title: "Hand Assembly",
    description: "Our hand assembly services include sorting, inserting, and collating items with meticulous attention to detail for your specialized packaging needs.",
    slug: "hand-assembly",
    longDescription: [
      "TSG Fulfillment provides skilled hand assembly services for products that require special care and attention to detail. Our experienced team can handle complex assembly tasks that may not be suitable for automated processes.",
      "From intricate product components to delicate promotional materials, our hand assembly services ensure that each item is carefully put together according to your specifications. We maintain strict quality control throughout the assembly process.",
      "Our versatile team can adapt to various assembly requirements, whether you need ongoing assembly services for your core products or temporary support for special projects and seasonal demands."
    ],
    features: [
      "Meticulous product assembly",
      "Component sorting and organization",
      "Material insertion and collation",
      "Quality inspection at multiple stages",
      "Special packaging and presentation",
      "Promotional display assembly",
      "Gift and premium product preparation",
      "Customized assembly instructions"
    ],
    benefits: [
      "Access skilled assembly personnel without hiring costs",
      "Scale assembly operations based on demand",
      "Ensure consistent quality with experienced staff",
      "Save on equipment and training costs",
      "Free up your team to focus on core operations"
    ],
    callToAction: "Need expert hand assembly services for your products? Contact us today to discuss how we can support your specialized assembly needs.",
    featuredImage: "https://images.unsplash.com/photo-1523800378286-dae1f0dae656?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <RotateCcw className="text-primary text-4xl" />,
    title: "Reverse Logistics",
    description: "Our comprehensive returns management system handles product returns, exchanges, and repairs efficiently and cost-effectively, reducing waste and improving customer satisfaction.",
    slug: "reverse-logistics",
    longDescription: [
      "TSG Fulfillment's reverse logistics services provide a streamlined, efficient process for managing returns, exchanges, and product repairs. We handle the entire reverse logistics workflow, from receiving returned items to processing them according to your specifications.",
      "Our systems are designed to track and document each step of the returns process, providing you with complete visibility and reporting. We can inspect returned items, determine their condition, and route them appropriately for restocking, refurbishment, or disposal.",
      "A well-managed returns process is essential for customer satisfaction and can significantly impact your bottom line. Our reverse logistics solutions help you recover maximum value from returned merchandise while providing a positive experience for your customers."
    ],
    features: [
      "Returns processing and management",
      "Product inspection and quality checks",
      "Refurbishment and repair services",
      "Restocking of eligible items",
      "Disposition of damaged goods",
      "Customer communication management",
      "Returns reporting and analytics",
      "Customized returns workflows"
    ],
    benefits: [
      "Improve customer satisfaction with hassle-free returns",
      "Recover value from returned merchandise",
      "Reduce waste and environmental impact",
      "Gain insights from returns data and patterns",
      "Free up resources focused on forward logistics"
    ],
    callToAction: "Looking to optimize your returns management process? Contact us today to learn how our reverse logistics solutions can help you improve efficiency and customer satisfaction.",
    featuredImage: "https://images.unsplash.com/photo-1592842232655-e5d345cbc2d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Box className="text-primary text-4xl" />,
    title: "Inventory Management",
    description: "We provide real-time inventory tracking, automated reordering, and detailed reporting to help you maintain optimal stock levels and prevent stockouts or overstock situations.",
    slug: "inventory-management",
    longDescription: [
      "TSG Fulfillment's inventory management services give you complete visibility and control over your product inventory. Our sophisticated systems track inventory levels in real-time, allowing you to make informed decisions about reordering, product allocation, and sales strategies.",
      "We implement best practices in inventory control, including cycle counting, FIFO/LIFO management, lot tracking, and expiration date monitoring. Our goal is to help you maintain optimal inventory levels that balance stock availability with storage costs.",
      "Our detailed reporting and analytics provide valuable insights into inventory performance, helping you identify trends, forecast future needs, and optimize your supply chain. We can integrate our inventory management system with your sales channels for seamless operations."
    ],
    features: [
      "Real-time inventory tracking",
      "Barcode and RFID scanning",
      "Cycle counting and inventory audits",
      "FIFO/LIFO inventory management",
      "Lot and batch tracking",
      "Expiration date monitoring",
      "Low stock alerts and automated reordering",
      "Inventory reporting and analytics"
    ],
    benefits: [
      "Prevent costly stockouts and lost sales",
      "Avoid excess inventory and storage costs",
      "Improve inventory accuracy and reduce shrinkage",
      "Make data-driven purchasing decisions",
      "Optimize working capital allocation"
    ],
    callToAction: "Ready to take control of your inventory? Contact us today to learn how our inventory management services can help you optimize your stock levels and improve efficiency.",
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Truck className="text-primary text-4xl" />,
    title: "Freight Forwarding",
    description: "We organize and manage the shipment of your goods across international borders, ensuring compliance with regulations and optimizing transportation costs.",
    slug: "freight-forwarding",
    longDescription: [
      "TSG Fulfillment's freight forwarding services help you navigate the complexities of international shipping and logistics. We coordinate the entire transportation process, from pickup at origin to delivery at destination, ensuring your goods arrive safely and on time.",
      "Our team of experts handles all documentation, customs clearance, and regulatory compliance requirements, reducing the risk of delays and penalties. We work with a network of trusted carriers and partners worldwide to provide reliable service across all shipping modes.",
      "We develop customized shipping solutions based on your specific needs, considering factors such as time sensitivity, cost considerations, cargo type, and destination requirements. Our goal is to optimize your supply chain and reduce overall transportation costs."
    ],
    features: [
      "International shipping coordination",
      "Customs documentation and clearance",
      "Import/export compliance management",
      "Multi-modal transportation options",
      "Cargo insurance arrangements",
      "Hazardous materials handling",
      "Specialized shipping for oversized cargo",
      "Shipment tracking and visibility"
    ],
    benefits: [
      "Navigate complex international shipping regulations",
      "Reduce transportation costs through route optimization",
      "Minimize customs delays and compliance issues",
      "Access global shipping expertise without in-house specialists",
      "Maintain supply chain visibility across borders"
    ],
    callToAction: "Need help with international shipping and logistics? Contact us today to discuss how our freight forwarding services can help you optimize your global supply chain.",
    featuredImage: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: <Stethoscope className="text-primary text-4xl" />,
    title: "Healthcare Marketing Services",
    description: "Specialized fulfillment services for pharmaceutical and natural health industries with full compliance to regulatory requirements and quality standards.",
    slug: "healthcare-services",
    longDescription: [
      "TSG Fulfillment provides specialized marketing fulfillment services for the healthcare and pharmaceutical industries, designed to meet strict regulatory requirements and quality standards. We understand the unique challenges of healthcare marketing and ensure compliance at every step.",
      "Our services include distribution of marketing materials, product samples, and educational resources to healthcare professionals, clinics, and patients. We maintain proper documentation and tracking to support regulatory compliance and reporting requirements.",
      "Our team is trained in handling healthcare materials with appropriate care, ensuring that sensitive information is protected and that all distribution follows industry guidelines. We work closely with healthcare companies to develop customized solutions that meet their specific needs."
    ],
    features: [
      "Compliance with healthcare regulations",
      "Secure handling of sensitive materials",
      "Distribution of marketing collateral",
      "Sample management for healthcare professionals",
      "Educational material fulfillment",
      "Event and conference support",
      "Temperature-controlled storage when needed",
      "Detailed tracking and reporting"
    ],
    benefits: [
      "Ensure regulatory compliance in marketing activities",
      "Streamline distribution to healthcare providers",
      "Maintain proper documentation for audit purposes",
      "Protect sensitive healthcare information",
      "Focus on core activities while we handle logistics"
    ],
    callToAction: "Looking for specialized fulfillment services for your healthcare marketing needs? Contact us today to learn how we can help you maintain compliance while improving efficiency.",
    featuredImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
  }
];

const ServiceDetail = () => {
  const [, params] = useRoute('/services/:slug');
  const [, setLocation] = useLocation();
  const [service, setService] = useState<ServiceData | null>(null);
  const [nextService, setNextService] = useState<ServiceData | null>(null);
  const [prevService, setPrevService] = useState<ServiceData | null>(null);

  useEffect(() => {
    if (!params) {
      setLocation('/services/order-fulfillment');
      return;
    }
    
    const currentSlug = params.slug;
    const currentServiceIndex = serviceDetails.findIndex(s => s.slug === currentSlug);
    
    if (currentServiceIndex === -1) {
      setLocation('/not-found');
      return;
    }
    
    const currentService = serviceDetails[currentServiceIndex];
    setService(currentService);
    
    // Set next service
    const nextIndex = (currentServiceIndex + 1) % serviceDetails.length;
    setNextService(serviceDetails[nextIndex]);
    
    // Set previous service
    const prevIndex = currentServiceIndex === 0 ? serviceDetails.length - 1 : currentServiceIndex - 1;
    setPrevService(serviceDetails[prevIndex]);
    
    // We've replaced all the manual DOM manipulations with our modern Seo component
    // This approach is cleaner, more React-friendly, and eliminates the deprecation warnings
    
    // The Seo component now handles all meta tags and structured data dynamically
    // based on the current service data
    
    // Navigation links are now handled by our Seo component
    // We'll use our modern SEO approach instead of direct DOM manipulation
    
    // Scroll to top when service changes 
    window.scrollTo(0, 0);
    
    // We no longer need to manually add JSON-LD structured data
    // The Seo component now handles this for us with the structuredData prop
  }, [params, setLocation]);

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Create structured data for this service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.longDescription[0] || service.description,
    "provider": {
      "@type": "Organization",
      "name": "TSG Fulfillment Services",
      "url": "https://tsgfulfillment.com"
    },
    "serviceType": service.title,
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Logistics and Fulfillment Services",
      "itemListElement": service.features.map((feature, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": feature
        }
      }))
    }
  };

  return (
    <>
      <Seo
        title={`${service.title} - TSG Fulfillment Services`}
        description={service.description}
        keywords={`fulfillment services, logistics, ${service.title.toLowerCase()}, warehousing, supply chain`}
        canonical={`https://tsgfulfillment.com/services/${service.slug}`}
        ogType="website"
        ogUrl={`https://tsgfulfillment.com/services/${service.slug}`}
        ogImage={service.featuredImage || "https://tsgfulfillment.com/images/og-image.jpg"}
        twitterCard="summary_large_image"
        twitterTitle={`${service.title} - TSG Fulfillment Services`}
        twitterDescription={service.description}
        structuredData={serviceSchema}
      />
      <header className="py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                Back to Home
              </Link>
            </div>
            
            {/* Breadcrumbs navigation */}
            <Breadcrumbs 
              className="mt-3"
              items={[
                { label: 'Services', href: '/#services' },
                { label: service.title, href: `/services/${params?.slug}`, isCurrent: true }
              ]}
            />
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mb-6 mx-auto">
                {service.icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-6">{service.title}</h1>
              <p className="text-xl text-gray-600 mb-8">{service.description}</p>
              
              {/* Featured image with optimized loading */}
              {service.featuredImage && (
                <div className="mt-8 mb-12 overflow-hidden rounded-xl shadow-lg">
                  <OptimizedImage
                    src={service.featuredImage}
                    alt={`${service.title} - TSG Fulfillment Services`}
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover"
                    loading="eager"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </div>
              )}
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Request a Quote
              </Button>
            </motion.div>
          </div>
        </section>

        <LazySection className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="prose prose-lg max-w-none"
              >
                {service.longDescription.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-6">{paragraph}</p>
                ))}
              </motion.div>
            </div>
          </div>
        </LazySection>

        <LazySection className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-3xl font-bold font-poppins mb-8">Key Features</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="text-primary h-6 w-6 flex-shrink-0 mr-3 mt-1" />
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </LazySection>

        <LazySection className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-3xl font-bold font-poppins mb-8">Benefits</h2>
                <Card className="border-primary/10">
                  <CardContent className="p-8">
                    <ul className="space-y-4">
                      {service.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="text-primary h-6 w-6 flex-shrink-0 mr-3 mt-1" />
                          <p className="text-gray-700">{benefit}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </LazySection>

        <LazySection className="py-16 bg-primary/5" id="contact">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <h2 className="text-3xl font-bold font-poppins mb-6">Get Started Today</h2>
                <p className="text-xl text-gray-600 mb-8">{service.callToAction}</p>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setLocation('/#contact');
                  }}
                >
                  Contact Us Now
                </Button>
              </motion.div>
            </div>
          </div>
        </LazySection>

        <LazySection className="py-16">
          <div className="container mx-auto px-6">
            <Separator className="mb-12" />
            <div className="flex flex-col sm:flex-row justify-between items-center">
              {prevService && (
                <Link href={`/services/${prevService?.slug}`} className="text-primary hover:text-primary/80 transition-colors flex items-center mb-6 sm:mb-0">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {prevService?.title}
                </Link>
              )}
              {nextService && (
                <Link href={`/services/${nextService?.slug}`} className="text-primary hover:text-primary/80 transition-colors flex items-center">
                  {nextService?.title}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </LazySection>
      </main>

      <Footer />
    </>
  );
};

export default ServiceDetail;