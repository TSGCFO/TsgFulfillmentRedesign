import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  itemProp?: string;
}

/**
 * OptimizedImage component for better SEO and performance
 * 
 * Features:
 * - Responsive images with srcset
 * - Lazy loading with native browser support
 * - Image dimensions for better Core Web Vitals
 * - ARIA and Schema.org support
 * - Optional WebP format support
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  sizes = '100vw',
  quality = 80,
  objectFit = 'cover',
  priority = false,
  itemProp,
}) => {
  // Handle image URL parameters
  const addParamsToImageUrl = (url: string, params: Record<string, string | number>) => {
    // If the URL is from unsplash, we can add quality parameters
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      const paramString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      return `${url}${separator}${paramString}`;
    }
    return url;
  };

  // Generate srcset for responsive images (using Unsplash's native functionality)
  const generateSrcSet = () => {
    if (!src.includes('unsplash.com')) return undefined;
    
    const breakpoints = [640, 750, 828, 1080, 1200, 1920, 2048];
    return breakpoints
      .map(breakpoint => {
        const optimizedSrc = addParamsToImageUrl(src, { 
          w: breakpoint,
          q: quality,
          auto: 'format'
        });
        return `${optimizedSrc} ${breakpoint}w`;
      })
      .join(', ');
  };

  // For Unsplash images, we can use their native optimization features
  const optimizedSrc = src.includes('unsplash.com') 
    ? addParamsToImageUrl(src, { q: quality, auto: 'format' })
    : src;

  const loadingAttr = priority ? 'eager' : loading;
  const srcSet = generateSrcSet();

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loadingAttr}
      className={className}
      sizes={sizes}
      srcSet={srcSet}
      style={{ objectFit }}
      itemProp={itemProp}
      decoding={priority ? 'sync' : 'async'}
      onError={(e) => {
        // Fallback for image load errors
        const target = e.target as HTMLImageElement;
        console.warn(`Image failed to load: ${target.src}`);
      }}
    />
  );
};

export default OptimizedImage;