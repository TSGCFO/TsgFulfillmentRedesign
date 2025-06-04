import { describe, it, expect } from 'vitest';
import { MemStorage } from '../storage';

const storage = new MemStorage();

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
      clientId: 1, carrier: 'FedEx', trackingNumber: 't', cost: 1
    });
    const updated = await storage.updateShipment(shipment.id, { status: 'delivered' });
    expect(updated?.status).toBe('delivered');
  });

  it('handles inventory and statistics', async () => {
    const inv = await storage.createInventoryLevel({ clientId: 1, productId: 2, quantity: 5, warehouseLocation: 'A', minimumLevel: 1 });
    expect(await storage.getInventoryLevel(inv.id)).toEqual(inv);
    await storage.updateInventoryLevel(inv.id, { quantity: 10 });
    expect((await storage.getInventoryLevel(inv.id))?.quantity).toBe(10);
    expect((await storage.getInventoryLevels(1)).length).toBeGreaterThan(0);

    const stat = await storage.createOrderStatistic({ clientId: 1, date: '2024-01-01', ordersReceived: 1 });
    const stats = await storage.getOrderStatistics(1);
    expect(stats[0]).toEqual(stat);
    await storage.updateOrderStatistic(stat.id, { ordersFulfilled: 1 });
    expect((await storage.getOrderStatistic(stat.id))?.ordersFulfilled).toBe(1);

    const kpi = await storage.createClientKpi({ clientId: 1, month: '2024-01-01', shippingAccuracy: 1 });
    const kpis = await storage.getClientKpis(1);
    expect(kpis[0]).toEqual(kpi);
    await storage.updateClientKpi(kpi.id, { returnRate: 2 });
    expect((await storage.getClientKpi(kpi.id))?.returnRate).toBe(2);
  });

  it('provides analytics', async () => {
    await storage.createShipment({ clientId: 1, carrier: 'UPS', trackingNumber: 'x', cost: 1, status: 'delivered' });
    await storage.createInventoryLevel({ clientId: 1, productId: 3, quantity: 1, warehouseLocation: 'B', minimumLevel: 1 });
    const summary = await storage.getClientAnalyticsSummary(1);
    expect(summary.shipmentSummary.total).toBeGreaterThan(0);
    const perf = await storage.getShippingPerformance(1);
    expect(perf.totalShipments).toBeGreaterThan(0);
    const report = await storage.getInventoryReport(1);
    expect(report.totalUniqueItems).toBeGreaterThan(0);
  });
});
