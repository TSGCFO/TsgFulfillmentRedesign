import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';

// Mock the storage module
vi.mock('../storage', () => ({
  storage: {
    createQuoteRequest: vi.fn(),
    getQuoteRequests: vi.fn(),
    getQuoteRequest: vi.fn(),
    updateQuoteRequest: vi.fn(),
    createInventoryLevel: vi.fn(),
    getInventoryLevels: vi.fn(),
    getInventoryLevel: vi.fn(),
    updateInventoryLevel: vi.fn(),
    createShipment: vi.fn(),
    getShipments: vi.fn(),
    getShipment: vi.fn(),
    updateShipment: vi.fn(),
    createOrderStatistic: vi.fn(),
    getOrderStatistics: vi.fn(),
    updateOrderStatistic: vi.fn(),
    createClientKpi: vi.fn(),
    getClientKpis: vi.fn(),
    updateClientKpi: vi.fn(),
    saveDashboardSetting: vi.fn(),
    getDashboardSettings: vi.fn(),
    updateDashboardSetting: vi.fn(),
    getClientAnalyticsSummary: vi.fn(),
    getShippingPerformance: vi.fn(),
    getInventoryReport: vi.fn(),
    getReportData: vi.fn(),
    getComparisonData: vi.fn(),
  },
}));

