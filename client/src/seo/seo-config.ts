/**
 * Centralized SEO Configuration for TSG Fulfillment
 * This file contains all SEO metadata, structured data templates, and optimization settings
 */

export const SITE_CONFIG = {
  siteName: 'TSG Fulfillment Services',
  siteUrl: 'https://tsgfulfillment.com',
  defaultTitle: 'TSG Fulfillment Services | Modern Logistics Solutions',
  defaultDescription: 'Professional order fulfillment, warehousing, kitting, and logistics solutions for eCommerce and retail businesses. Strategic locations across Ontario.',
  defaultKeywords: 'fulfillment services, warehousing, order fulfillment, kitting services, logistics, ecommerce fulfillment, retail fulfillment, inventory management, freight forwarding, supply chain management, distribution center, Toronto fulfillment, Ontario logistics',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@tsgfulfillment',
  fbAppId: '',
  language: 'en',
  locale: 'en_CA',
  themeColor: '#0056B3',
  backgroundColor: '#ffffff'
};

export const BUSINESS_INFO = {
  name: 'TSG Fulfillment Services',
  legalName: 'TSG Fulfillment Services Inc.',
  address: {
    streetAddress: '6750 Langstaff Road',
    addressLocality: 'Vaughan',
    addressRegion: 'Ontario',
    postalCode: 'L4H 5K2',
    addressCountry: 'CA'
  },
  coordinates: {
    latitude: 43.7866333,
    longitude: -79.6527142
  },
  contact: {
    phone: '+1-289-815-5869',
    email: 'info@tsgfulfillment.com',
    website: 'https://tsgfulfillment.com'
  },
  hours: {
    monday: '09:00-17:00',
    tuesday: '09:00-17:00',
    wednesday: '09:00-17:00',
    thursday: '09:00-17:00',
    friday: '09:00-17:00',
    saturday: 'closed',
    sunday: 'closed'
  },
  socialMedia: {
    facebook: 'https://www.facebook.com/tsgfulfillment',
    linkedin: 'https://www.linkedin.com/company/tsg-fulfillment',
    twitter: 'https://twitter.com/tsgfulfillment'
  }
};

export const PAGE_TEMPLATES = {
  homepage: {
    title: 'TSG Fulfillment Services | Professional Order Fulfillment & Warehousing',
    description: 'Leading fulfillment center in Ontario providing comprehensive order fulfillment, warehousing, kitting, and logistics solutions for eCommerce and retail businesses.',
    keywords: 'order fulfillment Ontario, warehousing services Toronto, ecommerce fulfillment Canada, logistics solutions GTA, inventory management, distribution center Vaughan',
    ogType: 'website' as const
  },
  services: {
    title: 'Fulfillment Services | Warehousing, Kitting & Logistics - TSG Fulfillment',
    description: 'Complete fulfillment services including order processing, inventory management, kitting, assembly, and freight forwarding. Scalable solutions for growing businesses.',
    keywords: 'fulfillment services, warehousing solutions, kitting services, order processing, inventory management, freight forwarding, value added services',
    ogType: 'website' as const
  },
  about: {
    title: 'About TSG Fulfillment | Leading Logistics Provider in Ontario',
    description: 'Learn about TSG Fulfillment\'s mission to provide exceptional fulfillment and logistics services. Our team, values, and commitment to client success.',
    keywords: 'TSG Fulfillment about, logistics company Ontario, fulfillment provider history, warehousing expertise, supply chain solutions',
    ogType: 'website' as const
  },
  contact: {
    title: 'Contact TSG Fulfillment | Get a Quote for Fulfillment Services',
    description: 'Contact TSG Fulfillment for personalized quotes on warehousing, order fulfillment, and logistics services. Located in Vaughan, Ontario.',
    keywords: 'contact TSG Fulfillment, fulfillment quote, warehousing inquiry, logistics consultation, Vaughan fulfillment center',
    ogType: 'website' as const
  },
  locations: {
    title: 'TSG Fulfillment Location | Vaughan Ontario Distribution Center',
    description: 'Visit our modern fulfillment center in Vaughan, Ontario. Strategic location serving the Greater Toronto Area with comprehensive logistics solutions.',
    keywords: 'TSG Fulfillment location, Vaughan distribution center, Ontario fulfillment facility, GTA logistics hub, warehousing location',
    ogType: 'place' as const
  },
  quote: {
    title: 'Request a Quote | Custom Fulfillment Solutions - TSG Fulfillment',
    description: 'Get a personalized quote for fulfillment services tailored to your business needs. Fast response and competitive pricing for all logistics solutions.',
    keywords: 'fulfillment quote, warehousing pricing, logistics cost estimate, custom fulfillment solution, order processing quote',
    ogType: 'website' as const
  },
  analytics: {
    title: 'Analytics Dashboard | Performance Metrics - TSG Fulfillment',
    description: 'Access comprehensive analytics and performance metrics for your fulfillment operations. Real-time tracking and detailed reporting for optimized logistics.',
    keywords: 'fulfillment analytics, logistics dashboard, inventory tracking, performance metrics, warehouse analytics, order tracking',
    ogType: 'website' as const
  },
  reports: {
    title: 'Report Generator | Custom Analytics Reports - TSG Fulfillment',
    description: 'Generate custom reports for your fulfillment operations. Detailed analytics on inventory, orders, and performance metrics for data-driven decisions.',
    keywords: 'fulfillment reports, custom analytics, inventory reports, logistics reporting, warehouse performance, data analytics',
    ogType: 'website' as const
  },
  comparison: {
    title: 'Performance Comparison | Benchmarking Tool - TSG Fulfillment',
    description: 'Compare fulfillment performance metrics and benchmark against industry standards. Optimize your logistics operations with detailed comparisons.',
    keywords: 'performance comparison, fulfillment benchmarking, logistics metrics, warehouse efficiency, industry comparison',
    ogType: 'website' as const
  },
  dashboard: {
    title: 'Custom Dashboard | Personalized Analytics - TSG Fulfillment',
    description: 'Create personalized dashboards for your fulfillment operations. Customize metrics, reports, and analytics to match your business needs.',
    keywords: 'custom dashboard, personalized analytics, fulfillment metrics, logistics dashboard, warehouse analytics',
    ogType: 'website' as const
  }
};

