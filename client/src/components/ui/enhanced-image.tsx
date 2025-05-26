import React, { useState } from 'react';
import { getEnhancedImageSrc, EnhancedImageProps } from '@/lib/images';

/**
 * Enhanced Image Component with automatic fallback and error handling
 * 
 * Features:
 * - Automatic fallback to working images
 * - Responsive image loading
 * - Error handling with graceful degradation
 * - Optimized performance with lazy loading
 */
export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackCategory = 'default',
  priority = false,
  quality = 80,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { src: optimizedSrc, fallbackSrc, srcSet } = getEnhancedImageSrc({
    src,
    alt,
    width,
    height,
    fallbackCategory,
    priority,
    quality
  });

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Use fallback image if there was an error
  const finalSrc = hasError ? fallbackSrc : optimizedSrc;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        srcSet={srcSet}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};

export default EnhancedImage;