import { vi, describe, it, expect } from 'vitest';
import { apiRequest, getQueryFn } from '../queryClient';

describe('apiRequest', () => {
  it('sends request and returns response', async () => {
    const mockRes = new Response('ok', { status: 200 });
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockRes as any);
    const res = await apiRequest('POST', '/url', { a: 1 });
    expect(fetchSpy).toHaveBeenCalledWith('/url', expect.objectContaining({ method: 'POST' }));
    expect(res).toBe(mockRes);
    fetchSpy.mockRestore();
  });

  it('throws on non-ok response', async () => {
    const mockRes = new Response('bad', { status: 400 });
    vi.spyOn(global, 'fetch').mockResolvedValue(mockRes as any);
    await expect(apiRequest('GET', '/url')).rejects.toThrow('400: bad');
  });
});

describe('getQueryFn', () => {
  it('returns null on 401 when configured', async () => {
    const res = new Response('', { status: 401 });
    vi.spyOn(global, 'fetch').mockResolvedValue(res as any);
    const fn = getQueryFn({ on401: 'returnNull' });
    const data = await fn({ queryKey: ['/me'] } as any);
    expect(data).toBeNull();
  });

  it('throws on 401 when configured to throw', async () => {
    const res = new Response('', { status: 401 });
    vi.spyOn(global, 'fetch').mockResolvedValue(res as any);
    const fn = getQueryFn({ on401: 'throw' });
    await expect(fn({ queryKey: ['/me'] } as any)).rejects.toThrow();
  });
});
