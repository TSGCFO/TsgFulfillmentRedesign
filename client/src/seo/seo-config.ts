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
  home: {
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
    "logo": `${SITE_CONFIG.siteUrl}/images/logo.png`,
    "image": `${SITE_CONFIG.siteUrl}/images/organization-image.jpg`,
    "description": SITE_CONFIG.defaultDescription,
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      ...BUSINESS_INFO.address
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
            "description": "Complete order processing and shipping services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Warehousing",
            "description": "Secure inventory storage and management"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Kitting Services",
            "description": "Product assembly and packaging solutions"
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
    "image": `${SITE_CONFIG.siteUrl}/images/warehouse-exterior.jpg`,
    "url": SITE_CONFIG.siteUrl,
    "telephone": BUSINESS_INFO.contact.phone,
    "email": BUSINESS_INFO.contact.email,
    "address": {
      "@type": "PostalAddress",
      ...BUSINESS_INFO.address
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
    "areaServed": {
      "@type": "State",
      "name": "Ontario"
    }
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
      "@id": `${SITE_CONFIG.siteUrl}#organization`
    },
    "areaServed": {
      "@type": "State",
      "name": "Ontario"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": serviceName,
      "itemListElement": [{
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": serviceName,
          "description": description
        }
      }]
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