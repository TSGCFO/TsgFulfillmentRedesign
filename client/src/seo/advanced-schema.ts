/**
 * Advanced Schema Markup Templates
 * Extended structured data for enhanced search visibility
 */

import { SITE_CONFIG, BUSINESS_INFO } from './seo-config';

export const ADVANCED_SCHEMA_TEMPLATES = {
  /**
   * Product/Service Catalog Schema
   */
  serviceCatalog: {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "TSG Fulfillment Services Catalog",
    "description": "Comprehensive catalog of fulfillment and logistics services",
    "numberOfItems": 6,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Service",
          "name": "Order Fulfillment",
          "description": "Complete order processing, picking, packing, and shipping services",
          "provider": {
            "@type": "Organization",
            "name": "TSG Fulfillment Services",
            "url": SITE_CONFIG.siteUrl
          },
          "areaServed": { "@type": "State", "name": "Ontario" },
          "serviceType": "Logistics Service"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Service",
          "name": "Warehousing",
          "description": "Secure inventory storage and warehouse management solutions",
          "provider": {
            "@type": "Organization",
            "name": "TSG Fulfillment Services",
            "url": SITE_CONFIG.siteUrl
          },
          "areaServed": { "@type": "State", "name": "Ontario" },
          "serviceType": "Storage Service"
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Service",
          "name": "Kitting Services",
          "description": "Product assembly, bundling, and custom packaging solutions",
          "provider": {
            "@type": "Organization",
            "name": "TSG Fulfillment Services",
            "url": SITE_CONFIG.siteUrl
          },
          "areaServed": { "@type": "State", "name": "Ontario" },
          "serviceType": "Value-Added Service"
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Service",
          "name": "Freight Forwarding",
          "description": "International and domestic freight forwarding and shipping",
          "provider": {
            "@type": "Organization",
            "name": "TSG Fulfillment Services",
            "url": SITE_CONFIG.siteUrl
          },
          "areaServed": [
            { "@type": "State", "name": "Ontario" },
            { "@type": "Country", "name": "Canada" }
          ],
          "serviceType": "Freight Service"
        }
      },
      {
        "@type": "ListItem",
        "position": 5,
        "item": {
          "@type": "Service",
          "name": "Inventory Management",
          "description": "Real-time inventory tracking and management systems",
          "provider": {
            "@type": "Organization",
            "name": "TSG Fulfillment Services",
            "url": SITE_CONFIG.siteUrl
          },
          "areaServed": { "@type": "State", "name": "Ontario" },
          "serviceType": "Management Service"
        }
      },
      {
        "@type": "ListItem",
        "position": 6,
        "item": {
          "@type": "Service",
          "name": "Returns Processing",
          "description": "Efficient returns handling and reverse logistics",
          "provider": {
            "@type": "Organization",
            "name": "TSG Fulfillment Services",
            "url": SITE_CONFIG.siteUrl
          },
          "areaServed": { "@type": "State", "name": "Ontario" },
          "serviceType": "Logistics Service"
        }
      }
    ]
  },

  /**
   * Professional Service Schema
   */
  professionalService: {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_CONFIG.siteUrl}#professionalservice`,
    "name": BUSINESS_INFO.name,
    "alternateName": "TSG Fulfillment",
    "description": "Professional fulfillment and logistics services provider specializing in order fulfillment, warehousing, and supply chain management",
    "url": SITE_CONFIG.siteUrl,
    "logo": `${SITE_CONFIG.siteUrl}/images/logo.png`,
    "image": [
      `${SITE_CONFIG.siteUrl}/images/warehouse-exterior.jpg`,
      `${SITE_CONFIG.siteUrl}/images/warehouse-interior.jpg`,
      `${SITE_CONFIG.siteUrl}/images/fulfillment-operations.jpg`
    ],
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
    "currenciesAccepted": ["CAD", "USD"],
    "paymentAccepted": ["Credit Card", "Bank Transfer", "Invoice"],
    "areaServed": [
      {
        "@type": "State",
        "name": "Ontario",
        "containedInPlace": {
          "@type": "Country",
          "name": "Canada"
        }
      },
      {
        "@type": "City",
        "name": "Toronto",
        "containedInPlace": {
          "@type": "State",
          "name": "Ontario"
        }
      },
      {
        "@type": "AdministrativeArea",
        "name": "Greater Toronto Area"
      }
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": BUSINESS_INFO.coordinates.latitude,
        "longitude": BUSINESS_INFO.coordinates.longitude
      },
      "geoRadius": "500000"
    },
    "knowsAbout": [
      "Order Fulfillment",
      "Warehousing",
      "Inventory Management",
      "Supply Chain Management",
      "Logistics",
      "Kitting Services",
      "Freight Forwarding",
      "eCommerce Fulfillment",
      "Retail Fulfillment"
    ],
    "slogan": "Your Partner in Professional Fulfillment Solutions",
    "founder": {
      "@type": "Person",
      "name": "TSG Fulfillment Team"
    },
    "foundingDate": "2020-01-01",
    "employee": [
      {
        "@type": "Person",
        "name": "Customer Service Team",
        "jobTitle": "Customer Success Specialists"
      },
      {
        "@type": "Person",
        "name": "Operations Team",
        "jobTitle": "Fulfillment Operations"
      },
      {
        "@type": "Person",
        "name": "Logistics Team",
        "jobTitle": "Logistics Coordinators"
      }
    ]
  },

  /**
   * Aggregated Rating Schema
   */
  aggregateRating: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.siteUrl}#organization`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  },

  /**
   * Contact Point Schema
   */
  contactPoints: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.siteUrl}#organization`,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": BUSINESS_INFO.contact.phone,
        "contactType": "customer service",
        "email": BUSINESS_INFO.contact.email,
        "areaServed": ["CA", "Ontario", "Toronto"],
        "availableLanguage": ["English"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }
      },
      {
        "@type": "ContactPoint",
        "telephone": BUSINESS_INFO.contact.phone,
        "contactType": "sales",
        "email": "sales@tsgfulfillment.com",
        "areaServed": ["CA", "Ontario", "Toronto"],
        "availableLanguage": ["English"]
      },
      {
        "@type": "ContactPoint",
        "telephone": BUSINESS_INFO.contact.phone,
        "contactType": "technical support",
        "email": "support@tsgfulfillment.com",
        "areaServed": ["CA", "Ontario", "Toronto"],
        "availableLanguage": ["English"]
      }
    ]
  },

  /**
   * Facility/Place Schema
   */
  facility: {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${SITE_CONFIG.siteUrl}#facility`,
    "name": "TSG Fulfillment Distribution Center",
    "description": "Modern fulfillment facility with advanced warehouse management systems",
    "address": {
      "@type": "PostalAddress",
      ...BUSINESS_INFO.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.coordinates.latitude,
      "longitude": BUSINESS_INFO.coordinates.longitude
    },
    "telephone": BUSINESS_INFO.contact.phone,
    "url": SITE_CONFIG.siteUrl,
    "image": `${SITE_CONFIG.siteUrl}/images/warehouse-exterior.jpg`,
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Climate Controlled Storage",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Security System",
        "value": "24/7 Monitored"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Warehouse Management System",
        "value": "Advanced WMS"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Loading Docks",
        "value": "Multiple Dock Doors"
      }
    ],
    "containedInPlace": {
      "@type": "City",
      "name": "Vaughan",
      "containedInPlace": {
        "@type": "State",
        "name": "Ontario"
      }
    }
  },

  /**
   * Industry-specific Schema Generator
   */
  industryService: (industry: string, services: string[]) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${industry} Fulfillment Services`,
    "description": `Specialized fulfillment and logistics solutions for ${industry.toLowerCase()} businesses`,
    "provider": {
      "@id": `${SITE_CONFIG.siteUrl}#organization`
    },
    "serviceType": "Industry-Specific Fulfillment",
    "category": industry,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${industry} Services`,
      "itemListElement": services.map((service, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Service",
          "name": service,
          "category": industry
        }
      }))
    },
    "areaServed": {
      "@type": "State",
      "name": "Ontario"
    }
  }),

  /**
   * Performance Metrics Schema
   */
  performanceMetrics: {
    "@context": "https://schema.org",
    "@type": "QuantitativeValue",
    "name": "TSG Fulfillment Performance Metrics",
    "description": "Key performance indicators for fulfillment operations",
    "value": [
      {
        "@type": "PropertyValue",
        "name": "Order Accuracy",
        "value": "99.8%",
        "unitText": "PERCENT"
      },
      {
        "@type": "PropertyValue",
        "name": "Same Day Shipping",
        "value": "95%",
        "unitText": "PERCENT"
      },
      {
        "@type": "PropertyValue",
        "name": "Average Processing Time",
        "value": "2",
        "unitText": "HOUR"
      },
      {
        "@type": "PropertyValue",
        "name": "Customer Satisfaction",
        "value": "4.8",
        "unitText": "RATING"
      }
    ]
  }
};

/**
 * Dynamic schema generators for specific pages
 */
export const generatePageSchema = {
  homepage: () => [
    ADVANCED_SCHEMA_TEMPLATES.professionalService,
    ADVANCED_SCHEMA_TEMPLATES.serviceCatalog,
    ADVANCED_SCHEMA_TEMPLATES.contactPoints,
    ADVANCED_SCHEMA_TEMPLATES.aggregateRating
  ],

  services: () => [
    ADVANCED_SCHEMA_TEMPLATES.serviceCatalog,
    ADVANCED_SCHEMA_TEMPLATES.professionalService
  ],

  locations: () => [
    ADVANCED_SCHEMA_TEMPLATES.facility,
    ADVANCED_SCHEMA_TEMPLATES.contactPoints
  ],

  about: () => [
    ADVANCED_SCHEMA_TEMPLATES.professionalService,
    ADVANCED_SCHEMA_TEMPLATES.performanceMetrics
  ],

  contact: () => [
    ADVANCED_SCHEMA_TEMPLATES.contactPoints,
    ADVANCED_SCHEMA_TEMPLATES.facility
  ],

  industry: (industry: string, services: string[]) => [
    ADVANCED_SCHEMA_TEMPLATES.industryService(industry, services),
    ADVANCED_SCHEMA_TEMPLATES.professionalService
  ]
};