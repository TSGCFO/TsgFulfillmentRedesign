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

  it('handles shipments', async () => {
    const body = { clientId: 1, carrier: 'UPS', trackingNumber: '1Z', cost: 10, destination: 'NY' };
    const res = await fetch(`http://localhost:${port}/api/shipments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const created = await res.json();
    const id = created.data.id;
    const get = await fetch(`http://localhost:${port}/api/shipments/${id}`);
    expect(get.status).toBe(200);
  });

  it('handles order statistics and client KPIs', async () => {
    const stat = { clientId: 1, date: '2024-01-01', ordersReceived: 1 };
    const oRes = await fetch(`http://localhost:${port}/api/order-statistics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stat)
    });
    expect(oRes.status).toBe(200);
    const kpi = { clientId: 1, month: '2024-01-01', shippingAccuracy: 1 };
    const kRes = await fetch(`http://localhost:${port}/api/client-kpis`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kpi)
    });
    expect(kRes.status).toBe(200);
  });

  it('handles dashboard settings', async () => {
    const data = { userId: 1, widgetId: 'w', position: 1, config: {} };
    const res = await fetch(`http://localhost:${port}/api/dashboard-settings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const { data: created } = await res.json();
    const get = await fetch(`http://localhost:${port}/api/dashboard-settings/1`);
    const out = await get.json();
    expect(out.data.length).toBeGreaterThan(0);
  });

  it('serves analytics when enabled', async () => {
    const app = express();
    app.use(express.json());
    const srv = await registerRoutes(app, true);
    let p: number = 0;
    await new Promise<void>(r => srv.listen(0, () => { p = (srv.address() as AddressInfo).port; r(); }));
    const res = await fetch(`http://localhost:${p}/api/analytics/inventory-report`);
    expect(res.status).toBe(200);
    await new Promise<void>(r => srv.close(() => r()));
  });

  it('retrieves and updates resources', async () => {
    // list quotes
    const quotesRes = await fetch(`http://localhost:${port}/api/quote`);
    expect(quotesRes.status).toBe(200);
    const { data: quotes } = await quotesRes.json();
    const quoteId = quotes[0].id;
    const upd = await fetch(`http://localhost:${port}/api/quote/${quoteId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service: 'updated' }) });
    expect(upd.status).toBe(200);

    const notFound = await fetch(`http://localhost:${port}/api/quote/9999`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expect(notFound.status).toBe(404);

    const invRes = await fetch(`http://localhost:${port}/api/inventory?clientId=1`);
    expect(invRes.status).toBe(200);
    const list = await invRes.json();
    const invId = list.data[0].id;
    const invPatch = await fetch(`http://localhost:${port}/api/inventory/${invId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: 99 }) });
    expect(invPatch.status).toBe(200);
    const missingInv = await fetch(`http://localhost:${port}/api/inventory/999`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expect(missingInv.status).toBe(404);

    const shipList = await fetch(`http://localhost:${port}/api/shipments`);
    expect(shipList.status).toBe(200);
    const { data: ships } = await shipList.json();
    const shipId = ships[0].id;
    const shipPatch = await fetch(`http://localhost:${port}/api/shipments/${shipId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'delivered' }) });
    expect(shipPatch.status).toBe(200);

    const statsList = await fetch(`http://localhost:${port}/api/order-statistics`);
    expect(statsList.status).toBe(200);
    const statId = (await statsList.json()).data[0].id;
    const statPatch = await fetch(`http://localhost:${port}/api/order-statistics/${statId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ordersFulfilled: 2 }) });
    expect(statPatch.status).toBe(200);

    const kpiList = await fetch(`http://localhost:${port}/api/client-kpis`);
    expect(kpiList.status).toBe(200);
    const kpiId = (await kpiList.json()).data[0].id;
    const kpiPatch = await fetch(`http://localhost:${port}/api/client-kpis/${kpiId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnRate: 1 }) });
    expect(kpiPatch.status).toBe(200);

    const dashPatch = await fetch(`http://localhost:${port}/api/dashboard-settings/1/w`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: 2 }) });
    expect(dashPatch.status).toBe(200);
    const dashMissing = await fetch(`http://localhost:${port}/api/dashboard-settings/1/missing`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expect(dashMissing.status).toBe(404);
  });
});
