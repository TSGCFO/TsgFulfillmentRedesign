import { supabase, IMAGE_BUCKET } from './supabase';

/**
 * Centralized Image Management System
 * 
 * This system provides:
 * - Supabase storage integration
 * - SEO-friendly image naming
 * - Easy image management and updates
 * - Centralized image URL generation
 * - Image upload and management capabilities
 */

// Image categories for organization
export const IMAGE_CATEGORIES = {
  hero: 'hero',
  services: 'services',
  industries: 'industries',
  warehouse: 'warehouse',
  team: 'team',
  vehicles: 'vehicles',
  showroom: 'showroom',
  logos: 'logos',
  icons: 'icons',
  general: 'general'
} as const;

export type ImageCategory = typeof IMAGE_CATEGORIES[keyof typeof IMAGE_CATEGORIES];

/**
 * Central image registry with SEO-friendly names
 * Format: category/descriptive-name-with-keywords
 */
export const IMAGE_REGISTRY = {
  // Hero section images
  'hero-about': 'hero/hero-about-hero-2025.jpg',
  'hero-banner-22': 'hero/hero-banner-22-2025.jpg',
  'hero-contact': 'hero/hero-contact-hero-2025.jpg',
  'hero-fulfillment': 'hero/hero-fullfi-banner-2025.jpg',
  'hero-health': 'hero/hero-health-banner-2025.jpg',
  'hero-inventory': 'hero/hero-inventory-banner-2025.jpg',
  
  // Service images
  'service-analytics-dashboard': 'services/services-analytics-dashboard-2025.jpg',
  'service-analytics-performance': 'services/services-analytics-performance-2025.jpg',
  'service-hand-assembly': 'services/services-hand-assembly-2025.jpg',
  'service-logistics': 'services/services-logistic-2025.jpg',
  'service-logo': 'services/services-logo-2025.png',
  'service-main-banner': 'services/services-main-baner-2025.jpg',
  'service-og-image': 'services/services-og-image-2025.jpg',
  'service-report-generator': 'services/services-report-generator-2025.jpg',
  'service-slider-01': 'services/services-slider-01-2025.jpg',
  'service-slider-02': 'services/services-slider-02-2025.jpg',
  'service-slider-03': 'services/services-slider-03-2025.jpg',
  'service-slider-04': 'services/services-slider-04-2025.jpg',
  'service-truck': 'services/services-truck-2025.jpg',
  'service-warehouse': 'services/services-warehouse-2025.jpg',
  'service-warehouse-facility': 'services/services-warehouse-facility-2025.jpg',
  
  // Logos and branding
  'logo-adidas': 'logos/logos-adidas-logo-2025.svg',
  'logo-amazon': 'logos/logos-amazon-logo-2025.svg',
  'logo-nike': 'logos/logos-logo-nike-2025.svg',
  'logo-shopify': 'logos/logos-shopify-logo-2018-2025.svg',
  'logo-target': 'logos/logos-target-logo-2025.svg',
  'logo-walmart': 'logos/logos-walmart-logo-2025.svg'
} as const;

export type ImageKey = keyof typeof IMAGE_REGISTRY;

/**
 * Get the full URL for an image from Supabase storage
 */
export const getImageUrl = (imageKey: ImageKey): string => {
  if (!supabase) {
    // Return fallback URLs when Supabase is not configured
    return FALLBACK_IMAGES.default;
  }
  
  const imagePath = IMAGE_REGISTRY[imageKey];
  
  try {
    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  } catch (error) {
    console.warn('Failed to get image URL from Supabase:', error);
    return FALLBACK_IMAGES.default;
  }
};

/**
 * Get optimized image URL with transform parameters
 */
export const getOptimizedImageUrl = (
  imageKey: ImageKey, 
  width?: number, 
  height?: number,
  quality?: number
): string => {
  const imagePath = IMAGE_REGISTRY[imageKey];
  
  const { data } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(imagePath, {
      transform: {
        width,
        height,
        quality
      }
    });
  
  return data.publicUrl;
};

/**
 * Upload an image to Supabase storage
 */
