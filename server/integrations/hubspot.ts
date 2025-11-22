import { Client } from '@hubspot/api-client';
import { QuoteRequest, Quote } from '@shared/schema';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=hubspot',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('HubSpot not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

// HubSpot Integration Service using Replit Connector
export class HubSpotIntegrationService {
  async createContact(quoteRequest: QuoteRequest) {
    try {
      const client = await getUncachableHubSpotClient();
      
      const contactData = {
        properties: {
          email: quoteRequest.email,
          firstname: quoteRequest.name.split(' ')[0],
          lastname: quoteRequest.name.split(' ').slice(1).join(' ') || '',
          company: quoteRequest.company,
          phone: quoteRequest.phone,
          lifecyclestage: 'lead',
          lead_source: 'Website Quote Request'
        }
      };

      const response = await client.crm.contacts.basicApi.create(contactData);
      return response;
    } catch (error) {
      console.error('HubSpot create contact error:', error);
      throw error;
    }
  }

  async createDeal(quoteRequest: QuoteRequest, contactId: string) {
    try {
      const client = await getUncachableHubSpotClient();
      
      const dealProperties: { [key: string]: string } = {
        dealname: `${quoteRequest.company} - ${quoteRequest.service}`,
        dealstage: 'appointmentscheduled',
        pipeline: 'default',
        amount: '0',
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      if (process.env.HUBSPOT_OWNER_ID) {
        dealProperties.hubspot_owner_id = process.env.HUBSPOT_OWNER_ID;
      }
      
      const dealData = {
        properties: dealProperties,
        associations: [
          {
            to: { id: contactId },
            types: [{ 
              associationCategory: 'HUBSPOT_DEFINED' as any, 
              associationTypeId: 3 // Contact to Deal
            }]
          }
        ]
      };

      const response = await client.crm.deals.basicApi.create(dealData);
      return response;
    } catch (error) {
      console.error('HubSpot create deal error:', error);
      throw error;
    }
  }

  async updateDealStage(dealId: string, stage: string, amount?: number) {
    try {
      const client = await getUncachableHubSpotClient();
      
      const updateData = {
        properties: {
          dealstage: stage,
          ...(amount && { amount: amount.toString() })
        }
      };

      const response = await client.crm.deals.basicApi.update(dealId, updateData);
      return response;
    } catch (error) {
      console.error('HubSpot update deal error:', error);
      throw error;
    }
  }

  async syncQuoteRequest(quoteRequest: QuoteRequest) {
    try {
      const contact = await this.createContact(quoteRequest);
      const deal = await this.createDeal(quoteRequest, contact.id);
      
      return {
        contactId: contact.id,
        dealId: deal.id
      };
    } catch (error) {
      console.error('HubSpot sync error:', error);
      throw error;
    }
  }

  async linkQuoteToDeal(quote: Quote, dealId: string) {
    try {
      const client = await getUncachableHubSpotClient();
      
      // Update deal with quote information
      const updateData = {
        properties: {
          amount: quote.totalAmount.toString(),
          description: `Quote #${quote.quoteNumber}: ${quote.title}`,
          custom_quote_id: quote.id.toString()
        }
      };

      const response = await client.crm.deals.basicApi.update(dealId, updateData);
      return response;
    } catch (error) {
      console.error('HubSpot link quote error:', error);
      throw error;
    }
  }

  async updateDealFromContract(contractId: number, dealId: string, status: string) {
    try {
      const client = await getUncachableHubSpotClient();
      
      let dealstage = 'appointmentscheduled';
      if (status === 'signed') {
        dealstage = 'closedwon';
      } else if (status === 'declined') {
        dealstage = 'closedlost';
      }

      const updateData = {
        properties: {
          dealstage,
          contract_status: status,
          contract_id: contractId.toString()
        }
      };

      const response = await client.crm.deals.basicApi.update(dealId, updateData);
      return response;
    } catch (error) {
      console.error('HubSpot update deal from contract error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const hubspotIntegration = new HubSpotIntegrationService();