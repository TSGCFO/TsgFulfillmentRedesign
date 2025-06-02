import { useState } from 'react';
import { getImageUrl, getOptimizedImageUrl, generateAltText, type ImageKey } from '@/lib/images';

interface EnhancedImageProps {
  imageKey: ImageKey;
  alt?: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  customContext?: string;
  priority?: boolean;
  fallbackUrl?: string;
}

/**
 * Enhanced Image Component with Supabase Storage Integration
 * 
 * Features:
 * - Automatic SEO-friendly alt text generation
 * - Optimized image loading with transforms
 * - Fallback handling for failed loads
 * - Centralized image management
 */
export function EnhancedImage({
  imageKey,
  alt,
  width,
  height,
  quality = 80,
  className = '',
  customContext,
  priority = false,
  fallbackUrl = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
}: EnhancedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate the image URL
  const imageUrl = width || height || quality !== 80 
    ? getOptimizedImageUrl(imageKey, width, height, quality)
    : getImageUrl(imageKey);

  // Generate SEO-friendly alt text
  const imageAlt = alt || generateAltText(imageKey, customContext);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imageError ? fallbackUrl : imageUrl}
        alt={imageAlt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

/**
 * Simple wrapper for backward compatibility
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallback
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const fallbackUrl = fallback || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imageError ? fallbackUrl : src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}

        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}
