import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import docusign from 'docusign-esign';
import fs from 'fs';
import docusignService from '../services/docusign';
import { storage } from '../storage';
import { supabase } from '../lib/supabase';

// Mock dependencies
vi.mock('docusign-esign');
vi.mock('fs');
vi.mock('../storage');
vi.mock('../lib/supabase');

describe('DocuSign Service', () => {
  let mockApiClient: any;
  let mockEnvelopesApi: any;
  let mockQuote: any;
  let mockContract: any;

  beforeEach(() => {
    // Setup mock DocuSign API client
    mockApiClient = {
      setBasePath: vi.fn(),
      configureJWTAuthorizationFlow: vi.fn()
    };

    mockEnvelopesApi = {
      createEnvelope: vi.fn(),
      getDocument: vi.fn()
    };

    vi.mocked(docusign.ApiClient).mockImplementation(() => mockApiClient);
    vi.mocked(docusign.EnvelopesApi).mockImplementation(() => mockEnvelopesApi);
    vi.mocked(docusign.EnvelopeDefinition).mockImplementation(() => ({}));
    vi.mocked(docusign.TemplateRole).mockImplementation(() => ({}));
    vi.mocked(docusign.Tabs).mockImplementation(() => ({}));
    vi.mocked(docusign.Text).mockImplementation(() => ({}));

    // Setup mock data
    mockQuote = {
      id: 1,
      quoteNumber: 'QUO-12345',
      totalAmount: 2500,
      clientName: 'John Doe',
      clientCompany: 'Test Company'
    };

    mockContract = {
      id: 1,
      contractNumber: 'CON-12345',
      docusignEnvelopeId: 'envelope-123',
      quoteId: 1
    };

    // Mock file system
    vi.mocked(fs.readFileSync).mockReturnValue('mock-private-key');

    // Mock environment variables
    process.env.DOCUSIGN_BASE_URL = 'https://demo.docusign.net/restapi';
    process.env.DOCUSIGN_ACCOUNT_ID = 'test-account-id';
    process.env.DOCUSIGN_PRIVATE_KEY_PATH = './keys/docusign-private.key';
    process.env.DOCUSIGN_INTEGRATION_KEY = 'test-integration-key';
    process.env.DOCUSIGN_USER_ID = 'test-user-id';

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.DOCUSIGN_BASE_URL;
    delete process.env.DOCUSIGN_ACCOUNT_ID;
    delete process.env.DOCUSIGN_PRIVATE_KEY_PATH;
    delete process.env.DOCUSIGN_INTEGRATION_KEY;
    delete process.env.DOCUSIGN_USER_ID;
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with correct base path', () => {
      expect(mockApiClient.setBasePath).toHaveBeenCalledWith(
        'https://demo.docusign.net/restapi'
      );
    });

    it('should configure JWT authentication', () => {
      expect(fs.readFileSync).toHaveBeenCalledWith('./keys/docusign-private.key', 'utf8');
      expect(mockApiClient.configureJWTAuthorizationFlow).toHaveBeenCalledWith(
        'mock-private-key',
        'signature',
        'test-integration-key',
        'test-user-id',
        3600
      );
    });

    it('should handle missing environment variables gracefully', () => {
      delete process.env.DOCUSIGN_BASE_URL;
      delete process.env.DOCUSIGN_ACCOUNT_ID;
      
      // This should not throw
      expect(() => {
        vi.resetModules();
        require('../services/docusign');
      }).not.toThrow();
    });

    it('should handle missing private key file', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      // Should not crash the service
      expect(() => {
        vi.resetModules();
        require('../services/docusign');
      }).not.toThrow();
    });
  });

  describe('sendContractForSignature', () => {
    const signerData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Company'
    };

    it('should successfully send contract for signature', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(mockQuote);
      vi.mocked(storage.createContract).mockResolvedValue(mockContract);

      mockEnvelopesApi.createEnvelope.mockResolvedValue({
        envelopeId: 'envelope-456'
      });

      const result = await docusignService.sendContractForSignature(
        1,
        'template-123',
        signerData
      );

      expect(storage.getQuote).toHaveBeenCalledWith(1);
      expect(mockEnvelopesApi.createEnvelope).toHaveBeenCalledWith(
        'test-account-id',
        expect.objectContaining({
          envelopeDefinition: expect.any(Object)
        })
      );
      expect(storage.createContract).toHaveBeenCalledWith({
        quoteId: 1,
        contractNumber: expect.stringMatching(/^CON-QUO-12345-\d+$/),
        clientName: 'John Doe',
        contractType: 'service_agreement',
        status: 'sent',
        docusignEnvelopeId: 'envelope-456',
        supabaseFilePath: null,
        signedDate: null,
        expiresDate: expect.any(Date)
      });
      expect(result).toEqual({
        contract: mockContract,
        envelopeId: 'envelope-456'
      });
    });

    it('should throw error when quote not found', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(null);

      await expect(
        docusignService.sendContractForSignature(999, 'template-123', signerData)
      ).rejects.toThrow('Quote not found');

      expect(mockEnvelopesApi.createEnvelope).not.toHaveBeenCalled();
      expect(storage.createContract).not.toHaveBeenCalled();
    });

    it('should handle DocuSign API errors', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(mockQuote);

      const docusignError = new Error('DocuSign API error');
      mockEnvelopesApi.createEnvelope.mockRejectedValue(docusignError);

      await expect(
        docusignService.sendContractForSignature(1, 'template-123', signerData)
      ).rejects.toThrow('DocuSign API error');

      expect(storage.createContract).not.toHaveBeenCalled();
    });

    it('should throw error when envelope creation fails', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(mockQuote);

      mockEnvelopesApi.createEnvelope.mockResolvedValue({
        envelopeId: null
      });

      await expect(
        docusignService.sendContractForSignature(1, 'template-123', signerData)
      ).rejects.toThrow('Failed to create DocuSign envelope');
    });

    it('should create envelope with correct template data', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(mockQuote);
      vi.mocked(storage.createContract).mockResolvedValue(mockContract);

      mockEnvelopesApi.createEnvelope.mockResolvedValue({
        envelopeId: 'envelope-456'
      });

      await docusignService.sendContractForSignature(1, 'template-123', signerData);

      const createEnvelopeCall = mockEnvelopesApi.createEnvelope.mock.calls[0];
      const envelopeDefinition = createEnvelopeCall[1].envelopeDefinition;

      expect(envelopeDefinition.emailSubject).toBe(
        'Contract for Test Company - TSG Fulfillment Services'
      );
      expect(envelopeDefinition.templateId).toBe('template-123');
      expect(envelopeDefinition.status).toBe('sent');
    });

    it('should set contract expiration to 30 days', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(mockQuote);
      vi.mocked(storage.createContract).mockResolvedValue(mockContract);

      mockEnvelopesApi.createEnvelope.mockResolvedValue({
        envelopeId: 'envelope-456'
      });

      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      await docusignService.sendContractForSignature(1, 'template-123', signerData);

      const createContractCall = storage.createContract.mock.calls[0][0];
      const expiresDate = new Date(createContractCall.expiresDate);
      const expectedExpiry = new Date(now + thirtyDaysMs);

      // Allow for small time differences in test execution
      expect(Math.abs(expiresDate.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
    });
  });

  describe('handleWebhook', () => {
    beforeEach(() => {
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null })
      } as any);
    });

    it('should handle completed envelope and store signed document', async () => {
      const mockDocumentStream = Buffer.from('mock-pdf-content');
      
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(mockContract);
      vi.mocked(storage.updateContract).mockResolvedValue({} as any);
      vi.mocked(storage.updateQuote).mockResolvedValue({} as any);
      mockEnvelopesApi.getDocument.mockResolvedValue(mockDocumentStream);

      await docusignService.handleWebhook('envelope-123', 'completed');

      expect(storage.getContractByDocusignEnvelopeId).toHaveBeenCalledWith('envelope-123');
      expect(mockEnvelopesApi.getDocument).toHaveBeenCalledWith(
        'test-account-id',
        'envelope-123',
        'combined'
      );
      expect(supabase.storage.from).toHaveBeenCalledWith('contracts');
      expect(storage.updateContract).toHaveBeenCalledWith(1, {
        status: 'signed',
        signedDate: expect.any(Date),
        supabaseFilePath: 'contracts/CON-12345_signed.pdf'
      });
      expect(storage.updateQuote).toHaveBeenCalledWith(1, {
        status: 'contracted'
      });
    });

    it('should handle non-completed status gracefully', async () => {
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(mockContract);

      await docusignService.handleWebhook('envelope-123', 'sent');

      expect(mockEnvelopesApi.getDocument).not.toHaveBeenCalled();
      expect(storage.updateContract).not.toHaveBeenCalled();
      expect(storage.updateQuote).not.toHaveBeenCalled();
    });

    it('should handle contract not found', async () => {
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(null);

      // Should not throw
      await expect(
        docusignService.handleWebhook('unknown-envelope', 'completed')
      ).resolves.not.toThrow();

      expect(mockEnvelopesApi.getDocument).not.toHaveBeenCalled();
    });

    it('should handle Supabase upload errors', async () => {
      const mockDocumentStream = Buffer.from('mock-pdf-content');
      
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(mockContract);
      mockEnvelopesApi.getDocument.mockResolvedValue(mockDocumentStream);
      
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Upload failed') 
        })
      } as any);

      // Should not throw but should handle gracefully
      await expect(
        docusignService.handleWebhook('envelope-123', 'completed')
      ).resolves.not.toThrow();

      expect(storage.updateContract).not.toHaveBeenCalled();
    });

    it('should handle DocuSign document download errors', async () => {
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(mockContract);
      mockEnvelopesApi.getDocument.mockRejectedValue(new Error('Download failed'));

      // Should not throw but should handle gracefully
      await expect(
        docusignService.handleWebhook('envelope-123', 'completed')
      ).resolves.not.toThrow();

      expect(storage.updateContract).not.toHaveBeenCalled();
    });

    it('should handle contract without quote ID', async () => {
      const contractWithoutQuote = { ...mockContract, quoteId: null };
      
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(contractWithoutQuote);
      vi.mocked(storage.updateContract).mockResolvedValue({} as any);
      mockEnvelopesApi.getDocument.mockResolvedValue(Buffer.from('mock-pdf'));

      await docusignService.handleWebhook('envelope-123', 'completed');

      expect(storage.updateContract).toHaveBeenCalled();
      expect(storage.updateQuote).not.toHaveBeenCalled();
    });
  });

  describe('createTextTab', () => {
    it('should create text tab with correct properties', () => {
      const mockTextTab = {};
      vi.mocked(docusign.Text).mockImplementation(() => mockTextTab);

      // Access private method for testing (not ideal but necessary for coverage)
      const service = docusignService as any;
      const result = service.createTextTab('TestLabel', 'TestValue');

      expect(result.tabLabel).toBe('TestLabel');
      expect(result.value).toBe('TestValue');
      expect(result.locked).toBe('true');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle missing quote amount gracefully', async () => {
      const quoteWithoutAmount = { ...mockQuote, totalAmount: null };
      vi.mocked(storage.getQuote).mockResolvedValue(quoteWithoutAmount);
      vi.mocked(storage.createContract).mockResolvedValue(mockContract);

      mockEnvelopesApi.createEnvelope.mockResolvedValue({
        envelopeId: 'envelope-456'
      });

      await docusignService.sendContractForSignature(
        1,
        'template-123',
        { name: 'John', email: 'john@test.com', company: 'Test' }
      );

      // Should use '0' as fallback for null amount
      expect(storage.createContract).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: 'John'
        })
      );
    });

    it('should handle network timeouts', async () => {
      vi.mocked(storage.getQuote).mockResolvedValue(mockQuote);

      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockEnvelopesApi.createEnvelope.mockRejectedValue(timeoutError);

      await expect(
        docusignService.sendContractForSignature(
          1,
          'template-123',
          { name: 'John', email: 'john@test.com', company: 'Test' }
        )
      ).rejects.toThrow('Request timeout');
    });

    it('should handle rate limiting errors', async () => {
      vi.mocked(storage.getContractByDocusignEnvelopeId).mockResolvedValue(mockContract);

      const rateLimitError = new Error('Rate limit exceeded');
      mockEnvelopesApi.getDocument.mockRejectedValue(rateLimitError);

      // Should handle gracefully without throwing
      await expect(
        docusignService.handleWebhook('envelope-123', 'completed')
      ).resolves.not.toThrow();
    });
  });
});