describe('Enhanced Server Routes', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app, false); // analytics disabled
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  describe('Quote Request Routes', () => {
    const validQuoteRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      company: 'ACME Corp',
      service: 'Warehousing',
      message: 'Test message',
      privacyConsent: true,
    };

    describe('POST /api/quote-requests', () => {
      it('creates a quote request successfully', async () => {
        const mockQuoteRequest = { id: 1, ...validQuoteRequest };
        (storage.createQuoteRequest as any).mockResolvedValue(mockQuoteRequest);

        const response = await request(app)
          .post('/api/quote-requests')
          .send(validQuoteRequest);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Quote request received successfully');
        expect(response.body.data).toEqual(mockQuoteRequest);
        expect(storage.createQuoteRequest).toHaveBeenCalledWith(validQuoteRequest);
      });

      it('handles validation errors', async () => {
        const invalidQuoteRequest = {
          name: '', // Invalid empty name
          email: 'invalid-email', // Invalid email format
        };

        const response = await request(app)
          .post('/api/quote-requests')
          .send(invalidQuoteRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid quote request data');
        expect(response.body.error).toBeDefined();
      });

      it('handles storage errors', async () => {
        (storage.createQuoteRequest as any).mockRejectedValue(new Error('Database error'));

        const response = await request(app)
          .post('/api/quote-requests')
          .send(validQuoteRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid quote request data');
        expect(response.body.error).toBe('Database error');
      });
    });

    describe('POST /api/quote', () => {
      it('creates a quote request successfully (alternative endpoint)', async () => {
        const mockQuoteRequest = { id: 1, ...validQuoteRequest };
        (storage.createQuoteRequest as any).mockResolvedValue(mockQuoteRequest);

        const response = await request(app)
          .post('/api/quote')
          .send(validQuoteRequest);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Quote request received successfully');
        expect(storage.createQuoteRequest).toHaveBeenCalledWith(validQuoteRequest);
      });
    });

    describe('GET /api/quote', () => {
      it('retrieves all quote requests', async () => {
        const mockQuoteRequests = [
          { id: 1, ...validQuoteRequest },
          { id: 2, ...validQuoteRequest, name: 'Jane Doe' },
        ];
        (storage.getQuoteRequests as any).mockResolvedValue(mockQuoteRequests);

        const response = await request(app).get('/api/quote');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockQuoteRequests);
        expect(storage.getQuoteRequests).toHaveBeenCalled();
      });

      it('handles errors when retrieving quote requests', async () => {
        (storage.getQuoteRequests as any).mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/quote');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Error retrieving quote requests');
        expect(response.body.error).toBe('Database error');
      });
    });

    describe('GET /api/quote/:id', () => {
      it('retrieves a specific quote request', async () => {
        const mockQuoteRequest = { id: 1, ...validQuoteRequest };
        (storage.getQuoteRequest as any).mockResolvedValue(mockQuoteRequest);

        const response = await request(app).get('/api/quote/1');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockQuoteRequest);
        expect(storage.getQuoteRequest).toHaveBeenCalledWith(1);
      });

      it('returns 404 for non-existent quote request', async () => {
        (storage.getQuoteRequest as any).mockResolvedValue(null);

        const response = await request(app).get('/api/quote/999');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Quote request not found');
      });

      it('handles invalid ID parameter', async () => {
        (storage.getQuoteRequest as any).mockRejectedValue(new Error('Invalid ID'));

        const response = await request(app).get('/api/quote/invalid');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Error retrieving quote request');
      });
    });

    describe('PATCH /api/quote/:id', () => {
      it('updates a quote request successfully', async () => {
        const updateData = { status: 'reviewed' };
        const updatedQuoteRequest = { id: 1, ...validQuoteRequest, ...updateData };
        (storage.updateQuoteRequest as any).mockResolvedValue(updatedQuoteRequest);

        const response = await request(app)
          .patch('/api/quote/1')
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Quote request updated successfully');
        expect(response.body.data).toEqual(updatedQuoteRequest);
        expect(storage.updateQuoteRequest).toHaveBeenCalledWith(1, updateData);
      });

      it('returns 404 for non-existent quote request', async () => {
        (storage.updateQuoteRequest as any).mockResolvedValue(null);

        const response = await request(app)
          .patch('/api/quote/999')
          .send({ status: 'reviewed' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Quote request not found');
      });
    });
  });

  describe('Contact Form Route', () => {
    describe('POST /api/contact', () => {
      it('processes contact form successfully', async () => {
        const contactData = {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello, I need help with shipping.',
        };

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        const response = await request(app)
          .post('/api/contact')
          .send(contactData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Contact form submitted successfully');
        expect(consoleSpy).toHaveBeenCalledWith('Contact form submission:', contactData);

        consoleSpy.mockRestore();
      });

      it('handles contact form errors', async () => {
        // Mock console.log to throw an error
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
          throw new Error('Logging error');
        });

        const response = await request(app)
          .post('/api/contact')
          .send({ name: 'Test' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Error processing contact form');

        consoleSpy.mockRestore();
      });
    });
  });

  describe('Inventory Routes', () => {
    const validInventoryLevel = {
      clientId: 1,
      sku: 'TEST-001',
      productName: 'Test Product',
      quantity: 100,
      reservedQuantity: 10,
      availableQuantity: 90,
      location: 'A1-B2-C3',
    };

    describe('POST /api/inventory', () => {
      it('creates inventory level successfully', async () => {
        const mockInventoryLevel = { id: 1, ...validInventoryLevel };
        (storage.createInventoryLevel as any).mockResolvedValue(mockInventoryLevel);

        const response = await request(app)
          .post('/api/inventory')
          .send(validInventoryLevel);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Inventory level created successfully');
        expect(response.body.data).toEqual(mockInventoryLevel);
      });

      it('validates inventory level data', async () => {
        const invalidInventoryLevel = {
          clientId: 'invalid', // Should be number
          sku: '', // Required field
        };

        const response = await request(app)
          .post('/api/inventory')
          .send(invalidInventoryLevel);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid inventory level data');
      });
    });

    describe('GET /api/inventory', () => {
      it('retrieves all inventory levels', async () => {
        const mockInventoryLevels = [
          { id: 1, ...validInventoryLevel },
          { id: 2, ...validInventoryLevel, sku: 'TEST-002' },
        ];
        (storage.getInventoryLevels as any).mockResolvedValue(mockInventoryLevels);

        const response = await request(app).get('/api/inventory');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockInventoryLevels);
        expect(storage.getInventoryLevels).toHaveBeenCalledWith(undefined);
      });

      it('filters inventory levels by clientId', async () => {
        const mockInventoryLevels = [{ id: 1, ...validInventoryLevel }];
        (storage.getInventoryLevels as any).mockResolvedValue(mockInventoryLevels);

        const response = await request(app).get('/api/inventory?clientId=1');

        expect(response.status).toBe(200);
        expect(storage.getInventoryLevels).toHaveBeenCalledWith(1);
      });
    });

    describe('GET /api/inventory/:id', () => {
      it('retrieves specific inventory level', async () => {
        const mockInventoryLevel = { id: 1, ...validInventoryLevel };
        (storage.getInventoryLevel as any).mockResolvedValue(mockInventoryLevel);

        const response = await request(app).get('/api/inventory/1');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(mockInventoryLevel);
        expect(storage.getInventoryLevel).toHaveBeenCalledWith(1);
      });

      it('returns 404 for non-existent inventory level', async () => {
        (storage.getInventoryLevel as any).mockResolvedValue(null);

        const response = await request(app).get('/api/inventory/999');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Inventory level not found');
      });
    });

    describe('PATCH /api/inventory/:id', () => {
      it('updates inventory level successfully', async () => {
        const updateData = { quantity: 150 };
        const updatedInventoryLevel = { id: 1, ...validInventoryLevel, ...updateData };
        (storage.updateInventoryLevel as any).mockResolvedValue(updatedInventoryLevel);

        const response = await request(app)
          .patch('/api/inventory/1')
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Inventory level updated successfully');
        expect(response.body.data).toEqual(updatedInventoryLevel);
      });

      it('returns 404 for non-existent inventory level', async () => {
        (storage.updateInventoryLevel as any).mockResolvedValue(null);

        const response = await request(app)
          .patch('/api/inventory/999')
          .send({ quantity: 150 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Inventory level not found');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles unknown errors gracefully', async () => {
      (storage.getQuoteRequests as any).mockRejectedValue('Unknown error');

      const response = await request(app).get('/api/quote');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error retrieving quote requests');
      expect(response.body.error).toBe('Unknown error');
    });

    it('handles Error objects correctly', async () => {
      (storage.getQuoteRequests as any).mockRejectedValue(new Error('Specific error message'));

      const response = await request(app).get('/api/quote');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Specific error message');
    });
  });

  describe('Parameter Validation', () => {
    it('handles invalid numeric parameters', async () => {
      const response = await request(app).get('/api/quote/abc');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error retrieving quote request');
    });

    it('handles valid numeric string parameters', async () => {
      const mockQuoteRequest = { id: 123, name: 'Test' };
      (storage.getQuoteRequest as any).mockResolvedValue(mockQuoteRequest);

      const response = await request(app).get('/api/quote/123');

      expect(response.status).toBe(200);
      expect(storage.getQuoteRequest).toHaveBeenCalledWith(123);
    });
  });
});

describe('Analytics Routes (Enabled)', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app, true); // analytics enabled
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  describe('Analytics Endpoints', () => {
    it('GET /api/analytics/client-summary/:clientId returns client summary', async () => {
      const mockSummary = {
        clientId: 1,
        totalOrders: 100,
        totalRevenue: 50000,
        averageOrderValue: 500,
      };
      (storage.getClientAnalyticsSummary as any).mockResolvedValue(mockSummary);

      const response = await request(app).get('/api/analytics/client-summary/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockSummary);
      expect(storage.getClientAnalyticsSummary).toHaveBeenCalledWith(1);
    });

    it('GET /api/analytics/shipping-performance returns shipping data', async () => {
      const mockPerformance = {
        onTimeDelivery: 95.5,
        averageDeliveryTime: 2.3,
        totalShipments: 1000,
      };
      (storage.getShippingPerformance as any).mockResolvedValue(mockPerformance);

      const response = await request(app)
        .get('/api/analytics/shipping-performance')
        .query({
          clientId: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockPerformance);
      expect(storage.getShippingPerformance).toHaveBeenCalledWith(
        1,
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
    });

    it('GET /api/analytics/inventory-report returns inventory data', async () => {
      const mockReport = {
        totalSKUs: 500,
        totalValue: 100000,
        lowStockItems: 25,
      };
      (storage.getInventoryReport as any).mockResolvedValue(mockReport);

      const response = await request(app).get('/api/analytics/inventory-report?clientId=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockReport);
      expect(storage.getInventoryReport).toHaveBeenCalledWith(1);
    });

    it('GET /api/analytics/report-data validates required parameters', async () => {
      const response = await request(app).get('/api/analytics/report-data');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required parameters');
    });

    it('GET /api/analytics/report-data returns report data with all parameters', async () => {
      const mockReportData = {
        reportType: 'sales',
        data: [{ month: 'Jan', sales: 10000 }],
      };
      (storage.getReportData as any).mockResolvedValue(mockReportData);

      const response = await request(app)
        .get('/api/analytics/report-data')
        .query({
          clientId: '1',
          reportType: 'sales',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockReportData);
      expect(storage.getReportData).toHaveBeenCalledWith(
        1,
        'sales',
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
    });

    it('GET /api/analytics/comparison validates required parameters', async () => {
      const response = await request(app).get('/api/analytics/comparison');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required parameters');
    });

    it('GET /api/analytics/comparison returns comparison data', async () => {
      const mockComparisonData = {
        periodA: { value: 1000, change: 10 },
        periodB: { value: 900, change: -5 },
      };
      (storage.getComparisonData as any).mockResolvedValue(mockComparisonData);

      const response = await request(app)
        .get('/api/analytics/comparison')
        .query({
          clientId: '1',
          periodAStart: '2024-01-01',
          periodAEnd: '2024-06-30',
          periodBStart: '2023-01-01',
          periodBEnd: '2023-06-30',
          metric: 'revenue',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockComparisonData);
      expect(storage.getComparisonData).toHaveBeenCalledWith(
        1,
        new Date('2024-01-01'),
        new Date('2024-06-30'),
        new Date('2023-01-01'),
        new Date('2023-06-30'),
        'revenue'
      );
    });
  });
});