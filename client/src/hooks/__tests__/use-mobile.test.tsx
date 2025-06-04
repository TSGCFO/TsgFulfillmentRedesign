import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  it('detects width changes and cleans up', () => {
    let changeCb: () => void = () => {};
    const add = vi.fn((_: string, cb: () => void) => { changeCb = cb; });
    const remove = vi.fn();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    (window as any).matchMedia = vi.fn().mockReturnValue({ addEventListener: add, removeEventListener: remove });

    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    expect(add).toHaveBeenCalled();

    act(() => {
      window.innerWidth = 800;
      changeCb();
    });
    expect(result.current).toBe(false);
    unmount();
    expect(remove).toHaveBeenCalled();
  });
});
