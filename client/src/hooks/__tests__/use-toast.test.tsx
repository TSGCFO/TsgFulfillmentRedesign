import { renderHook, act } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('useToast hook', () => {
  it('adds and dismisses toasts', async () => {
    const mod = await import('../use-toast');
    const { useToast, toast } = mod;
    const { result } = renderHook(() => useToast());
    act(() => {
      toast({ title: 'hi' });
    });
    expect(result.current.toasts.length).toBe(1);
    const id = result.current.toasts[0].id;
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('returns helpers from toast', async () => {
    const { toast } = await import('../use-toast');
    const res = toast({ title: 'x' });
    expect(res.id).toBeDefined();
    expect(typeof res.dismiss).toBe('function');
  });

  it('reducer removes toast', async () => {
    const { reducer } = await import('../use-toast');
    const state = { toasts: [{ id: '1', open: true }] } as any;
    const next = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' } as any);
    expect(next.toasts).toHaveLength(0);
  });
});