export const STRUCTURED_DATA_TEMPLATES = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.siteUrl}#organization`,
    "name": BUSINESS_INFO.name,
    "legalName": BUSINESS_INFO.legalName,
    "url": SITE_CONFIG.siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_CONFIG.siteUrl}/images/logo.png`,
      "width": 300,
      "height": 100
    },
    "image": {
      "@type": "ImageObject", 
      "url": `${SITE_CONFIG.siteUrl}/images/organization-image.jpg`,
      "width": 1200,
      "height": 630
    },
    "description": SITE_CONFIG.defaultDescription,
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_INFO.address.streetAddress,
      "addressLocality": BUSINESS_INFO.address.addressLocality,
      "addressRegion": BUSINESS_INFO.address.addressRegion,
      "postalCode": BUSINESS_INFO.address.postalCode,
      "addressCountry": BUSINESS_INFO.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.coordinates.latitude,
      "longitude": BUSINESS_INFO.coordinates.longitude
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": BUSINESS_INFO.contact.phone,
      "contactType": "customer service",
      "email": BUSINESS_INFO.contact.email,
      "areaServed": ["CA", "Ontario", "Toronto", "GTA"],
      "availableLanguage": ["English"]
    },
    "sameAs": Object.values(BUSINESS_INFO.socialMedia),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Fulfillment Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Order Fulfillment",
            "description": "Complete order processing and shipping services",
            "provider": {
              "@type": "Organization",
              "name": BUSINESS_INFO.name
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Warehousing",
            "description": "Secure inventory storage and management",
            "provider": {
              "@type": "Organization",
              "name": BUSINESS_INFO.name
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Kitting Services", 
            "description": "Product assembly and packaging solutions",
            "provider": {
              "@type": "Organization",
              "name": BUSINESS_INFO.name
            }
          }
        }
      ]
    }
  },

  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.siteUrl}#localbusiness`,
    "name": BUSINESS_INFO.name,
    "image": {
      "@type": "ImageObject",
      "url": `${SITE_CONFIG.siteUrl}/images/warehouse-exterior.jpg`,
      "width": 1200,
      "height": 800
    },
    "url": SITE_CONFIG.siteUrl,
    "telephone": BUSINESS_INFO.contact.phone,
    "email": BUSINESS_INFO.contact.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_INFO.address.streetAddress,
      "addressLocality": BUSINESS_INFO.address.addressLocality,
      "addressRegion": BUSINESS_INFO.address.addressRegion,
      "postalCode": BUSINESS_INFO.address.postalCode,
      "addressCountry": BUSINESS_INFO.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.coordinates.latitude,
      "longitude": BUSINESS_INFO.coordinates.longitude
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "$$",
    "areaServed": [
      {
        "@type": "State",
        "name": "Ontario"
      },
      {
        "@type": "City", 
        "name": "Toronto"
      },
      {
        "@type": "City",
        "name": "Vaughan"
      }
    ]
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.siteUrl}#website`,
    "url": SITE_CONFIG.siteUrl,
    "name": SITE_CONFIG.siteName,
    "description": SITE_CONFIG.defaultDescription,
    "publisher": {
      "@id": `${SITE_CONFIG.siteUrl}#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_CONFIG.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  },

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_CONFIG.siteUrl}${item.url}`
    }))
  }),

  service: (serviceName: string, description: string, url: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": description,
    "url": `${SITE_CONFIG.siteUrl}${url}`,
    "provider": {
      "@type": "Organization",
      "name": BUSINESS_INFO.name,
      "url": SITE_CONFIG.siteUrl
    },
    "areaServed": [
      {
        "@type": "State",
        "name": "Ontario"
      },
      {
        "@type": "Country",
        "name": "Canada"
      }
    ],
    "serviceType": "Logistics and Fulfillment Services",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "CAD"
    }
  }),

  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }),

  article: (title: string, description: string, datePublished: string, dateModified?: string) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": {
      "@type": "ImageObject",
      "url": `${SITE_CONFIG.siteUrl}/images/og-default.jpg`,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Organization",
      "name": BUSINESS_INFO.name,
      "url": SITE_CONFIG.siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": BUSINESS_INFO.name,
      "url": SITE_CONFIG.siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_CONFIG.siteUrl}/images/logo.png`,
        "width": 300,
        "height": 100
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": SITE_CONFIG.siteUrl
    }
  }),

  howTo: (name: string, description: string, steps: Array<{ name: string; text: string }>) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "image": {
      "@type": "ImageObject",
      "url": `${SITE_CONFIG.siteUrl}/images/og-default.jpg`,
      "width": 1200,
      "height": 630
    },
    "totalTime": "PT30M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "CAD",
      "value": "0"
    },
    "supply": [{
      "@type": "HowToSupply",
      "name": "Business Information"
    }],
    "tool": [{
      "@type": "HowToTool",
      "name": "TSG Fulfillment Services"
    }],
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "name": step.name,
      "text": step.text,
      "url": `${SITE_CONFIG.siteUrl}#step-${index + 1}`,
      "image": {
        "@type": "ImageObject", 
        "url": `${SITE_CONFIG.siteUrl}/images/og-default.jpg`
      }
    }))
  }),

  testimonial: (testimonials: Array<{ name: string; text: string; company?: string; rating?: number; position?: string }>) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BUSINESS_INFO.name,
    "url": SITE_CONFIG.siteUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 5.0,
      "reviewCount": testimonials.length,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": testimonials.map((testimonial, index) => ({
      "@type": "Review",
      "@id": `${SITE_CONFIG.siteUrl}/reviews/${index + 1}`,
      "datePublished": "2024-01-01",
      "reviewBody": testimonial.text,
      "author": {
        "@type": "Person",
        "name": testimonial.name,
        "jobTitle": testimonial.position,
        "worksFor": testimonial.company ? {
          "@type": "Organization",
          "name": testimonial.company
        } : undefined
      },
      "reviewRating": testimonial.rating ? {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": 5,
        "worstRating": 1
      } : undefined,
      "itemReviewed": {
        "@type": "Service",
        "name": "TSG Fulfillment Services",
        "description": "Professional logistics and fulfillment services"
      }
    }))
  })
};

