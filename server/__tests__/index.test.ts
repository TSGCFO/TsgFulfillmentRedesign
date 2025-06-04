import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('server index', () => {
  it('seeds analytics when enabled', async () => {
    process.env.ANALYTICS_ENABLED = 'true';
    const seed = vi.fn();
    const listen = vi.fn((_: any, cb: any) => cb());
    vi.doMock('../routes', () => ({ registerRoutes: vi.fn().mockResolvedValue({ listen }) }));
    vi.doMock('../vite', () => ({ setupVite: vi.fn(), serveStatic: vi.fn(), log: vi.fn() }));
    vi.doMock('../seed-data', () => ({ seedAnalyticsData: seed }));
    vi.doMock('express', () => {
      const app = { use: vi.fn(), get: vi.fn().mockReturnValue('production') };
      const exp: any = vi.fn(() => app);
      exp.json = vi.fn(() => 'json');
      exp.urlencoded = vi.fn(() => 'url');
      return { default: exp };
    });
    await import('../index');
    expect(seed).toHaveBeenCalled();
  });

  it('error handler responds with json', async () => {
    process.env.ANALYTICS_ENABLED = 'false';
    let errorHandler: any;
    const listen = vi.fn((_: any, cb: any) => cb());
    vi.doMock('../routes', () => ({ registerRoutes: vi.fn().mockResolvedValue({ listen }) }));
    vi.doMock('../seed-data', () => ({ seedAnalyticsData: vi.fn() }));
    vi.doMock('../vite', () => ({ setupVite: vi.fn(), serveStatic: vi.fn(), log: vi.fn() }));
    vi.doMock('express', () => {
      const app = {
        use: (fn: any) => { if (fn.length === 4) errorHandler = fn; },
        get: vi.fn().mockReturnValue('production'),
      };
      const exp: any = vi.fn(() => app);
      exp.json = vi.fn(() => 'json');
      exp.urlencoded = vi.fn(() => 'url');
      return { default: exp };
    });
    await import('../index');
    const json = vi.fn();
    const res = { status: vi.fn(() => ({ json })) } as any;
    const err = new Error('boom');
    expect(() => errorHandler(err, {} as any, res, () => {})).toThrow(err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'boom' });
  });
});
