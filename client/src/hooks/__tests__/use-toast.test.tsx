import { renderHook, act } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { resetToasts } from '../use-toast';

beforeEach(() => {
  vi.clearAllMocks();
  resetToasts();
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
    const state = { toasts: [{ id: '1', open: true }] };
    const next = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' } as any);
    expect(next.toasts).toHaveLength(0);
  });

  it('handles multiple toasts', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'First toast' });
      toast({ title: 'Second toast' });
      toast({ title: 'Third toast' });
    });
    
    expect(result.current.toasts.length).toBe(3);
    expect(result.current.toasts[0].title).toBe('First toast');
    expect(result.current.toasts[1].title).toBe('Second toast');
    expect(result.current.toasts[2].title).toBe('Third toast');
  });

  it('handles toast with all properties', async () => {
    const { toast } = await import('../use-toast');
    const res = toast({ 
      title: 'Complete toast', 
      description: 'With description',
      variant: 'destructive'
    });
    
    expect(res.id).toBeDefined();
    expect(typeof res.dismiss).toBe('function');
  });

  it('handles toast dismissal without crash', async () => {
    const { useToast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.dismiss('nonexistent-id');
    });
    
    // Should not crash
    expect(result.current.toasts.length).toBe(0);
  });
});
