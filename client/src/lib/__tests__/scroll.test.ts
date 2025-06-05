import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrollTo } from '../scroll';

describe('scrollTo function', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it('scrolls to element with default offset', () => {
    // Create a test element
    const element = document.createElement('div');
    element.id = 'test-element';
    // Mock offsetTop
    Object.defineProperty(element, 'offsetTop', {
      value: 500,
      writable: true
    });
    document.body.appendChild(element);

    scrollTo('test-element');

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 400, // 500 - 100 (default offset)
      behavior: 'smooth',
    });
  });

  it('scrolls to element with custom offset', () => {
    const element = document.createElement('div');
    element.id = 'custom-element';
    Object.defineProperty(element, 'offsetTop', {
      value: 300,
      writable: true
    });
    document.body.appendChild(element);

    scrollTo('custom-element', 50);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 250, // 300 - 50 (custom offset)
      behavior: 'smooth',
    });
  });

  it('handles non-existent element gracefully', () => {
    scrollTo('non-existent-element');

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('handles element at top of page with large offset', () => {
    const element = document.createElement('div');
    element.id = 'top-element';
    Object.defineProperty(element, 'offsetTop', {
      value: 50,
      writable: true
    });
    document.body.appendChild(element);

    scrollTo('top-element', 100);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: -50, // 50 - 100, can be negative
      behavior: 'smooth',
    });
  });

  it('uses zero offset when specified', () => {
    const element = document.createElement('div');
    element.id = 'zero-offset-element';
    Object.defineProperty(element, 'offsetTop', {
      value: 200,
      writable: true
    });
    document.body.appendChild(element);

    scrollTo('zero-offset-element', 0);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 200, // 200 - 0
      behavior: 'smooth',
    });
  });
});