export const META_ROBOTS = {
  index: 'index, follow',
  noindex: 'noindex, nofollow',
  indexNoFollow: 'index, nofollow',
  noindexFollow: 'noindex, follow'
};

export const PRELOAD_RESOURCES = [
  { href: '/fonts/poppins-v20-latin-regular.woff2', as: 'font' as const, type: 'font/woff2', crossorigin: 'anonymous' as const },
  { href: '/fonts/poppins-v20-latin-600.woff2', as: 'font' as const, type: 'font/woff2', crossorigin: 'anonymous' as const },
  { href: '/images/logo.png', as: 'image' as const, fetchpriority: 'high' as const }
];

// Service-specific SEO data for dynamic service pages
export const SERVICE_SEO_DATA = {
  'value-added-services': {
    title: 'Value-Added Services | Custom Kitting & Assembly - TSG Fulfillment',
    description: 'Professional value-added services including custom kitting, product assembly, labeling, and packaging solutions. Enhance your products with our specialized services.',
    keywords: 'value added services, kitting services, product assembly, custom packaging, labeling services, fulfillment solutions',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Value-Added Services', description, '/services/value-added-services')
  },
  'warehousing': {
    title: 'Warehousing Services | Secure Storage Solutions - TSG Fulfillment',
    description: 'Secure and scalable warehousing solutions with advanced inventory management. Climate-controlled storage for all product types in our Ontario facility.',
    keywords: 'warehousing services, inventory storage, warehouse management, secure storage, climate controlled, inventory tracking',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Warehousing', description, '/services/warehousing')
  },
  'order-fulfillment': {
    title: 'Order Fulfillment Services | Pick, Pack & Ship - TSG Fulfillment',
    description: 'Complete order fulfillment services including picking, packing, and shipping. Fast and accurate order processing for eCommerce and retail businesses.',
    keywords: 'order fulfillment, pick pack ship, ecommerce fulfillment, order processing, shipping services, logistics solutions',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Order Fulfillment', description, '/services/order-fulfillment')
  },
  'freight-forwarding': {
    title: 'Freight Forwarding | International Shipping - TSG Fulfillment',
    description: 'Professional freight forwarding services for domestic and international shipping. Expert handling of customs, documentation, and logistics coordination.',
    keywords: 'freight forwarding, international shipping, customs clearance, logistics coordination, shipping solutions, freight services',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Freight Forwarding', description, '/services/freight-forwarding')
  },
  'returns-processing': {
    title: 'Returns Processing | Reverse Logistics - TSG Fulfillment',
    description: 'Efficient returns processing and reverse logistics solutions. Streamlined handling of product returns, refurbishment, and inventory restocking.',
    keywords: 'returns processing, reverse logistics, product returns, refurbishment services, inventory restocking, return management',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Returns Processing', description, '/services/returns-processing')
  }
};

