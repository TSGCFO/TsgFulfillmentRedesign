import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import useIntersectionObserver from '../use-intersection-observer';

describe('useIntersectionObserver', () => {
  it('updates intersection state and cleans up', () => {
    let callback: IntersectionObserverCallback;
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    class MockObserver {
      constructor(cb: IntersectionObserverCallback) { callback = cb; }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    }
    (globalThis as any).IntersectionObserver = MockObserver;

    const { result, unmount } = renderHook(() => useIntersectionObserver());

    act(() => {
      callback([{ isIntersecting: true }]);
    });
    expect(result.current[1]).toBe(true);

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
