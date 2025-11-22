import { Client } from '@microsoft/microsoft-graph-client';
import { Contract } from '@shared/schema';

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sharepoint',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('SharePoint not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSharePointClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

// SharePoint Integration Service using Replit Connector
export class SharePointIntegrationService {
  private siteName: string = 'TSGFulfillment';
  private contractsLibraryName: string = 'Contracts';
  private documentsLibraryName: string = 'Documents';

  // Get site information
  async getSiteInfo() {
    try {
      const client = await getUncachableSharePointClient();
      
      // Search for the site
      const sites = await client.api('/sites')
        .filter(`displayName eq '${this.siteName}'`)
        .get();

      if (sites.value && sites.value.length > 0) {
        return sites.value[0];
      }

      // If site doesn't exist, create it (simplified - in production, this would require admin permissions)
      return { 
        id: 'tsgfulfillment.sharepoint.com,site-id,web-id',
        displayName: this.siteName 
      };
    } catch (error) {
      console.error('SharePoint get site error:', error);
      // Return a default site structure for development
      return { 
        id: 'default-site-id',
        displayName: this.siteName 
      };
    }
  }

  // Upload contract to SharePoint
  async uploadContract(
    contract: Contract,
    fileContent: Buffer,
    fileName: string,
    metadata?: Record<string, any>
  ) {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      // Create folder structure: /Contracts/[Year]/[Month]/[ContractID]
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const folderPath = `${this.contractsLibraryName}/${year}/${month}/${contract.id}`;
      
      // Upload the file
      const uploadUrl = `/sites/${site.id}/drive/root:/${folderPath}/${fileName}:/content`;
      
      const uploadedFile = await client.api(uploadUrl)
        .put(fileContent);

      // Add metadata
      if (metadata || contract) {
        const itemId = uploadedFile.id;
        await client.api(`/sites/${site.id}/drive/items/${itemId}`)
          .patch({
            fields: {
              ClientName: contract.clientName,
              ContractTitle: contract.contractTitle,
              ContractStatus: contract.status,
              SigningDeadline: contract.signingDeadline,
              ...metadata
            }
          });
      }

      return {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webUrl: uploadedFile.webUrl,
        downloadUrl: uploadedFile['@microsoft.graph.downloadUrl'],
        createdDateTime: uploadedFile.createdDateTime,
        size: uploadedFile.size
      };
    } catch (error) {
      console.error('SharePoint upload contract error:', error);
      throw error;
    }
  }

  // Get contract document
  async getContractDocument(contractId: number, fileName: string) {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      // Search for the file
      const searchQuery = `${this.contractsLibraryName} AND ${contractId} AND ${fileName}`;
      const searchResults = await client.api(`/sites/${site.id}/drive/search(q='${searchQuery}')`)
        .get();

      if (searchResults.value && searchResults.value.length > 0) {
        const file = searchResults.value[0];
        
        // Get file content
        const fileContent = await client.api(`/sites/${site.id}/drive/items/${file.id}/content`)
          .get();
          
        return {
          metadata: file,
          content: fileContent
        };
      }

      throw new Error('Contract document not found');
    } catch (error) {
      console.error('SharePoint get contract error:', error);
      throw error;
    }
  }

  // List all contracts in a folder
  async listContracts(year?: number, month?: number) {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      let folderPath = this.contractsLibraryName;
      if (year) {
        folderPath += `/${year}`;
        if (month) {
          folderPath += `/${String(month).padStart(2, '0')}`;
        }
      }
      
      const items = await client.api(`/sites/${site.id}/drive/root:/${folderPath}:/children`)
        .get();

      return items.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.folder ? 'folder' : 'file',
        webUrl: item.webUrl,
        size: item.size,
        createdDateTime: item.createdDateTime,
        lastModifiedDateTime: item.lastModifiedDateTime,
        createdBy: item.createdBy?.user?.displayName
      }));
    } catch (error) {
      console.error('SharePoint list contracts error:', error);
      return [];
    }
  }

  // Create document library structure
  async initializeDocumentLibraries() {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      // Create main folders
      const libraries = [
        this.contractsLibraryName,
        this.documentsLibraryName,
        'Materials',
        'Quotes',
        'Employee Documents'
      ];

      for (const library of libraries) {
        try {
          await client.api(`/sites/${site.id}/drive/root/children`)
            .post({
              name: library,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'fail'
            });
        } catch (error) {
          // Folder might already exist, which is fine
          console.log(`Folder ${library} already exists or cannot be created`);
        }
      }

      return { success: true, message: 'Document libraries initialized' };
    } catch (error) {
      console.error('SharePoint initialize libraries error:', error);
      throw error;
    }
  }

  // Get document versions
  async getDocumentVersions(fileId: string) {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      const versions = await client.api(`/sites/${site.id}/drive/items/${fileId}/versions`)
        .get();

      return versions.value.map((version: any) => ({
        id: version.id,
        size: version.size,
        lastModifiedDateTime: version.lastModifiedDateTime,
        lastModifiedBy: version.lastModifiedBy?.user?.displayName
      }));
    } catch (error) {
      console.error('SharePoint get versions error:', error);
      return [];
    }
  }

  // Share document with specific users
  async shareDocument(fileId: string, emails: string[], permission: 'read' | 'write' = 'read') {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      const shareRequest = {
        recipients: emails.map(email => ({
          email
        })),
        requireSignIn: true,
        sendInvitation: true,
        roles: [permission],
        message: 'You have been granted access to this document'
      };

      const shareResponse = await client.api(`/sites/${site.id}/drive/items/${fileId}/invite`)
        .post(shareRequest);

      return shareResponse;
    } catch (error) {
      console.error('SharePoint share document error:', error);
      throw error;
    }
  }

  // Search documents
  async searchDocuments(query: string, documentType?: string) {
    try {
      const client = await getUncachableSharePointClient();
      const site = await this.getSiteInfo();
      
      let searchQuery = query;
      if (documentType) {
        searchQuery = `${documentType} AND ${query}`;
      }
      
      const searchResults = await client.api(`/sites/${site.id}/drive/search(q='${searchQuery}')`)
        .select('id,name,webUrl,createdDateTime,lastModifiedDateTime,size,createdBy')
        .top(50)
        .get();

      return searchResults.value;
    } catch (error) {
      console.error('SharePoint search error:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const sharepointIntegration = new SharePointIntegrationService();