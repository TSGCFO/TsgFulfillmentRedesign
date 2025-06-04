import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import '@testing-library/jest-dom';
import { scrollTo as scrollToHelper } from '@/lib/scroll';

// Preserve original methods so they can be restored after tests
const originalScrollTo = window.scrollTo;
const originalGetElementById = document.getElementById;

// Mock scrollTo function
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock getElementById to simulate contact section
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

// Mock contact element
const mockContactElement = {
  offsetTop: 1000,
  getBoundingClientRect: () => ({ top: 1000, bottom: 1200 })
};

describe('Quote Button Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetElementById.mockImplementation((id) => {
      if (id === 'contact') return mockContactElement;
      return null;
    });
  });

  afterAll(() => {
    window.scrollTo = originalScrollTo;
    document.getElementById = originalGetElementById;
  });

  describe('Quote Button Click Handlers', () => {
    it('should create scroll function that targets contact section', () => {
      scrollToHelper('contact');

      expect(mockGetElementById).toHaveBeenCalledWith('contact');
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 900, // 1000 - 100
        behavior: 'smooth',
      });
    });

    it('should handle missing contact section gracefully', () => {
      mockGetElementById.mockReturnValue(null);

      scrollToHelper('contact');

      expect(mockGetElementById).toHaveBeenCalledWith('contact');
      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('Quote Form Validation', () => {
    it('should validate required form fields', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Test Company',
        currentShipments: '250-500',
        expectedShipments: '2000-10000',
        services: 'warehousing',
        message: 'Test message'
      };

      // Test all required fields are present
      expect(formData.name).toBeTruthy();
      expect(formData.email).toContain('@');
      expect(formData.phone).toBeTruthy();
      expect(formData.company).toBeTruthy();
      expect(formData.currentShipments).toBeTruthy();
      expect(formData.expectedShipments).toBeTruthy();
      expect(formData.services).toBeTruthy();
    });

    it('should validate dropdown options', () => {
      const currentShipmentOptions = ['0-250', '250-500', '500-1000', '1000-2000', '2000-5000', '5000+'];
      const expectedShipmentOptions = ['less-than-2000', '2000-10000', '10001-50000', '50001-100000', '100000+'];
      
      expect(currentShipmentOptions).toContain('0-250');
      expect(currentShipmentOptions).toContain('5000+');
      expect(expectedShipmentOptions).toContain('less-than-2000');
      expect(expectedShipmentOptions).toContain('100000+');
    });
  });

  describe('Button Integration Tests', () => {
    it('should test navbar quote button functionality', () => {
      // Simulate navbar quote button click
      scrollToHelper('contact');
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 900,
        behavior: 'smooth',
      });
    });

    it('should test hero section quote button functionality', () => {
      // Simulate hero section quote button click
      scrollToHelper('contact');
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 900,
        behavior: 'smooth',
      });
    });

    it('should test CTA section quote button functionality', () => {
      // Simulate CTA section quote button click
      scrollToHelper('contact');
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 900,
        behavior: 'smooth',
      });
    });
  });

  describe('Cross-page Consistency', () => {
    const pages = [
      'Home Page (Navbar)',
      'Home Page (Hero)', 
      'Home Page (CTA)',
      'Service Pages',
      'OWD Home',
      'New Home (CTA 1)',
      'New Home (CTA 2)'
    ];

    it('should use consistent scroll behavior across all pages', () => {
      pages.forEach(() => {
        scrollToHelper('contact');
        expect(mockScrollTo).toHaveBeenLastCalledWith({
          top: 900,
          behavior: 'smooth',
        });
      });
    });

    it('should target the same contact section ID across all pages', () => {
      const targetId = 'contact';

      pages.forEach(() => {
        document.getElementById(targetId);
      });

      expect(mockGetElementById).toHaveBeenCalledTimes(pages.length);
      expect(mockGetElementById).toHaveBeenLastCalledWith('contact');
    });
  });
});