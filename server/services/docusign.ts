import jwt from 'jsonwebtoken';
import { createPrivateKey } from 'crypto';

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
    
    // Construct the proper PEM private key format
    this.privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAhaizOXBpHZukfQM4Ll1jqIwC9uQbQgYPy3A6JN+qZBIWlAHW
ekpg08yDdIgHjB3gGOKxaYFNUXqrNX/P7OPwamBGPgD7nIXoJMX6FmijXr4EZcqQ
lmXikDW3fhpaVRtyqdnvKmbIN+2sEqzv7FfD1aWnCTrGM5b6EziQ3nxmaIk7X0e0
xdHP/ZvhP3SIvUb+FwTVJrlwEqLc3qcwXUfIwdL4iSx3MIlQDJSUVyCHb1gq6pvV
2SB/rKQ0W4uQ5XalthDo3Y2+mFSrdGgnYDL/6BybIlTOqJwBh+ezVBzxns4I1Xgx
JfsgHtEY2eNdcvnB4x6fsxtjl721TXo9ednesQIDAQABAoIBABHF0XMpVejoedJf
u7g6ldZjK7+9rDw2xyHjne+qSCN/Xj43Elh3jHGNZ8t2jR5eGJ7mgfXICkpz19FI
2hKjaqQSgjSbd9mj2q8NHkidiF/AP6Bzc490I9DOO8SKZ4mamUApqQpH2YbKVU+0
bEDOmM1PdisdhB53DHDC3EyhWRK8P3LiVPSotbKankLVxrtRpU+YTVHxAAv2W5a8
uyegrKpglnteObvJAuFoiJK7eHpTEUDZi1vnHyW8SzJu3Rvc7SzJTRcWfpqKqp0U
jAAYWyLWNYoX8QaDz3ib8vwzokAPVTROXmnNI9Ybn0OIZwadxhDJJODx7/BLZooM
7Wht99kCgYEAx0BoNsEbWmP5bcvkwIAXVb2IETJD/mQuGoDjALAkeC6gxG1sjP3X
PoYyO6lR2iVR79XGVs+vVZHK2aOW2OZns2uDNIJdNWYjJa7db8yN5d+kB5znYl15
Fbwv9kMdKeGuHxE2CBs8K9ynUoCTgxflfQPnANoLZuJud4fKFSlxB0UCgYEAq7ni
NtrCK4h/t6okStBhPbTYLCGDPJH2v3wPAssfGvYv18enYfNHkwwqnrvRjLO/l9bt
5t560CikmLIqwViU6oPSyV0RM1A1RzUfhUA8LWaveDT+4FxTjdLBdZbg1WwleOJO
6vq/uoMSRwrBNufErudvvThsZM+mb2Po9TQYKn0CgYBBhXV/o+rJw5xvNaBIiRaj
VEsdVIk1a14Zyw5a2JF1j+fAEDek+YhBgEGeiuRmtuUF2Cd7vpnqqqGpBfmB4+pv
/sfLiZ77A1ZFewZIUFzNHcjD1B3mo9RAiHzBH3rEnfjzMGazLbmQtuOy5qMbdc06
WgEpr4oWUBmBZv7WDKWlfQKBgQCpkdHIrNcTOaQz7jQMFBwRXKQhX65BfziR+KSx
83TxoKu5fRLRa/L/RwJG39uZ/lxwSPF+Ca5oIdn2VehWJ2xU7nqUD+xOKSOS/ufz
ImzJwB4AqwQK8+AlqTkTLjsxQ6r05TNcYOI1//tqXzpPRyk2NJ5n0HFoUotcbuG4
TwqV2QKBgQCAV6AAB80WFrpp/16F/NxXmlhUGCNremvfX93s7XyY0JY2fXjCemHJ
HuYJUFxLvm+tP1QZgThuaGc7emGT/WOEFsYZOERkCd6oBpoog30IIloboHpsTQO/
gqBN/se1wy4MC/7DoVlrUSmwU7G2ZXJifkalUoJ7ggN79EkyuYJu8g==
-----END RSA PRIVATE KEY-----`;

    // Validate the private key format
    try {
      createPrivateKey(this.privateKey);
      console.log('Private key validation successful');
    } catch (error) {
      console.error('Private key validation failed:', error);
      throw new Error('Invalid private key format');
    }
    
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
      const errorText = await response.text();
      console.log('DocuSign auth error response:', errorText);
      throw new Error(`DocuSign auth error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  private createJWT(): string {
    const payload = {
      iss: this.integrationKey,
      sub: this.userId,
      aud: 'account-d.docusign.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'signature impersonation'
    };

    return jwt.sign(payload, this.privateKey, { 
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        typ: 'JWT'
      }
    });
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

  async testConnection(): Promise<{ authenticated: boolean; accountId: string; message: string }> {
    try {
      const token = await this.getAccessToken();
      return {
        authenticated: true,
        accountId: this.accountId,
        message: 'DocuSign connection successful'
      };
    } catch (error) {
      console.error('DocuSign connection test failed:', error);
      throw new Error(`DocuSign connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const docusignService = new DocuSignService();