import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import useIntersectionObserver from '../use-intersection-observer';

describe('useIntersectionObserver', () => {
  it('updates intersection state and cleans up', () => {
    let callback: any;
    const observe = vi.fn();
    const unobserve = vi.fn();
    class MockObserver {
      constructor(cb: any) { callback = cb; }
      observe = observe;
      unobserve = unobserve;
      disconnect = vi.fn();
    }
    (globalThis as any).IntersectionObserver = MockObserver;

    const { result, unmount } = renderHook(() => useIntersectionObserver());

    act(() => {
      callback([{ isIntersecting: true }]);
    });
    expect(result.current[1]).toBe(true);

    unmount();
  });
});
