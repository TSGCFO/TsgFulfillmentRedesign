import React from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ArrowRight, Warehouse, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Helmet } from 'react-helmet';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface IndustryData {
  title: string;
  slug: string;
  metaDescription: string;
  headerImage: string;
  shortDescription: string;
  longDescription: string[];
  challenges: {title: string; description: string}[];
  solutions: {title: string; description: string}[];
  benefits: string[];
  statistics: {value: string; label: string}[];
  caseStudy?: {
    title: string;
    clientName: string;
    description: string[];
    results: string[];
  };
}

const industries: IndustryData[] = [
  {
    title: "E-Commerce",
    slug: "ecommerce",
    metaDescription: "Industry-leading fulfillment solutions for e-commerce businesses of all sizes. Scale your online store with TSG Fulfillment's end-to-end logistics services.",
    headerImage: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    shortDescription: "Comprehensive logistics solutions tailored specifically for e-commerce businesses, from direct-to-consumer brands to enterprise retailers.",
    longDescription: [
      "In today's competitive e-commerce landscape, efficient fulfillment is the backbone of a successful online business. TSG Fulfillment provides end-to-end logistics solutions designed specifically for the unique challenges of e-commerce operations.",
      "Our technology-driven approach integrates seamlessly with your e-commerce platform, providing real-time inventory visibility, order tracking, and reporting capabilities. This integration ensures your customers receive accurate, timely updates throughout the fulfillment process.",
      "Whether you're a growing direct-to-consumer brand or an established enterprise retailer, our scalable solutions adapt to your business needs. Our strategic warehouse locations enable 2-day delivery to 98% of the continental United States, helping you meet and exceed customer expectations."
    ],
    challenges: [
      {
        title: "Seasonal Volume Fluctuations",
        description: "E-commerce businesses often face dramatic volume fluctuations during peak seasons and promotional periods, requiring flexible capacity."
      },
      {
        title: "Customer Experience Expectations",
        description: "Today's online shoppers expect fast shipping, accurate orders, and a seamless returns process as standard service."
      },
      {
        title: "Inventory Management Complexity",
        description: "Managing inventory across multiple sales channels while preventing stockouts and overstocking is increasingly complex."
      },
      {
        title: "Returns Processing",
        description: "E-commerce typically experiences higher return rates than brick-and-mortar retail, requiring efficient reverse logistics processes."
      }
    ],
    solutions: [
      {
        title: "Scalable Fulfillment Operations",
        description: "Our facilities and staffing flex with your business needs, accommodating both everyday volumes and peak season surges without compromising quality."
      },
      {
        title: "Multi-Channel Integration",
        description: "Seamless integration with all major e-commerce platforms, marketplaces, and order management systems for unified inventory and order processing."
      },
      {
        title: "Strategic Facility Network",
        description: "Strategically located fulfillment centers enabling 2-day ground shipping to most of the continental United States, reducing transit times and shipping costs."
      },
      {
        title: "Value-Added Services",
        description: "Custom packaging, kitting, gift wrapping, and personalized inserts to enhance the unboxing experience and reinforce your brand identity."
      }
    ],
    benefits: [
      "Reduce shipping costs and delivery times through strategic warehouse locations",
      "Scale operations quickly to meet seasonal demands without capital investment",
      "Improve customer satisfaction with consistent, accurate order fulfillment",
      "Gain real-time visibility into inventory and order status across all channels",
      "Focus on growing your business while we handle the logistics"
    ],
    statistics: [
      { value: "99.8%", label: "Order Accuracy Rate" },
      { value: "98%", label: "On-Time Shipping" },
      { value: "60%", label: "Average Reduction in Shipping Costs" },
      { value: "24/7", label: "Real-Time Inventory Visibility" }
    ],
    caseStudy: {
      title: "How TSG Fulfillment Helped a Growing Fashion Brand Scale Operations",
      clientName: "Fashion Forward Apparel",
      description: [
        "Fashion Forward Apparel, a direct-to-consumer clothing brand, was experiencing rapid growth but struggling to keep up with order fulfillment using their in-house operations. Shipping delays and inventory management issues were negatively impacting customer satisfaction.",
        "After partnering with TSG Fulfillment, Fashion Forward Apparel integrated their Shopify store with our fulfillment system, allowing for automatic order processing and real-time inventory updates. We implemented a custom quality control process specifically for apparel products and created branded packaging that enhanced the unboxing experience."
      ],
      results: [
        "Reduced average order processing time from 3 days to same-day fulfillment",
        "Decreased shipping costs by 42% through zone skipping and carrier optimization",
        "Improved customer satisfaction scores by 35% within the first three months",
        "Successfully handled a 400% volume increase during Black Friday/Cyber Monday with 99.7% on-time fulfillment"
      ]
    }
  },
  {
    title: "Retail & CPG",
    slug: "retail-cpg",
    metaDescription: "Streamline your retail and consumer packaged goods supply chain with TSG Fulfillment's integrated logistics and distribution solutions.",
    headerImage: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
    shortDescription: "Comprehensive logistics solutions for retail brands and consumer packaged goods companies, from warehouse storage to omnichannel distribution.",
    longDescription: [
      "The retail and consumer packaged goods (CPG) landscape has transformed dramatically, with omnichannel strategies now essential for success. TSG Fulfillment provides integrated logistics solutions that support both traditional retail and direct-to-consumer channels.",
      "Our retail and CPG fulfillment services are designed to meet the unique challenges of multi-channel distribution, inventory management across locations, and the complex requirements of retail compliance. We help you navigate retailer routing guidelines, EDI requirements, and chargeback prevention.",
      "With our strategic warehouse locations and expertise in retail logistics, we enable you to meet strict vendor compliance requirements while optimizing your supply chain for efficiency and cost-effectiveness."
    ],
    challenges: [
      {
        title: "Retail Compliance Requirements",
        description: "Major retailers impose strict vendor compliance guidelines with potential chargebacks for non-compliance, creating operational complexity."
      },
      {
        title: "Omnichannel Distribution",
        description: "Managing inventory and fulfillment across multiple channels (brick-and-mortar, wholesale, direct-to-consumer) requires sophisticated systems and processes."
      },
      {
        title: "Supply Chain Visibility",
        description: "Maintaining visibility throughout the supply chain is essential for effective planning and management of retail operations."
      },
      {
        title: "Inventory Allocation",
        description: "Balancing inventory across channels to prevent stockouts while minimizing excess inventory is increasingly challenging."
      }
    ],
    solutions: [
      {
        title: "Retail Compliance Expertise",
        description: "Our systems and processes are designed to meet the strict requirements of major retailers, including EDI integration, routing guide compliance, and proper packaging/labeling."
      },
      {
        title: "Omnichannel Fulfillment",
        description: "Unified inventory management and distribution capabilities across all channels, from palletized retail shipments to individual direct-to-consumer orders."
      },
      {
        title: "Integrated Technology Platform",
        description: "Real-time inventory tracking, order management, and reporting systems that integrate with your ERP, WMS, and other business systems."
      },
      {
        title: "Value-Added Services",
        description: "Retail preparation, display building, price ticketing, RFID tagging, and other specialized services to meet retailer requirements."
      }
    ],
    benefits: [
      "Minimize compliance chargebacks through adherence to retailer requirements",
      "Maintain unified inventory across all sales channels",
      "Reduce transportation costs through optimized distribution",
      "Improve fill rates and in-stock positions at retail locations",
      "Support omnichannel growth without infrastructure investment"
    ],
    statistics: [
      { value: "99.9%", label: "Retail Compliance Rate" },
      { value: "30%", label: "Average Reduction in Chargebacks" },
      { value: "15%", label: "Typical Inventory Carrying Cost Reduction" },
      { value: "45%", label: "Average Improvement in Order Cycle Time" }
    ],
    caseStudy: {
      title: "Supporting Omnichannel Growth for a Consumer Electronics Brand",
      clientName: "TechLife Products",
      description: [
        "TechLife Products, a growing consumer electronics brand, was expanding from purely online sales to include major retail chains. They needed a logistics partner who could handle both their e-commerce fulfillment and meet the strict compliance requirements of big-box retailers.",
        "TSG Fulfillment implemented an integrated logistics solution that unified TechLife's inventory across all channels. We established EDI connections with their retail partners, implemented routing guide compliance processes, and created a streamlined workflow for both palletized retail shipments and individual direct-to-consumer orders."
      ],
      results: [
        "Successfully launched in three major retail chains with zero compliance chargebacks",
        "Reduced overall logistics costs by 23% through consolidated shipping and inventory",
        "Maintained 99.8% in-stock rate at retail locations while reducing safety stock by 20%",
        "Supported 200% year-over-year growth without service disruptions"
      ]
    }
  },
  {
    title: "Health & Beauty",
    slug: "health-beauty",
    metaDescription: "Specialized fulfillment solutions for health, beauty, and personal care products with temperature control, batch tracking, and regulatory compliance.",
    headerImage: "https://images.unsplash.com/photo-1614859638024-82f09fca5668?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    shortDescription: "Specialized handling, storage, and distribution services designed specifically for health, beauty, and personal care products.",
    longDescription: [
      "Health and beauty products require specialized handling, storage, and shipping processes to maintain product integrity and meet regulatory requirements. TSG Fulfillment offers tailored logistics solutions for the unique needs of this sensitive product category.",
      "Our facilities feature temperature-controlled environments, batch and lot tracking capabilities, and specialized handling procedures for sensitive products. We understand the importance of proper handling for creams, serums, supplements, and other health and beauty items.",
      "Our experience with beauty subscription boxes, cosmetics retailers, and wellness brands ensures that your products are handled with care and delivered to your customers in perfect condition. We also manage expiration dates and implement FIFO (First-In, First-Out) inventory management to maximize product shelf life."
    ],
    challenges: [
      {
        title: "Temperature and Environmental Control",
        description: "Many health and beauty products require specific temperature and humidity conditions to maintain efficacy and shelf life."
      },
      {
        title: "Batch and Lot Tracking",
        description: "Proper tracking of manufacturing batches and lots is essential for quality control and potential recall management."
      },
      {
        title: "Expiration Date Management",
        description: "Products with limited shelf life require careful inventory management to prevent expired product shipments."
      },
      {
        title: "Special Packaging Requirements",
        description: "Beauty and personal care products often need specialized packaging to prevent leakage and damage during shipping."
      }
    ],
    solutions: [
      {
        title: "Climate-Controlled Facilities",
        description: "Warehousing environments specifically designed for health and beauty products with precise temperature and humidity controls."
      },
      {
        title: "Lot/Batch Control Systems",
        description: "Advanced tracking systems for complete batch and lot control with detailed reporting capabilities for regulatory compliance."
      },
      {
        title: "FIFO Inventory Management",
        description: "Strict First-In, First-Out inventory management processes to minimize the risk of product expiration before shipment."
      },
      {
        title: "Special Handling Procedures",
        description: "Custom handling protocols for delicate items, including specialized packing materials and methods for fragile containers."
      }
    ],
    benefits: [
      "Maintain product integrity through appropriate environmental controls",
      "Ensure regulatory compliance with lot tracking and documentation",
      "Reduce product waste through effective expiration date management",
      "Decrease damage rates with specialized handling procedures",
      "Enhance unboxing experience with careful packaging of premium products"
    ],
    statistics: [
      { value: "99.9%", label: "Product Integrity Rate" },
      { value: "<0.5%", label: "Damage Rate for Fragile Items" },
      { value: "100%", label: "Regulatory Compliance" },
      { value: "24/7", label: "Environmental Monitoring" }
    ],
    caseStudy: {
      title: "Streamlining Operations for a Premium Skincare Brand",
      clientName: "Pure Radiance Skincare",
      description: [
        "Pure Radiance Skincare, a premium organic skincare brand, was struggling with fulfillment challenges including temperature control requirements, batch tracking needs, and high customer expectations for packaging presentation.",
        "TSG Fulfillment implemented a comprehensive solution including temperature-controlled storage areas, detailed batch and expiration date tracking, and a custom packaging protocol that maintained the brand's luxury unboxing experience. We integrated with their Shopify Plus store for seamless order processing and inventory management."
      ],
      results: [
        "Reduced product damage and temperature excursions to virtually zero",
        "Implemented 100% accurate batch tracking system for full regulatory compliance",
        "Decreased order processing time by 65% while maintaining custom packaging requirements",
        "Supported 150% growth in order volume without service disruptions"
      ]
    }
  },
  {
    title: "Technology",
    slug: "technology",
    metaDescription: "Specialized fulfillment services for technology products with secure storage, careful handling, and serial number tracking.",
    headerImage: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    shortDescription: "Secure storage, handling, and distribution services designed specifically for electronic devices and technology products.",
    longDescription: [
      "Technology products require specialized handling, secure storage, and careful shipping procedures to prevent damage and ensure proper functionality upon delivery. TSG Fulfillment offers comprehensive logistics solutions tailored to the unique requirements of technology companies.",
      "Our facilities feature enhanced security systems, static-free handling areas, and specialized packing materials designed specifically for electronic devices. We implement serial number tracking for warranty management and maintain a secure chain of custody throughout the fulfillment process.",
      "From consumer electronics to enterprise hardware, our experienced team understands the importance of proper handling for technology products. We work with manufacturers, retailers, and direct-to-consumer technology brands to ensure their products arrive in perfect condition."
    ],
    challenges: [
      {
        title: "Product Security",
        description: "High-value technology items require enhanced security measures throughout the storage and fulfillment process."
      },
      {
        title: "Specialized Handling",
        description: "Electronic components and devices are sensitive to static electricity and physical damage, requiring careful handling procedures."
      },
      {
        title: "Serial Number Tracking",
        description: "Accurate tracking of serial numbers is essential for warranty management and potential recall situations."
      },
      {
        title: "Product Configuration",
        description: "Many technology orders require specific configuration, software installation, or testing before shipment."
      }
    ],
    solutions: [
      {
        title: "Enhanced Security Systems",
        description: "Secure storage areas with controlled access, 24/7 monitoring, and comprehensive security protocols for high-value items."
      },
      {
        title: "Static-Free Handling Areas",
        description: "Specialized workstations and handling procedures designed to prevent static damage to sensitive electronic components."
      },
      {
        title: "Advanced Serial Number Tracking",
        description: "Detailed tracking systems for complete serial number management with scanning verification at each fulfillment stage."
      },
      {
        title: "Configuration Services",
        description: "Technical capabilities for device configuration, software installation, testing, and quality assurance before shipment."
      }
    ],
    benefits: [
      "Reduce product damage with specialized handling procedures",
      "Maintain security and accountability for high-value items",
      "Streamline warranty management with accurate serial number tracking",
      "Decrease returns due to damage with proper packaging techniques",
      "Offer value-added services like configuration and testing"
    ],
    statistics: [
      { value: "<0.3%", label: "Damage Rate" },
      { value: "100%", label: "Serial Number Tracking Accuracy" },
      { value: "24/7", label: "Security Monitoring" },
      { value: "15%", label: "Average Reduction in Returns" }
    ],
    caseStudy: {
      title: "Optimizing Distribution for a Consumer Electronics Manufacturer",
      clientName: "InnovateTech Devices",
      description: [
        "InnovateTech Devices, a manufacturer of premium Bluetooth speakers and headphones, was experiencing challenges with their previous fulfillment provider including high damage rates, inaccurate serial number tracking, and security concerns.",
        "TSG Fulfillment implemented a comprehensive solution featuring a secure storage area, static-safe handling procedures, and an advanced serial number tracking system. We developed custom packaging that both protected the products during shipping and enhanced the unboxing experience for customers."
      ],
      results: [
        "Reduced shipping damage by 94% compared to previous fulfillment provider",
        "Implemented 100% accurate serial number tracking for warranty management",
        "Decreased returns due to damage or defects by 87%",
        "Cut fulfillment processing time by 40% while improving accuracy"
      ]
    }
  },
  {
    title: "Food & Beverage",
    slug: "food-beverage",
    metaDescription: "Temperature-controlled storage and specialized handling for food and beverage products with strict adherence to safety regulations.",
    headerImage: "https://images.unsplash.com/photo-1576807444883-ab5e3a3cf241?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    shortDescription: "Temperature-controlled storage and specialized distribution services for food and beverage products with full regulatory compliance.",
    longDescription: [
      "Food and beverage products require specialized handling, temperature control, and strict adherence to safety regulations throughout the supply chain. TSG Fulfillment offers comprehensive logistics solutions tailored to the unique requirements of food and beverage companies.",
      "Our facilities include temperature-controlled storage areas for ambient, refrigerated, and frozen products, with continuous monitoring systems to ensure temperature stability. We maintain strict compliance with all food safety regulations, including FDA requirements and HACCP principles.",
      "From specialty food producers to beverage manufacturers, our experienced team understands the importance of proper handling, rotation, and shipping procedures for perishable items. We help you deliver fresh, safe products to your customers while maintaining regulatory compliance."
    ],
    challenges: [
      {
        title: "Temperature Control",
        description: "Food and beverage products often require specific temperature ranges during storage and shipping to maintain quality and safety."
      },
      {
        title: "Regulatory Compliance",
        description: "Strict adherence to FDA, USDA, and other regulatory requirements is essential for food and beverage operations."
      },
      {
        title: "Shelf Life Management",
        description: "Perishable products require effective inventory management to ensure freshness and minimize waste."
      },
      {
        title: "Recall Readiness",
        description: "Food and beverage companies must be prepared for potential recalls with detailed lot tracking and documentation."
      }
    ],
    solutions: [
      {
        title: "Temperature-Controlled Facilities",
        description: "Specialized storage areas for ambient, refrigerated, and frozen products with continuous temperature monitoring and alerting systems."
      },
      {
        title: "Regulatory Compliance Systems",
        description: "Processes and documentation designed to maintain compliance with all applicable food safety regulations and standards."
      },
      {
        title: "Advanced Lot Tracking",
        description: "Detailed tracking systems for complete lot control with expiration date management and FEFO (First Expired, First Out) inventory handling."
      },
      {
        title: "Recall Management Capabilities",
        description: "Comprehensive systems and processes for rapid response to recall situations, including detailed record-keeping and reporting."
      }
    ],
    benefits: [
      "Maintain product quality through appropriate temperature control",
      "Ensure regulatory compliance with proper documentation and processes",
      "Reduce product waste through effective expiration date management",
      "Manage recalls efficiently if they occur",
      "Deliver fresh products to customers consistently"
    ],
    statistics: [
      { value: "100%", label: "Temperature Compliance" },
      { value: "<0.5%", label: "Product Waste Rate" },
      { value: "99.9%", label: "Inventory Accuracy" },
      { value: "24/7", label: "Temperature Monitoring" }
    ],
    caseStudy: {
      title: "Expanding Distribution for a Specialty Food Producer",
      clientName: "Gourmet Selections",
      description: [
        "Gourmet Selections, a producer of premium specialty foods, was looking to expand their distribution beyond regional markets but faced challenges with temperature control requirements and regulatory compliance in multiple jurisdictions.",
        "TSG Fulfillment implemented a comprehensive solution featuring temperature-controlled storage areas, lot tracking systems, and regulatory compliance protocols. We developed a distribution strategy that maintained product integrity throughout the shipping process while optimizing costs."
      ],
      results: [
        "Successfully expanded distribution to national markets with zero temperature excursions",
        "Maintained 100% regulatory compliance across all jurisdictions",
        "Reduced product waste due to expiration by 95%",
        "Decreased shipping costs by 28% through optimized distribution network"
      ]
    }
  },
  {
    title: "Subscription Boxes",
    slug: "subscription-boxes",
    metaDescription: "Specialized fulfillment services for subscription box businesses, from inventory management to custom kitting and assembly.",
    headerImage: "https://images.unsplash.com/photo-1608634950167-6c6c8412ba4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    shortDescription: "End-to-end fulfillment solutions for subscription box businesses, from inventory management to custom kitting and timely shipping.",
    longDescription: [
      "Subscription box businesses face unique logistics challenges, from managing ever-changing product assortments to coordinating high-volume shipping on a regular schedule. TSG Fulfillment offers specialized solutions designed specifically for subscription box companies.",
      "Our subscription box fulfillment services include inventory management for diverse product assortments, custom kitting and assembly, and coordinated mass shipping to ensure all subscribers receive their boxes within a tight timeframe. We help you create a consistent, high-quality unboxing experience that delights your subscribers.",
      "From beauty boxes to meal kits to hobby crates, our experienced team understands the importance of presentation, accuracy, and timing in the subscription box business. We work with companies of all sizes to optimize their fulfillment operations and support growth."
    ],
    challenges: [
      {
        title: "Product Variety Management",
        description: "Subscription boxes typically contain multiple diverse items that change monthly, creating complex inventory management challenges."
      },
      {
        title: "Timing Coordination",
        description: "Most subscription boxes ship within a narrow timeframe each month, requiring careful planning and execution."
      },
      {
        title: "Kitting Complexity",
        description: "Boxes often require precise arrangement of items according to specific instructions, sometimes with variations based on subscriber preferences."
      },
      {
        title: "Presentation Quality",
        description: "The unboxing experience is critical for subscription businesses, requiring attention to detail in packaging and presentation."
      }
    ],
    solutions: [
      {
        title: "Specialized Inventory Systems",
        description: "Advanced inventory management for diverse product assortments with accurate tracking of components for each month's box."
      },
      {
        title: "Scheduled Mass Fulfillment",
        description: "Coordinated fulfillment operations designed to process large volumes of similar orders within tight timeframes."
      },
      {
        title: "Custom Kitting Stations",
        description: "Dedicated assembly areas with detailed work instructions and quality control processes to ensure accurate box assembly."
      },
      {
        title: "Presentation Optimization",
        description: "Specialized packaging processes to maintain the intended presentation and unboxing experience for subscribers."
      }
    ],
    benefits: [
      "Manage complex inventory for changing box contents efficiently",
      "Ship all subscriber boxes within tight timeframes consistently",
      "Maintain high-quality presentation for an excellent unboxing experience",
      "Scale operations quickly to accommodate subscriber growth",
      "Reduce operational complexity to focus on curation and marketing"
    ],
    statistics: [
      { value: "99.9%", label: "Kitting Accuracy" },
      { value: "100%", label: "On-Time Shipping for Monthly Cycles" },
      { value: "48 Hours", label: "Typical Fulfillment Window for Complete Subscriber Base" },
      { value: "40%", label: "Average Cost Reduction vs. In-House Fulfillment" }
    ],
    caseStudy: {
      title: "Scaling Operations for a Growing Beauty Subscription Service",
      clientName: "Glow Beauty Box",
      description: [
        "Glow Beauty Box, a subscription service delivering curated beauty products monthly, was experiencing rapid growth that outpaced their in-house fulfillment capabilities. They needed a partner who could maintain their premium unboxing experience while handling increasing volume.",
        "TSG Fulfillment implemented a comprehensive solution featuring specialized inventory management for their diverse beauty products, custom kitting stations with detailed assembly instructions, and quality control processes to ensure consistent presentation. We coordinated monthly mass shipping to ensure all subscribers received their boxes within a three-day window."
      ],
      results: [
        "Successfully scaled from 5,000 to 50,000 monthly subscribers without service disruptions",
        "Reduced fulfillment time from two weeks to 48 hours for the entire subscriber base",
        "Maintained 99.98% assembly accuracy despite complex box configurations",
        "Decreased fulfillment costs by 35% compared to previous in-house operations"
      ]
    }
  }
];

