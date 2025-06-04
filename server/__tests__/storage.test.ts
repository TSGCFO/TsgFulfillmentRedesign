import { describe, it, expect } from 'vitest';
import { MemStorage } from '../storage';

const storage = new MemStorage();

// Test constants
const TEST_CLIENT_ID = 1;
const TEST_PRODUCT_ID = 2;

describe('MemStorage', () => {
  it('creates and retrieves quote requests', async () => {
    const qr = await storage.createQuoteRequest({
      name: 'n', email: 'e', phone: 'p', company: 'c', service: 's', message: 'm', consent: true
    });
    const fetched = await storage.getQuoteRequest(qr.id);
    expect(fetched).toEqual(qr);
  });

  it('updates shipments', async () => {
    const shipment = await storage.createShipment({
      clientId: TEST_CLIENT_ID, carrier: 'FedEx', trackingNumber: 't', cost: 1
    });
    const updated = await storage.updateShipment(shipment.id, { status: 'delivered' });
    expect(updated?.status).toBe('delivered');
  });

  it('handles inventory and statistics', async () => {
    const inv = await storage.createInventoryLevel({ clientId: TEST_CLIENT_ID, productId: TEST_PRODUCT_ID, quantity: 5, warehouseLocation: 'A', minimumLevel: 1 });
    expect(await storage.getInventoryLevel(inv.id)).toEqual(inv);
    await storage.updateInventoryLevel(inv.id, { quantity: 10 });
    expect((await storage.getInventoryLevel(inv.id))?.quantity).toBe(10);
    expect((await storage.getInventoryLevels(TEST_CLIENT_ID)).length).toBeGreaterThan(0);

    const stat = await storage.createOrderStatistic({ clientId: TEST_CLIENT_ID, date: '2024-01-01', ordersReceived: 1 });
    const stats = await storage.getOrderStatistics(TEST_CLIENT_ID);
    expect(stats[0]).toEqual(stat);
    await storage.updateOrderStatistic(stat.id, { ordersFulfilled: 1 });
    expect((await storage.getOrderStatistic(stat.id))?.ordersFulfilled).toBe(1);

    const kpi = await storage.createClientKpi({ clientId: TEST_CLIENT_ID, month: '2024-01-01', shippingAccuracy: 1 });
    const kpis = await storage.getClientKpis(TEST_CLIENT_ID);
    expect(kpis[0]).toEqual(kpi);
    await storage.updateClientKpi(kpi.id, { returnRate: 2 });
    expect((await storage.getClientKpi(kpi.id))?.returnRate).toBe(2);
  });

  it('provides analytics', async () => {
    await storage.createShipment({ clientId: TEST_CLIENT_ID, carrier: 'UPS', trackingNumber: 'x', cost: 1, status: 'delivered' });
    await storage.createInventoryLevel({ clientId: TEST_CLIENT_ID, productId: 3, quantity: 1, warehouseLocation: 'B', minimumLevel: 1 });
    const summary = await storage.getClientAnalyticsSummary(TEST_CLIENT_ID);
    expect(summary.shipmentSummary.total).toBeGreaterThan(0);
    const perf = await storage.getShippingPerformance(TEST_CLIENT_ID);
    expect(perf.totalShipments).toBeGreaterThan(0);
    const report = await storage.getInventoryReport(TEST_CLIENT_ID);
    expect(report.totalUniqueItems).toBeGreaterThan(0);
  });
});
