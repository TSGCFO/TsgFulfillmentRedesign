/**
 * Centralized Image Management Utility
 * 
 * This utility provides:
 * - Centralized image URL management
 * - Fallback images for broken URLs
 * - Image validation and error handling
 * - Easy updates across the entire application
 */

// Default fallback images for different categories
export const FALLBACK_IMAGES = {
  service: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  industry: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  hero: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  warehouse: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
};

// Service-specific images
export const SERVICE_IMAGES = {
  "value-added-services": "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "fulfillment": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "warehousing": "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "transportation": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "kitting-services": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "hand-assembly": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "reverse-logistics": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "inventory-management": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "freight-forwarding": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "healthcare-marketing-services": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
};

// Industry-specific images
export const INDUSTRY_IMAGES = {
  "e-commerce": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "health-beauty": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "technology": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "fashion-apparel": "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "automotive": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "food-beverage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
};

// Hero section images
export const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
];

/**
 * Get image URL for a service by slug
 * @param serviceSlug - The service slug
 * @returns The image URL with fallback
 */
export function getServiceImage(serviceSlug: string): string {
  return SERVICE_IMAGES[serviceSlug as keyof typeof SERVICE_IMAGES] || FALLBACK_IMAGES.service;
}

/**
 * Get image URL for an industry by slug
 * @param industrySlug - The industry slug
 * @returns The image URL with fallback
 */
export function getIndustryImage(industrySlug: string): string {
  return INDUSTRY_IMAGES[industrySlug as keyof typeof INDUSTRY_IMAGES] || FALLBACK_IMAGES.industry;
}

/**
 * Get a random hero image
 * @returns A random hero image URL
 */
export function getRandomHeroImage(): string {
  return HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
}

/**
 * Get a fallback image by category
 * @param category - The image category
 * @returns The fallback image URL
 */
export function getFallbackImage(category: keyof typeof FALLBACK_IMAGES = 'default'): string {
  return FALLBACK_IMAGES[category];
}

/**
 * Validate if an image URL is likely to work
 * @param url - The image URL to validate
 * @returns Boolean indicating if URL structure is valid
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Check if it's from a trusted image provider
    const trustedDomains = ['images.unsplash.com', 'picsum.photos', 'tsgfulfillment.com'];
    return trustedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Get optimized image URL with responsive sizing
 * @param baseUrl - The base image URL
 * @param width - Desired width (default: 1200)
 * @param quality - Image quality (default: 80)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(baseUrl: string, width: number = 1200, quality: number = 80): string {
  if (!baseUrl || !isValidImageUrl(baseUrl)) {
    return getFallbackImage();
  }

  // For Unsplash images, optimize parameters
  if (baseUrl.includes('unsplash.com')) {
    // Remove existing w= and q= parameters and add new ones
    let optimizedUrl = baseUrl.split('?')[0];
    optimizedUrl += `?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=${quality}`;
    return optimizedUrl;
  }

  return baseUrl;
}

/**
 * Generate responsive image srcset
 * @param baseUrl - The base image URL
 * @param quality - Image quality (default: 80)
 * @returns Responsive srcset string
 */
export function generateResponsiveSrcSet(baseUrl: string, quality: number = 80): string {
  if (!baseUrl || !baseUrl.includes('unsplash.com')) {
    return '';
  }

  const widths = [320, 640, 960, 1280, 1920, 2560];
  return widths
    .map(width => `${getOptimizedImageUrl(baseUrl, width, quality)} ${width}w`)
    .join(', ');
}

/**
 * Enhanced image component props with error handling
 */
export interface EnhancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackCategory?: keyof typeof FALLBACK_IMAGES;
  priority?: boolean;
  quality?: number;
}

/**
 * Get enhanced image src with fallback handling
 * @param props - Enhanced image props
 * @returns Object with src, srcSet, and fallback information
 */
export function getEnhancedImageSrc(props: EnhancedImageProps) {
  const { src, fallbackCategory = 'default', quality = 80, width = 1200 } = props;
  
  const optimizedSrc = getOptimizedImageUrl(src, width, quality);
  const fallbackSrc = getFallbackImage(fallbackCategory);
  const srcSet = generateResponsiveSrcSet(src, quality);

  return {
    src: optimizedSrc,
    fallbackSrc,
    srcSet,
    isValid: isValidImageUrl(src)
  };
}