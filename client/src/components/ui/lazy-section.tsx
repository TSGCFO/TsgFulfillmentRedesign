import React, { ReactNode, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  animate?: boolean;
  once?: boolean;
}

/**
 * LazySection component that renders children only when they come into view
 * Improves performance by delaying rendering of off-screen content
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  className = '',
  rootMargin = '100px',
  threshold = 0.1,
  animate = true,
  once = true,
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin,
    threshold,
    once,
  });
  
  const [hasIntersected, setHasIntersected] = useState(false);
  
  useEffect(() => {
    if (isIntersecting && !hasIntersected) {
      setHasIntersected(true);
    }
  }, [isIntersecting, hasIntersected]);
  
  // Pre-render placeholder with same height
  if (!hasIntersected) {
    return (
      <div 
        ref={ref as React.RefObject<HTMLDivElement>} 
        className={cn("min-h-[200px]", className)}
        aria-hidden="true"
      />
    );
  }
  
  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={cn(
        className,
        animate && isIntersecting && "animate-fadeIn"
      )}
    >
      {children}
    </div>
  );
};

export default LazySection;