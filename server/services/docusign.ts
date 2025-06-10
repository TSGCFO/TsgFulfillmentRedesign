// Temporary interface until schema import is fixed
interface Contract {
  id: number;
  title: string;
  clientName: string;
  value: number;
  terms: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
}

interface DocuSignEnvelope {
  envelopeId: string;
  status: string;
  emailSubject: string;
  documentsUri: string;
  recipientsUri: string;
  attachmentsUri: string;
  uri: string;
  statusChangedDateTime: string;
  documentsCombinedUri: string;
  certificateUri: string;
  templatesUri: string;
}

interface DocuSignRecipient {
  name: string;
  email: string;
  recipientId: string;
  tabs?: {
    signHereTabs?: Array<{
      documentId: string;
      pageNumber: string;
      xPosition: string;
      yPosition: string;
    }>;
    textTabs?: Array<{
      documentId: string;
      pageNumber: string;
      xPosition: string;
      yPosition: string;
      width: string;
      height: string;
      tabLabel: string;
      value: string;
    }>;
  };
}

class DocuSignService {
  private integrationKey: string;
  private userId: string;
  private accountId: string;
  private privateKey: string;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY!;
    this.userId = process.env.DOCUSIGN_USER_ID!;
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID!;
    this.privateKey = process.env.DOCUSIGN_PRIVATE_KEY!;
    this.baseUrl = `https://demo.docusign.net/restapi/v2.1/accounts/${this.accountId}`;

    if (!this.integrationKey || !this.userId || !this.accountId || !this.privateKey) {
      throw new Error('DocuSign environment variables are required');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    // JWT authentication flow
    const jwt = this.createJWT();
    
    const response = await fetch('https://account-d.docusign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!response.ok) {
      throw new Error(`DocuSign auth error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  private createJWT(): string {
    // In a real implementation, you would use a proper JWT library
    // For now, this is a placeholder that would need proper JWT signing
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.integrationKey,
      sub: this.userId,
      aud: 'account-d.docusign.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'signature impersonation'
    };

    // This would need proper RS256 signing with the private key
    // For demo purposes, returning a placeholder
    return 'jwt_token_placeholder';
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`DocuSign API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createContractEnvelope(contract: Contract, clientEmail: string, clientName: string): Promise<DocuSignEnvelope> {
    const documentContent = this.generateContractPDF(contract);
    
    const envelopeData = {
      emailSubject: `Contract for ${contract.clientName} - ${contract.title}`,
      documents: [
        {
          documentId: '1',
          name: `${contract.title}.pdf`,
          documentBase64: documentContent,
          fileExtension: 'pdf'
        }
      ],
      recipients: {
        signers: [
          {
            name: clientName,
            email: clientEmail,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '400',
                  yPosition: '650'
                }
              ],
              textTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '100',
                  width: '200',
                  height: '20',
                  tabLabel: 'ClientName',
                  value: clientName
                }
              ]
            }
          }
        ]
      },
      status: 'sent'
    };

    return this.makeRequest('/envelopes', 'POST', envelopeData);
  }

  private generateContractPDF(contract: Contract): string {
    // Generate a basic contract template
    const contractTemplate = `
      CONTRACT AGREEMENT
      
      Contract ID: ${contract.id}
      Title: ${contract.title}
      Client: ${contract.clientName}
      Value: $${contract.value}
      
      Terms:
      ${contract.terms}
      
      Start Date: ${contract.startDate}
      End Date: ${contract.endDate}
      
      Status: ${contract.status}
      
      Signature: _____________________
      Date: _____________________
    `;

    // In a real implementation, you would use a PDF generation library
    // For now, return base64 encoded text as placeholder
    return Buffer.from(contractTemplate).toString('base64');
  }

  async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
    return this.makeRequest(`/envelopes/${envelopeId}`);
  }

  async downloadSignedDocument(envelopeId: string, documentId: string = '1'): Promise<Buffer> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/envelopes/${envelopeId}/documents/${documentId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`DocuSign download error: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async sendContractForSignature(contract: Contract, clientEmail: string, clientName: string): Promise<{ envelopeId: string; status: string }> {
    try {
      const envelope = await this.createContractEnvelope(contract, clientEmail, clientName);
      
      return {
        envelopeId: envelope.envelopeId,
        status: envelope.status
      };
    } catch (error) {
      console.error('DocuSign contract creation error:', error);
      throw error;
    }
  }

  async checkContractStatus(envelopeId: string): Promise<{ status: string; isCompleted: boolean }> {
    try {
      const envelope = await this.getEnvelopeStatus(envelopeId);
      
      return {
        status: envelope.status,
        isCompleted: envelope.status === 'completed'
      };
    } catch (error) {
      console.error('DocuSign status check error:', error);
      throw error;
    }
  }
}

export const docusignService = new DocuSignService();