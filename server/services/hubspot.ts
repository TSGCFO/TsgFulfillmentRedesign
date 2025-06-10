import { Client as HubSpotClient } from '@hubspot/api-client';
import { storage } from '../storage';

class HubSpotService {
  private client: HubSpotClient;

  constructor() {
    this.client = new HubSpotClient({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN
    });
  }

  // Sync quote request to HubSpot as a deal
  async syncQuoteRequestToDeal(quoteRequestId: number) {
    try {
      const quoteRequest = await storage.getQuoteRequest(quoteRequestId);
      if (!quoteRequest) throw new Error('Quote request not found');

      // Create or update contact
      const contactId = await this.createOrUpdateContact({
        email: quoteRequest.email,
        firstname: quoteRequest.name.split(' ')[0],
        lastname: quoteRequest.name.split(' ').slice(1).join(' '),
        company: quoteRequest.company,
        phone: quoteRequest.phone
      });

      // Create deal
      const dealData = {
        properties: {
          dealname: `${quoteRequest.company} - ${quoteRequest.service}`,
          dealstage: 'appointmentscheduled',
          pipeline: 'default',
          amount: '0',
          closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          hubspot_owner_id: quoteRequest.assignedTo?.toString() || '',
          deal_currency_code: 'USD'
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
          }
        ]
      };

      const deal = await this.client.crm.deals.basicApi.create(dealData);

      // Log sync
      await storage.createHubspotSyncLog({
        recordType: 'quote_request',
        recordId: quoteRequestId,
        hubspotId: deal.id,
        syncAction: 'create_deal',
        syncStatus: 'success'
      });

      return deal;
    } catch (error) {
      // Log sync error
      await storage.createHubspotSyncLog({
        recordType: 'quote_request',
        recordId: quoteRequestId,
        hubspotId: null,
        syncAction: 'create_deal',
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Create or update contact in HubSpot
  private async createOrUpdateContact(contactData: any) {
    try {
      // Try to find existing contact by email
      const searchResults = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: contactData.email
          }]
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1
      });

      if (searchResults.results && searchResults.results.length > 0) {
        // Update existing contact
        const contactId = searchResults.results[0].id;
        await this.client.crm.contacts.basicApi.update(contactId, {
          properties: contactData
        });
        return contactId;
      } else {
        // Create new contact
        const contact = await this.client.crm.contacts.basicApi.create({
          properties: contactData
        });
        return contact.id;
      }
    } catch (error) {
      console.error('Error creating/updating HubSpot contact:', error);
      throw error;
    }
  }

  // Sync deal updates from HubSpot
  async syncDealFromHubSpot(dealId: string) {
    try {
      const deal = await this.client.crm.deals.basicApi.getById(dealId, [
        'dealname', 'dealstage', 'amount', 'closedate'
      ]);

      // Find corresponding quote in our system
      const quote = await storage.getQuoteByHubspotDealId(dealId);
      if (quote) {
        await storage.updateQuote(quote.id, {
          totalAmount: parseFloat(deal.properties.amount || '0'),
          status: this.mapHubspotStageToStatus(deal.properties.dealstage),
          updatedAt: new Date()
        });
      }

      return deal;
    } catch (error) {
      console.error('Error syncing deal from HubSpot:', error);
      throw error;
    }
  }

  private mapHubspotStageToStatus(hubspotStage: string): string {
    const stageMap: { [key: string]: string } = {
      'appointmentscheduled': 'pending',
      'qualifiedtobuy': 'in_review',
      'presentationscheduled': 'quoted',
      'decisionmakerboughtin': 'approved',
      'contractsent': 'contract_sent',
      'closedwon': 'accepted',
      'closedlost': 'rejected'
    };
    return stageMap[hubspotStage] || 'draft';
  }
}

export default new HubSpotService();