export const uploadImage = async (
  file: File,
  category: ImageCategory,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const filePath = `${category}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

/**
 * Delete an image from Supabase storage
 */
export const deleteImage = async (imageKey: ImageKey): Promise<{ success: boolean; error?: string }> => {
  try {
    const imagePath = IMAGE_REGISTRY[imageKey];
    
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([imagePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    };
  }
};

/**
 * List all images in a category
 */
export const listImages = async (category?: ImageCategory) => {
  try {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .list(category || '', {
        limit: 100,
        offset: 0
      });

    if (error) {
      return { success: false, error: error.message, images: [] };
    }

    return { success: true, images: data || [] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'List failed',
      images: []
    };
  }
};

/**
 * Generate SEO-friendly alt text for images
 */
export const generateAltText = (imageKey: ImageKey, customContext?: string): string => {
  const baseDescriptions: Record<string, string> = {
    'hero-fulfillment-warehouse': 'TSG Fulfillment modern warehouse facility with advanced logistics operations',
    'hero-logistics-center': 'State-of-the-art distribution center for efficient order fulfillment',
    'service-warehousing': 'Professional warehousing and storage solutions for businesses',
    'service-fulfillment': 'Ecommerce order fulfillment and processing services',
    'service-shipping': 'Fast shipping and delivery logistics solutions',
    'service-inventory': 'Advanced inventory management and tracking systems',
    'service-value-added': 'Value-added logistics services and solutions',
    'service-kitting': 'Professional kitting and assembly services',
    'service-reverse-logistics': 'Reverse logistics and returns processing services',
    'service-freight-forwarding': 'Freight forwarding and international shipping',
    'service-healthcare-marketing': 'Healthcare marketing and fulfillment services',
    'industry-ecommerce': 'Ecommerce retail fulfillment solutions and services',
    'industry-manufacturing': 'Manufacturing supply chain and logistics solutions',
    'industry-healthcare': 'Healthcare medical device distribution and fulfillment',
    'industry-automotive': 'Automotive parts warehouse and distribution services',
    'industry-health-beauty': 'Health and beauty product fulfillment services',
    'industry-technology': 'Technology and electronics distribution solutions',
    'industry-fashion': 'Fashion and apparel warehouse fulfillment',
    'industry-food-beverage': 'Food and beverage cold chain logistics',
    'warehouse-interior': 'Modern warehouse interior with efficient operations layout',
    'warehouse-automation': 'Automated warehouse robotics and technology systems',
    'warehouse-picking': 'Professional order picking and fulfillment processes',
    'team-leadership': 'TSG Fulfillment experienced leadership and management team',
    'team-warehouse-staff': 'Dedicated warehouse operations team working efficiently',
    'logo-tsg-main': 'TSG Fulfillment company logo - professional logistics services',
    'logo-tsg-white': 'TSG Fulfillment white logo for dark backgrounds'
  };

  const baseAlt = baseDescriptions[imageKey] || `${imageKey.replace(/-/g, ' ')} image`;
  return customContext ? `${baseAlt} - ${customContext}` : baseAlt;
};

/**
 * Fallback images for when Supabase images are not available
 */
const FALLBACK_IMAGES = {
  service: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  industry: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  hero: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  warehouse: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
};

/**
 * Legacy support functions for existing code
 */

// Service-specific image mapping
export const getServiceImage = (serviceSlug: string): string => {
  const serviceMapping: Record<string, ImageKey> = {
    'fulfillment': 'service-main-banner',
    'warehousing': 'service-warehouse',
    'value-added-services': 'service-logistics',
    'transportation': 'service-truck',
    'kitting-services': 'service-hand-assembly',
    'hand-assembly': 'service-hand-assembly',
    'reverse-logistics': 'service-logistics',
    'inventory-management': 'service-analytics-dashboard',
    'freight-forwarding': 'service-truck',
    'healthcare-marketing-services': 'service-logistics'
  };
  
  const imageKey = serviceMapping[serviceSlug];
  if (imageKey) {
    try {
      return getImageUrl(imageKey);
    } catch {
      return FALLBACK_IMAGES.service;
    }
  }
  return FALLBACK_IMAGES.service;
};

// Industry-specific image mapping
export const getIndustryImage = (industrySlug: string): string => {
  // Since no industry images were uploaded, use service images as fallback
  const industryMapping: Record<string, ImageKey> = {
    'e-commerce': 'service-analytics-dashboard',
    'health-beauty': 'hero-health',
    'technology': 'service-analytics-performance',
    'fashion-apparel': 'service-logistics',
    'automotive': 'service-truck',
    'food-beverage': 'service-warehouse',
    'manufacturing': 'service-warehouse-facility',
    'healthcare': 'hero-health'
  };
  
  const imageKey = industryMapping[industrySlug];
  if (imageKey) {
    try {
      return getImageUrl(imageKey);
    } catch {
      return FALLBACK_IMAGES.industry;
    }
  }
  return FALLBACK_IMAGES.industry;
};

// Hero images
export const getRandomHeroImage = (): string => {
  const heroImages: ImageKey[] = ['hero-fulfillment', 'hero-banner-22'];
  const randomKey = heroImages[Math.floor(Math.random() * heroImages.length)];
  try {
    return getImageUrl(randomKey);
  } catch {
    return FALLBACK_IMAGES.hero;
  }
};