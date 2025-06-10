// Temporary interface until schema import is fixed
interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string | null;
  status: string;
}

interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    company: string;
    phone: string;
  };
}

interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    dealstage: string;
    amount: string;
    pipeline: string;
  };
}

class HubSpotService {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor() {
    this.apiKey = process.env.HUBSPOT_ACCESS_TOKEN!;
    if (!this.apiKey) {
      throw new Error('HUBSPOT_ACCESS_TOKEN environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createContact(quoteRequest: QuoteRequest): Promise<HubSpotContact> {
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

    return this.makeRequest('/crm/v3/objects/contacts', 'POST', contactData);
  }

  async createDeal(quoteRequest: QuoteRequest, contactId: string): Promise<HubSpotDeal> {
    const dealData = {
      properties: {
        dealname: `${quoteRequest.company} - ${quoteRequest.service}`,
        dealstage: 'appointmentscheduled',
        pipeline: 'default',
        amount: '0',
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        hubspot_owner_id: process.env.HUBSPOT_OWNER_ID || null
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Deal
        }
      ]
    };

    return this.makeRequest('/crm/v3/objects/deals', 'POST', dealData);
  }

  async updateDealStage(dealId: string, stage: string, amount?: number): Promise<HubSpotDeal> {
    const updateData = {
      properties: {
        dealstage: stage,
        ...(amount && { amount: amount.toString() })
      }
    };

    return this.makeRequest(`/crm/v3/objects/deals/${dealId}`, 'PATCH', updateData);
  }

  async syncQuoteRequest(quoteRequest: QuoteRequest): Promise<{ contactId: string; dealId: string }> {
    try {
      // Create or update contact
      const contact = await this.createContact(quoteRequest);
      
      // Create deal associated with contact
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

  async getContacts(limit: number = 100): Promise<HubSpotContact[]> {
    const response = await this.makeRequest(`/crm/v3/objects/contacts?limit=${limit}`);
    return response.results || [];
  }

  async getDeals(limit: number = 100): Promise<HubSpotDeal[]> {
    const response = await this.makeRequest(`/crm/v3/objects/deals?limit=${limit}`);
    return response.results || [];
  }
}

export const hubspotService = new HubSpotService();