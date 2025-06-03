/**
 * @vitest-environment node
 */
import express from 'express';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { registerRoutes } from '../routes';
import type { Server } from 'http';
import type { AddressInfo } from 'net';

let server: Server;
let port: number;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  server = await registerRoutes(app, false);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      port = (server.address() as AddressInfo).port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('API routes', () => {
  it('handles contact form', async () => {
    const res = await fetch(`http://localhost:${port}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', email: 't@example.com', message: 'hi' })
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe('Contact form submitted successfully');
  });

  it('creates and retrieves a quote request', async () => {
    const requestBody = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      company: 'ACME Co',
      service: 'shipping',
      message: 'Need shipping',
      consent: true
    };
    const createRes = await fetch(`http://localhost:${port}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    expect(createRes.status).toBe(200);
    const created = await createRes.json();
    const id = created.data.id;
    const getRes = await fetch(`http://localhost:${port}/api/quote/${id}`);
    expect(getRes.status).toBe(200);
    const retrieved = await getRes.json();
    expect(retrieved.data.id).toBe(id);
  });

  it('creates and retrieves an inventory level', async () => {
    const level = {
      clientId: 1,
      productId: 2,
      quantity: 5,
      warehouseLocation: 'A1',
      minimumLevel: 1
    };
    const postRes = await fetch(`http://localhost:${port}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(level)
    });
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    const id = postData.data.id;
    const getRes = await fetch(`http://localhost:${port}/api/inventory/${id}`);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.data.id).toBe(id);
  });
});