const IndustryDetail: React.FC = () => {
  const [, params] = useRoute('/industries/:slug');
  const slug = params?.slug || '';
  
  const industry = industries.find(i => i.slug === slug);
  
  if (!industry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Industry Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">The industry you're looking for doesn't exist or the URL may be incorrect.</p>
          <Link href="/#industries">
            <Button className="bg-primary text-white hover:bg-primary/90">
              View All Industries
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Create structured data for this industry page
  const industrySchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${industry.title} Fulfillment Solutions`,
    "description": industry.metaDescription,
    "provider": {
      "@type": "Organization",
      "name": "TSG Fulfillment Services",
      "url": "https://tsgfulfillment.com"
    },
    "serviceType": "Logistics and Fulfillment",
    "audience": {
      "@type": "BusinessAudience",
      "audienceType": industry.title
    },
    "serviceOutput": industry.solutions.map(solution => solution.title).join(", "),
    "offers": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": `${industry.title} Logistics Solutions`,
        "description": industry.shortDescription
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{industry.title} Logistics & Fulfillment Solutions | TSG Fulfillment</title>
        <meta name="description" content={industry.metaDescription} />
        <meta name="keywords" content={`${industry.title.toLowerCase()} fulfillment, ${industry.title.toLowerCase()} logistics, warehouse solutions, supply chain, canadian fulfillment, order processing, inventory management, vaughan ontario`} />
        <meta property="og:title" content={`${industry.title} Logistics & Fulfillment Solutions | TSG Fulfillment`} />
        <meta property="og:description" content={industry.metaDescription} />
        <meta property="og:image" content={industry.headerImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://tsgfulfillment.com/industries/${industry.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${industry.title} Logistics & Fulfillment Solutions | TSG Fulfillment`} />
        <meta name="twitter:description" content={industry.metaDescription} />
        <meta name="twitter:image" content={industry.headerImage} />
        <link rel="canonical" href={`https://tsgfulfillment.com/industries/${industry.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(industrySchema)}
        </script>
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <OptimizedImage 
            src={industry.headerImage}
            alt={`${industry.title} logistics and fulfillment services`}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 py-16 md:py-20">
          {/* Breadcrumb */}
          <div className="mb-8 text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/#industries" className="hover:text-white">Industries</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{industry.title}</span>
          </div>
          
          <div className="max-w-4xl">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {industry.title} <span className="font-light">Logistics</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/90 mb-8 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {industry.shortDescription}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 100,
                      behavior: 'smooth',
                    });
                  } else {
                    window.location.href = '/#contact';
                  }
                }}
              >
                Request a Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Overview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-8 text-center">Industry Overview</h2>
              {industry.longDescription.map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-6 text-lg">
                  {paragraph}
                </p>
              ))}
            </motion.div>
            
            {/* Statistics */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 my-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              {industry.statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Challenges & Solutions Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry Challenges & Our Solutions</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We understand the unique challenges faced by {industry.title.toLowerCase()} businesses. 
              Our tailored solutions address these specific pain points to optimize your logistics operations.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Challenges */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">Key Challenges</h3>
              <div className="space-y-6">
                {industry.challenges.map((challenge, index) => (
                  <Card key={index} className="border-l-4 border-red-500 shadow-md">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-2">{challenge.title}</h4>
                      <p className="text-gray-600">{challenge.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            {/* Solutions */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">Our Solutions</h3>
              <div className="space-y-6">
                {industry.solutions.map((solution, index) => (
                  <Card key={index} className="border-l-4 border-green-500 shadow-md">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-2">{solution.title}</h4>
                      <p className="text-gray-600">{solution.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Benefits</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Partner with TSG Fulfillment to optimize your {industry.title.toLowerCase()} logistics 
              operations and gain these competitive advantages:
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            {industry.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="text-green-500 h-6 w-6 mt-1 mr-4 flex-shrink-0" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Case Study Section */}
      {industry.caseStudy && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-6 text-center">Case Study</h2>
              <Card className="shadow-lg border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-primary">{industry.caseStudy.title}</h3>
                  <p className="text-lg font-medium mb-6">Client: {industry.caseStudy.clientName}</p>
                  
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-3">Challenge & Solution</h4>
                    {industry.caseStudy.description.map((paragraph, index) => (
                      <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold mb-3">Results</h4>
                    <ul className="space-y-2">
                      {industry.caseStudy.results.map((result, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="text-green-500 h-5 w-5 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Optimize Your {industry.title} Logistics?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Contact our team for a free consultation and discover how our specialized solutions for the {industry.title.toLowerCase()} industry can help you streamline operations, reduce costs, and improve customer satisfaction.
            </p>
            <Button 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8 py-6 transition-all"
              onClick={() => {
                window.location.href = '/#contact';
              }}
            >
              Contact Us Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Related Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Related Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive logistics solutions that support {industry.title.toLowerCase()} businesses:
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <Card className="shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <CardContent className="p-6">
                <Warehouse className="text-primary w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-3">Warehousing</h3>
                <p className="text-gray-600 mb-4">
                  Strategic warehouse facilities optimized for {industry.title.toLowerCase()} products with security, 
                  environmental controls, and inventory management.
                </p>
                <Link href="/services/warehousing" className="text-primary font-medium flex items-center hover:underline">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <CardContent className="p-6">
                <Package className="text-primary w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-3">Fulfillment</h3>
                <p className="text-gray-600 mb-4">
                  End-to-end order fulfillment services tailored for {industry.title.toLowerCase()} businesses, 
                  from receiving to shipping.
                </p>
                <Link href="/services/fulfillment" className="text-primary font-medium flex items-center hover:underline">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <CardContent className="p-6">
                <Truck className="text-primary w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-3">Transportation</h3>
                <p className="text-gray-600 mb-4">
                  Optimized shipping solutions for {industry.title.toLowerCase()} products with carrier selection, 
                  route planning, and delivery tracking.
                </p>
                <Link href="/services/transportation" className="text-primary font-medium flex items-center hover:underline">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default IndustryDetail;