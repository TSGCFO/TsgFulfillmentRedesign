import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client as HubSpotClient } from '@hubspot/api-client';
import hubspotService from '../services/hubspot';
import { storage } from '../storage';

// Mock dependencies
vi.mock('@hubspot/api-client');
vi.mock('../storage');

describe('HubSpot Service', () => {
  let mockHubSpotClient: any;
  let mockQuoteRequest: any;
  let mockQuote: any;

  beforeEach(() => {
    // Setup mock HubSpot client
    mockHubSpotClient = {
      crm: {
        contacts: {
          basicApi: {
            create: vi.fn(),
            update: vi.fn()
          },
          searchApi: {
            doSearch: vi.fn()
          }
        },
        deals: {
          basicApi: {
            create: vi.fn(),
            getById: vi.fn()
          }
        }
      }
    };

    vi.mocked(HubSpotClient).mockImplementation(() => mockHubSpotClient);

    // Setup mock data
    mockQuoteRequest = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Test Company',
      service: 'Order Fulfillment',
      assignedTo: 1
    };

    mockQuote = {
      id: 1,
      quoteNumber: 'QUO-12345',
      totalAmount: 1000,
      hubspotDealId: 'deal-123'
    };

    vi.clearAllMocks();
  });

  describe('syncQuoteRequestToDeal', () => {
    it('should successfully create deal and contact in HubSpot', async () => {
      // Mock storage calls
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(mockQuoteRequest);
      vi.mocked(storage.createHubspotSyncLog).mockResolvedValue({} as any);

      // Mock HubSpot API calls
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue({
        results: []
      });
      mockHubSpotClient.crm.contacts.basicApi.create.mockResolvedValue({
        id: 'contact-123'
      });
      mockHubSpotClient.crm.deals.basicApi.create.mockResolvedValue({
        id: 'deal-456'
      });

      const result = await hubspotService.syncQuoteRequestToDeal(1);

      expect(storage.getQuoteRequest).toHaveBeenCalledWith(1);
      expect(mockHubSpotClient.crm.contacts.basicApi.create).toHaveBeenCalledWith({
        properties: {
          email: 'john@example.com',
          firstname: 'John',
          lastname: 'Doe',
          company: 'Test Company',
          phone: '555-1234'
        }
      });
      expect(mockHubSpotClient.crm.deals.basicApi.create).toHaveBeenCalledWith({
        properties: {
          dealname: 'Test Company - Order Fulfillment',
          dealstage: 'appointmentscheduled',
          pipeline: 'default',
          amount: '0',
          closedate: expect.any(String),
          hubspot_owner_id: '1',
          deal_currency_code: 'USD'
        },
        associations: [
          {
            to: { id: 'contact-123' },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
          }
        ]
      });
      expect(storage.createHubspotSyncLog).toHaveBeenCalledWith({
        recordType: 'quote_request',
        recordId: 1,
        hubspotId: 'deal-456',
        syncAction: 'create_deal',
        syncStatus: 'success'
      });
      expect(result.id).toBe('deal-456');
    });

    it('should update existing contact instead of creating new one', async () => {
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(mockQuoteRequest);
      vi.mocked(storage.createHubspotSyncLog).mockResolvedValue({} as any);

      // Mock existing contact found
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue({
        results: [{ id: 'existing-contact-123' }]
      });
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({});
      mockHubSpotClient.crm.deals.basicApi.create.mockResolvedValue({
        id: 'deal-456'
      });

      await hubspotService.syncQuoteRequestToDeal(1);

      expect(mockHubSpotClient.crm.contacts.basicApi.update).toHaveBeenCalledWith(
        'existing-contact-123',
        {
          properties: {
            email: 'john@example.com',
            firstname: 'John',
            lastname: 'Doe',
            company: 'Test Company',
            phone: '555-1234'
          }
        }
      );
      expect(mockHubSpotClient.crm.contacts.basicApi.create).not.toHaveBeenCalled();
    });

    it('should handle quote request not found', async () => {
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(null);

      await expect(hubspotService.syncQuoteRequestToDeal(999))
        .rejects.toThrow('Quote request not found');

      expect(mockHubSpotClient.crm.contacts.searchApi.doSearch).not.toHaveBeenCalled();
      expect(mockHubSpotClient.crm.deals.basicApi.create).not.toHaveBeenCalled();
    });

    it('should log error when HubSpot API fails', async () => {
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(mockQuoteRequest);
      vi.mocked(storage.createHubspotSyncLog).mockResolvedValue({} as any);

      const hubspotError = new Error('HubSpot API error');
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockRejectedValue(hubspotError);

      await expect(hubspotService.syncQuoteRequestToDeal(1))
        .rejects.toThrow('HubSpot API error');

      expect(storage.createHubspotSyncLog).toHaveBeenCalledWith({
        recordType: 'quote_request',
        recordId: 1,
        hubspotId: null,
        syncAction: 'create_deal',
        syncStatus: 'error',
        errorMessage: 'HubSpot API error'
      });
    });

    it('should handle single name correctly', async () => {
      const singleNameRequest = { ...mockQuoteRequest, name: 'Madonna' };
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(singleNameRequest);
      vi.mocked(storage.createHubspotSyncLog).mockResolvedValue({} as any);

      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue({
        results: []
      });
      mockHubSpotClient.crm.contacts.basicApi.create.mockResolvedValue({
        id: 'contact-123'
      });
      mockHubSpotClient.crm.deals.basicApi.create.mockResolvedValue({
        id: 'deal-456'
      });

      await hubspotService.syncQuoteRequestToDeal(1);

      expect(mockHubSpotClient.crm.contacts.basicApi.create).toHaveBeenCalledWith({
        properties: {
          email: 'john@example.com',
          firstname: 'Madonna',
          lastname: '',
          company: 'Test Company',
          phone: '555-1234'
        }
      });
    });
  });

  describe('syncDealFromHubSpot', () => {
    it('should update quote when deal is found in system', async () => {
      const mockDeal = {
        properties: {
          dealname: 'Test Deal',
          dealstage: 'closedwon',
          amount: '2500',
          closedate: new Date().toISOString()
        }
      };

      mockHubSpotClient.crm.deals.basicApi.getById.mockResolvedValue(mockDeal);
      vi.mocked(storage.getQuoteByHubspotDealId).mockResolvedValue(mockQuote);
      vi.mocked(storage.updateQuote).mockResolvedValue({} as any);

      const result = await hubspotService.syncDealFromHubSpot('deal-123');

      expect(mockHubSpotClient.crm.deals.basicApi.getById).toHaveBeenCalledWith(
        'deal-123',
        ['dealname', 'dealstage', 'amount', 'closedate']
      );
      expect(storage.getQuoteByHubspotDealId).toHaveBeenCalledWith('deal-123');
      expect(storage.updateQuote).toHaveBeenCalledWith(1, {
        totalAmount: 2500,
        status: 'accepted',
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual(mockDeal);
    });

    it('should handle quote not found in system', async () => {
      const mockDeal = {
        properties: {
          dealname: 'Test Deal',
          dealstage: 'closedwon',
          amount: '2500'
        }
      };

      mockHubSpotClient.crm.deals.basicApi.getById.mockResolvedValue(mockDeal);
      vi.mocked(storage.getQuoteByHubspotDealId).mockResolvedValue(null);

      const result = await hubspotService.syncDealFromHubSpot('deal-123');

      expect(storage.updateQuote).not.toHaveBeenCalled();
      expect(result).toEqual(mockDeal);
    });

    it('should map HubSpot deal stages correctly', async () => {
      const testCases = [
        { hubspotStage: 'appointmentscheduled', expectedStatus: 'pending' },
        { hubspotStage: 'qualifiedtobuy', expectedStatus: 'in_review' },
        { hubspotStage: 'presentationscheduled', expectedStatus: 'quoted' },
        { hubspotStage: 'decisionmakerboughtin', expectedStatus: 'approved' },
        { hubspotStage: 'contractsent', expectedStatus: 'contract_sent' },
        { hubspotStage: 'closedwon', expectedStatus: 'accepted' },
        { hubspotStage: 'closedlost', expectedStatus: 'rejected' },
        { hubspotStage: 'unknown_stage', expectedStatus: 'draft' }
      ];

      for (const testCase of testCases) {
        const mockDeal = {
          properties: {
            dealstage: testCase.hubspotStage,
            amount: '1000'
          }
        };

        mockHubSpotClient.crm.deals.basicApi.getById.mockResolvedValue(mockDeal);
        vi.mocked(storage.getQuoteByHubspotDealId).mockResolvedValue(mockQuote);
        vi.mocked(storage.updateQuote).mockResolvedValue({} as any);

        await hubspotService.syncDealFromHubSpot('deal-123');

        expect(storage.updateQuote).toHaveBeenCalledWith(1, {
          totalAmount: 1000,
          status: testCase.expectedStatus,
          updatedAt: expect.any(Date)
        });

        vi.clearAllMocks();
      }
    });

    it('should handle HubSpot API errors gracefully', async () => {
      const hubspotError = new Error('Deal not found');
      mockHubSpotClient.crm.deals.basicApi.getById.mockRejectedValue(hubspotError);

      await expect(hubspotService.syncDealFromHubSpot('invalid-deal'))
        .rejects.toThrow('Deal not found');

      expect(storage.getQuoteByHubspotDealId).not.toHaveBeenCalled();
      expect(storage.updateQuote).not.toHaveBeenCalled();
    });

    it('should handle invalid amount values', async () => {
      const mockDeal = {
        properties: {
          dealstage: 'closedwon',
          amount: 'invalid-amount'
        }
      };

      mockHubSpotClient.crm.deals.basicApi.getById.mockResolvedValue(mockDeal);
      vi.mocked(storage.getQuoteByHubspotDealId).mockResolvedValue(mockQuote);
      vi.mocked(storage.updateQuote).mockResolvedValue({} as any);

      await hubspotService.syncDealFromHubSpot('deal-123');

      expect(storage.updateQuote).toHaveBeenCalledWith(1, {
        totalAmount: NaN,
        status: 'accepted',
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('Environment configuration', () => {
    it('should use HUBSPOT_ACCESS_TOKEN from environment', () => {
      process.env.HUBSPOT_ACCESS_TOKEN = 'test-token';
      
      // Force re-import to test constructor
      vi.resetModules();
      
      expect(HubSpotClient).toHaveBeenCalledWith({
        accessToken: 'test-token'
      });

      delete process.env.HUBSPOT_ACCESS_TOKEN;
    });
  });

  describe('Error handling', () => {
    it('should handle network timeouts', async () => {
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(mockQuoteRequest);
      vi.mocked(storage.createHubspotSyncLog).mockResolvedValue({} as any);

      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockRejectedValue(timeoutError);

      await expect(hubspotService.syncQuoteRequestToDeal(1))
        .rejects.toThrow('Request timeout');

      expect(storage.createHubspotSyncLog).toHaveBeenCalledWith({
        recordType: 'quote_request',
        recordId: 1,
        hubspotId: null,
        syncAction: 'create_deal',
        syncStatus: 'error',
        errorMessage: 'Request timeout'
      });
    });

    it('should handle rate limiting', async () => {
      vi.mocked(storage.getQuoteRequest).mockResolvedValue(mockQuoteRequest);
      vi.mocked(storage.createHubspotSyncLog).mockResolvedValue({} as any);

      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockRejectedValue(rateLimitError);

      await expect(hubspotService.syncQuoteRequestToDeal(1))
        .rejects.toThrow('Rate limit exceeded');
    });
  });
});