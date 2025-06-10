import docusign from 'docusign-esign';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';
import { supabase } from '../lib/supabase';

class DocuSignService {
  private apiClient: docusign.ApiClient;
  private accountId: string;

  constructor() {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi');
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
    
    this.configureJWTAuth();
  }

  private configureJWTAuth() {
    try {
      const privateKeyPath = process.env.DOCUSIGN_PRIVATE_KEY_PATH || './keys/docusign-private.key';
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      
      this.apiClient.configureJWTAuthorizationFlow(
        privateKey,
        'signature',
        process.env.DOCUSIGN_INTEGRATION_KEY || '',
        process.env.DOCUSIGN_USER_ID || '',
        3600 // 1 hour
      );
    } catch (error) {
      console.error('Error configuring DocuSign JWT:', error);
    }
  }

  // Send contract for signature
  async sendContractForSignature(quoteId: number, contractTemplateId: string, signerData: {
    name: string;
    email: string;
    company: string;
  }) {
    try {
      const quote = await storage.getQuote(quoteId);
      if (!quote) throw new Error('Quote not found');

      // Create envelope definition
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.emailSubject = `Contract for ${signerData.company} - TSG Fulfillment Services`;
      envelopeDefinition.templateId = contractTemplateId;

      // Template roles
      const templateRole = new docusign.TemplateRole();
      templateRole.email = signerData.email;
      templateRole.name = signerData.name;
      templateRole.roleName = 'Client';
      templateRole.tabs = new docusign.Tabs();

      // Add custom fields
      const textTabs = [
        this.createTextTab('ClientName', signerData.name),
        this.createTextTab('CompanyName', signerData.company),
        this.createTextTab('QuoteNumber', quote.quoteNumber),
        this.createTextTab('TotalAmount', quote.totalAmount?.toString() || '0')
      ];
      templateRole.tabs.textTabs = textTabs;

      envelopeDefinition.templateRoles = [templateRole];
      envelopeDefinition.status = 'sent';

      // Send envelope
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const envelopeSummary = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition
      });

      if (!envelopeSummary.envelopeId) {
        throw new Error('Failed to create DocuSign envelope');
      }

      // Create contract record
      const contractNumber = `CON-${quote.quoteNumber}-${Date.now()}`;
      const contract = await storage.createContract({
        quoteId: quoteId,
        contractNumber: contractNumber,
        clientName: signerData.name,
        contractType: 'service_agreement',
        status: 'sent',
        docusignEnvelopeId: envelopeSummary.envelopeId,
        supabaseFilePath: null,
        signedDate: null,
        expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      return { contract, envelopeId: envelopeSummary.envelopeId };
    } catch (error) {
      console.error('Error sending contract:', error);
      throw error;
    }
  }

  private createTextTab(tabLabel: string, value: string): docusign.Text {
    const textTab = new docusign.Text();
    textTab.tabLabel = tabLabel;
    textTab.value = value;
    textTab.locked = 'true';
    return textTab;
  }

  // Handle DocuSign webhooks
  async handleWebhook(envelopeId: string, status: string) {
    try {
      const contract = await storage.getContractByDocusignEnvelopeId(envelopeId);
      if (!contract) {
        console.warn(`Contract not found for envelope ID: ${envelopeId}`);
        return;
      }

      if (status === 'completed') {
        // Download signed document
        const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
        const documentStream = await envelopesApi.getDocument(
          this.accountId,
          envelopeId,
          'combined'
        );

        // Upload to Supabase
        const fileName = `contracts/${contract.contractNumber}_signed.pdf`;
        const { data, error } = await supabase.storage
          .from('contracts')
          .upload(fileName, documentStream, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (error) throw error;

        // Update contract status
        await storage.updateContract(contract.id, {
          status: 'signed',
          signedDate: new Date(),
          supabaseFilePath: fileName
        });

        // Update related quote status
        if (contract.quoteId) {
          await storage.updateQuote(contract.quoteId, {
            status: 'contracted'
          });
        }
      }
    } catch (error) {
      console.error('Error handling DocuSign webhook:', error);
    }
  }
}

export default new DocuSignService();