/**
 * @vitest-environment node
 */
import { vi, beforeEach, afterEach, it, expect } from 'vitest';
import type { Express } from 'express';
import http from 'http';

let serverInstance: http.Server;

const registerRoutesMock = vi.fn(async (app: Express, _analytics: boolean) => {
  app.get('/error', () => {
    throw new Error('boom');
  });
  serverInstance = http.createServer(app as any);
  serverInstance.listen(0); // Use random available port
  return serverInstance;
});

const seedAnalyticsDataMock = vi.fn();

vi.mock('../routes', () => ({ registerRoutes: registerRoutesMock }));
vi.mock('../seed-data', () => ({ seedAnalyticsData: seedAnalyticsDataMock }));
vi.mock('../vite', () => ({
  setupVite: vi.fn(),
  serveStatic: vi.fn(),
  log: vi.fn(),
}));

beforeEach(() => {
  process.env.ANALYTICS_ENABLED = 'true';
  process.env.NODE_ENV = 'production';
});

afterEach(async () => {
  if (serverInstance?.listening) {
    await new Promise<void>((r) => serverInstance.close(() => r()));
  }
  vi.resetModules();
  vi.clearAllMocks();
});

it('initializes server with analytics and propagates errors', async () => {
  await import('../index');
  await new Promise((r) => serverInstance.on('listening', r));

  expect(registerRoutesMock).toHaveBeenCalledWith(expect.anything(), true);
  expect(seedAnalyticsDataMock).toHaveBeenCalled();
  
  const address = serverInstance.address() as any;
  expect(address.port).toBeGreaterThan(0);

  const res = await fetch(`http://localhost:${address.port}/error`);
  expect(res.status).toBe(500);
}, 15000);
