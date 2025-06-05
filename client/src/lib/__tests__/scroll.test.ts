import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollTo } from '@/lib/scroll';

describe('Scroll Utils', () => {
  const originalScrollTo = window.scrollTo;
  const originalGetElementById = document.getElementById;
  
  const mockScrollTo = vi.fn();
  const mockGetElementById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true,
    });

    // Mock document.getElementById
    Object.defineProperty(document, 'getElementById', {
      value: mockGetElementById,
      writable: true,
    });
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    document.getElementById = originalGetElementById;
  });

  describe('scrollTo function', () => {
    it('scrolls to element with correct offset', () => {
      const mockElement = {
        offsetTop: 1000,
        getBoundingClientRect: () => ({ top: 1000, bottom: 1200 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('test-element');

      expect(mockGetElementById).toHaveBeenCalledWith('test-element');
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 900, // 1000 - 100 (default offset)
        behavior: 'smooth',
      });
    });

    it('uses custom offset when provided', () => {
      const mockElement = {
        offsetTop: 1000,
        getBoundingClientRect: () => ({ top: 1000, bottom: 1200 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('test-element', 150);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 850, // 1000 - 150
        behavior: 'smooth',
      });
    });

    it('handles zero offset', () => {
      const mockElement = {
        offsetTop: 500,
        getBoundingClientRect: () => ({ top: 500, bottom: 700 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('test-element', 0);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 500, // 500 - 0
        behavior: 'smooth',
      });
    });

    it('handles negative offset correctly', () => {
      const mockElement = {
        offsetTop: 200,
        getBoundingClientRect: () => ({ top: 200, bottom: 400 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('test-element', -50);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 250, // 200 - (-50) = 200 + 50
        behavior: 'smooth',
      });
    });

    it('does not scroll when element is not found', () => {
      mockGetElementById.mockReturnValue(null);

      scrollTo('non-existent-element');

      expect(mockGetElementById).toHaveBeenCalledWith('non-existent-element');
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('handles element at top of page', () => {
      const mockElement = {
        offsetTop: 0,
        getBoundingClientRect: () => ({ top: 0, bottom: 200 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('top-element');

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -100, // 0 - 100
        behavior: 'smooth',
      });
    });

    it('handles very large offsetTop values', () => {
      const mockElement = {
        offsetTop: 10000,
        getBoundingClientRect: () => ({ top: 10000, bottom: 10200 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('bottom-element');

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 9900, // 10000 - 100
        behavior: 'smooth',
      });
    });

    it('handles empty string element ID', () => {
      scrollTo('');

      expect(mockGetElementById).toHaveBeenCalledWith('');
      // Behavior depends on browser implementation, but should not throw
    });

    it('handles undefined offset by using default', () => {
      const mockElement = {
        offsetTop: 1000,
        getBoundingClientRect: () => ({ top: 1000, bottom: 1200 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('test-element', undefined);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 900, // Uses default offset of 100
        behavior: 'smooth',
      });
    });

    it('maintains smooth scroll behavior in all cases', () => {
      const mockElement = {
        offsetTop: 500,
        getBoundingClientRect: () => ({ top: 500, bottom: 700 }),
      };
      
      mockGetElementById.mockReturnValue(mockElement);

      scrollTo('test-element', 50);

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
        })
      );
    });

    it('handles multiple consecutive calls', () => {
      const mockElement1 = {
        offsetTop: 500,
        getBoundingClientRect: () => ({ top: 500, bottom: 700 }),
      };
      
      const mockElement2 = {
        offsetTop: 1500,
        getBoundingClientRect: () => ({ top: 1500, bottom: 1700 }),
      };
      
      mockGetElementById.mockImplementation((id) => {
        if (id === 'element1') return mockElement1;
        if (id === 'element2') return mockElement2;
        return null;
      });

      scrollTo('element1');
      scrollTo('element2');

      expect(mockScrollTo).toHaveBeenCalledTimes(2);
      expect(mockScrollTo).toHaveBeenNthCalledWith(1, {
        top: 400,
        behavior: 'smooth',
      });
      expect(mockScrollTo).toHaveBeenNthCalledWith(2, {
        top: 1400,
        behavior: 'smooth',
      });
    });

    it('works correctly with common element IDs', () => {
      const commonIds = ['contact', 'about', 'services', 'header', 'footer'];
      
      commonIds.forEach((id, index) => {
        const mockElement = {
          offsetTop: (index + 1) * 1000,
          getBoundingClientRect: () => ({ 
            top: (index + 1) * 1000, 
            bottom: (index + 1) * 1000 + 200 
          }),
        };
        
        mockGetElementById.mockReturnValue(mockElement);
        
        scrollTo(id);
        
        expect(mockGetElementById).toHaveBeenCalledWith(id);
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: (index + 1) * 1000 - 100,
          behavior: 'smooth',
        });
        
        vi.clearAllMocks();
      });
    });
  });
});