// Industry-specific SEO data for dynamic industry pages
export const INDUSTRY_SEO_DATA = {
  'ecommerce': {
    title: 'eCommerce Fulfillment Services | Online Retail Solutions - TSG',
    description: 'Specialized eCommerce fulfillment services for online retailers. Seamless integration with major platforms, fast shipping, and scalable solutions.',
    keywords: 'ecommerce fulfillment, online retail fulfillment, shopify fulfillment, amazon fulfillment, marketplace integration',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('eCommerce Fulfillment', description, '/industries/ecommerce')
  },
  'healthcare': {
    title: 'Healthcare Logistics | Medical Supply Fulfillment - TSG',
    description: 'Specialized healthcare logistics and medical supply fulfillment. Compliant handling of medical devices, pharmaceuticals, and healthcare products.',
    keywords: 'healthcare logistics, medical supply fulfillment, pharmaceutical logistics, medical device storage, healthcare compliance',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Healthcare Logistics', description, '/industries/healthcare')
  },
  'retail': {
    title: 'Retail Fulfillment Services | B2B & B2C Solutions - TSG',
    description: 'Comprehensive retail fulfillment services for both B2B and B2C operations. Store replenishment, direct-to-consumer shipping, and retail logistics.',
    keywords: 'retail fulfillment, B2B fulfillment, B2C fulfillment, store replenishment, retail logistics, distribution services',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Retail Fulfillment', description, '/industries/retail')
  },
  'technology': {
    title: 'Technology Product Fulfillment | Electronics Logistics - TSG',
    description: 'Specialized fulfillment services for technology products and electronics. Secure handling, anti-static environments, and technical expertise.',
    keywords: 'technology fulfillment, electronics logistics, tech product storage, computer fulfillment, electronics distribution',
    structuredData: (description: string) => STRUCTURED_DATA_TEMPLATES.service('Technology Fulfillment', description, '/industries/technology')
  }
};