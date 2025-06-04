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
});
