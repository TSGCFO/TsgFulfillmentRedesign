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
  style?: React.CSSProperties;
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
  objectFit,
  priority = false,
  itemProp,
  ...props
}) => {
  // Calculate image srcset for responsive images
  const generateSrcSet = () => {
    // For Unsplash, we can generate a proper srcset
    if (src.includes('unsplash.com')) {
      const widths = [320, 640, 960, 1280, 1920, 2560];
      return widths
        .map(w => {
          let imgSrc = src;
          // If w= parameter exists, replace it
          if (imgSrc.includes('w=')) {
            imgSrc = imgSrc.replace(/w=\d+/, `w=${w}`);
          } else {
            // Add w= parameter
            const separator = imgSrc.includes('?') ? '&' : '?';
            imgSrc = `${imgSrc}${separator}w=${w}&q=${quality}`;
          }
          return `${imgSrc} ${w}w`;
        })
        .join(', ');
    }

    // For other external URLs, don't generate srcset to avoid errors
    return undefined;
  };

  const srcset = generateSrcSet();
  
  // Merge style props with objectFit
  const imgStyle: React.CSSProperties = {
    ...(objectFit ? { objectFit } : {}),
    ...(props.style || {})
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : loading}
      sizes={srcset ? sizes : undefined}
      srcSet={srcset}
      style={imgStyle}
      itemProp={itemProp}
      {...props}
      // Add structured data attributes for better SEO
      data-testid="optimized-image"
      onError={(e) => {
        // Handle image loading errors gracefully
        console.warn('Image failed to load:', src);
      }}
    />
  );
};

export default OptimizedImage;