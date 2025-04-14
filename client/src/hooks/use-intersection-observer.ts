import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
  root?: Element | null;
  once?: boolean;
}

/**
 * Custom hook that observes when an element enters the viewport
 * @param options Configuration options for the IntersectionObserver
 * @returns [ref, isIntersecting] tuple for tracking element visibility
 */
export function useIntersectionObserver({
  rootMargin = '0px',
  threshold = 0,
  root = null,
  once = false,
}: UseIntersectionObserverOptions = {}): [RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const entryIsIntersecting = entry.isIntersecting;
          setIsIntersecting(entryIsIntersecting);
          
          // If once option is true and element has been intersected, unobserve it
          if (once && entryIsIntersecting && ref.current) {
            observer.unobserve(ref.current);
          }
        });
      },
      { rootMargin, threshold, root }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, root, once]);
  
  return [ref, isIntersecting];
}

export default useIntersectionObserver;