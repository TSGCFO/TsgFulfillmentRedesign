/** @vitest-environment jsdom */
import express from 'express';
import { beforeAll, afterAll, it, expect } from 'vitest';
import { registerRoutes } from '../routes';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Server } from 'http';
import type { AddressInfo } from 'net';

let server: Server;
let port: number;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  server = await registerRoutes(app, true);
  await new Promise<void>(resolve => {
    server.listen(0, () => {
      port = (server.address() as AddressInfo).port;
      resolve();
    });
  });
  process.env.VITE_ANALYTICS_ENABLED = 'true';
  (import.meta as any).env = { VITE_ANALYTICS_ENABLED: 'true' };
});

afterAll(async () => {
  delete process.env.VITE_ANALYTICS_ENABLED;
  await new Promise<void>(r => server.close(() => r()));
});

it('navbar shows analytics link and server responds', async () => {
  const { default: Navbar } = await import('../../client/src/components/Navbar');
  render(<Navbar />);
  expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
  const res = await fetch(`http://localhost:${port}/api/analytics/client-summary/1`);
  expect(res.status).toBe(200);
});
