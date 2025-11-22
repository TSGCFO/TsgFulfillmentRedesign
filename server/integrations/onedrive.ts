import { Client } from '@microsoft/microsoft-graph-client';
import { Employee } from '@shared/schema';

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=onedrive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('OneDrive not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableOneDriveClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

// OneDrive Integration Service using Replit Connector
export class OneDriveIntegrationService {
  private employeeFolderName: string = 'TSG_Employee_Portal';

  // Initialize employee folder structure
  async initializeEmployeeFolder() {
    try {
      const client = await getUncachableOneDriveClient();
      
      // Create main employee portal folder
      try {
        await client.api('/me/drive/root/children')
          .post({
            name: this.employeeFolderName,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'fail'
          });
      } catch (error) {
        // Folder might already exist
        console.log('Employee folder already exists or cannot be created');
      }

      // Create subfolders
      const subfolders = [
        'Employee Documents',
        'Training Materials',
        'Policies',
        'Templates',
        'Reports',
        'Personal'
      ];

      for (const subfolder of subfolders) {
        try {
          await client.api(`/me/drive/root:/${this.employeeFolderName}:/children`)
            .post({
              name: subfolder,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'fail'
            });
        } catch (error) {
          console.log(`Subfolder ${subfolder} already exists or cannot be created`);
        }
      }

      return { success: true, message: 'Employee folders initialized' };
    } catch (error) {
      console.error('OneDrive initialize folders error:', error);
      throw error;
    }
  }

  // Upload employee document
  async uploadEmployeeDocument(
    employee: Employee,
    fileContent: Buffer,
    fileName: string,
    category: 'personal' | 'training' | 'policy' | 'template' | 'report' = 'personal'
  ) {
    try {
      const client = await getUncachableOneDriveClient();
      
      // Create employee-specific folder if needed
      const employeeFolderPath = `${this.employeeFolderName}/Personal/${employee.username}`;
      
      try {
        await client.api(`/me/drive/root:/${this.employeeFolderName}/Personal:/children`)
          .post({
            name: employee.username,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'fail'
          });
      } catch (error) {
        // Folder might already exist
      }
      
      // Upload file to appropriate location
      let uploadPath: string;
      if (category === 'personal') {
        uploadPath = `/me/drive/root:/${employeeFolderPath}/${fileName}:/content`;
      } else {
        const categoryFolder = {
          training: 'Training Materials',
          policy: 'Policies',
          template: 'Templates',
          report: 'Reports'
        }[category];
        uploadPath = `/me/drive/root:/${this.employeeFolderName}/${categoryFolder}/${fileName}:/content`;
      }

      const uploadedFile = await client.api(uploadPath)
        .put(fileContent);

      return {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webUrl: uploadedFile.webUrl,
        downloadUrl: uploadedFile['@microsoft.graph.downloadUrl'],
        createdDateTime: uploadedFile.createdDateTime,
        size: uploadedFile.size,
        category
      };
    } catch (error) {
      console.error('OneDrive upload document error:', error);
      throw error;
    }
  }

  // Get employee documents
  async getEmployeeDocuments(employee: Employee, category?: string) {
    try {
      const client = await getUncachableOneDriveClient();
      
      let folderPath: string;
      if (category === 'personal') {
        folderPath = `${this.employeeFolderName}/Personal/${employee.username}`;
      } else if (category) {
        const categoryFolder = {
          training: 'Training Materials',
          policy: 'Policies',
          template: 'Templates',
          report: 'Reports'
        }[category];
        folderPath = `${this.employeeFolderName}/${categoryFolder}`;
      } else {
        folderPath = this.employeeFolderName;
      }
      
      try {
        const items = await client.api(`/me/drive/root:/${folderPath}:/children`)
          .select('id,name,size,webUrl,createdDateTime,lastModifiedDateTime,file,folder')
          .get();

        return items.value.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.folder ? 'folder' : 'file',
          webUrl: item.webUrl,
          size: item.size,
          createdDateTime: item.createdDateTime,
          lastModifiedDateTime: item.lastModifiedDateTime,
          mimeType: item.file?.mimeType
        }));
      } catch (error) {
        console.log(`Folder ${folderPath} not found or error accessing it`);
        return [];
      }
    } catch (error) {
      console.error('OneDrive get documents error:', error);
      return [];
    }
  }

  // Share file with employees
  async shareWithEmployees(fileId: string, employeeEmails: string[], permission: 'read' | 'write' = 'read') {
    try {
      const client = await getUncachableOneDriveClient();
      
      const shareRequest = {
        recipients: employeeEmails.map(email => ({
          email
        })),
        requireSignIn: true,
        sendInvitation: true,
        roles: [permission],
        message: 'You have been granted access to this TSG Fulfillment document'
      };

      const shareResponse = await client.api(`/me/drive/items/${fileId}/invite`)
        .post(shareRequest);

      return shareResponse;
    } catch (error) {
      console.error('OneDrive share error:', error);
      throw error;
    }
  }

  // Create shared folder for team
  async createTeamFolder(teamName: string, memberEmails: string[]) {
    try {
      const client = await getUncachableOneDriveClient();
      
      // Create team folder
      const folderPath = `${this.employeeFolderName}/Teams/${teamName}`;
      
      try {
        // Create Teams folder if it doesn't exist
        await client.api(`/me/drive/root:/${this.employeeFolderName}:/children`)
          .post({
            name: 'Teams',
            folder: {},
            '@microsoft.graph.conflictBehavior': 'fail'
          });
      } catch (error) {
        // Teams folder might already exist
      }
      
      // Create specific team folder
      const teamFolder = await client.api(`/me/drive/root:/${this.employeeFolderName}/Teams:/children`)
        .post({
          name: teamName,
          folder: {}
        });

      // Share with team members
      if (memberEmails.length > 0) {
        await this.shareWithEmployees(teamFolder.id, memberEmails, 'write');
      }

      return {
        id: teamFolder.id,
        name: teamFolder.name,
        webUrl: teamFolder.webUrl,
        sharedWith: memberEmails
      };
    } catch (error) {
      console.error('OneDrive create team folder error:', error);
      throw error;
    }
  }

  // Download file
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const client = await getUncachableOneDriveClient();
      
      const fileContent = await client.api(`/me/drive/items/${fileId}/content`)
        .get();
      
      return Buffer.from(fileContent);
    } catch (error) {
      console.error('OneDrive download error:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(fileId: string) {
    try {
      const client = await getUncachableOneDriveClient();
      
      await client.api(`/me/drive/items/${fileId}`)
        .delete();
      
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('OneDrive delete error:', error);
      throw error;
    }
  }

  // Search files
  async searchFiles(query: string, fileType?: string) {
    try {
      const client = await getUncachableOneDriveClient();
      
      let searchQuery = query;
      if (fileType) {
        searchQuery = `${query} AND filetype:${fileType}`;
      }
      
      const searchResults = await client.api(`/me/drive/search(q='${searchQuery}')`)
        .select('id,name,webUrl,createdDateTime,lastModifiedDateTime,size,file')
        .top(50)
        .get();

      return searchResults.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        webUrl: item.webUrl,
        size: item.size,
        createdDateTime: item.createdDateTime,
        lastModifiedDateTime: item.lastModifiedDateTime,
        mimeType: item.file?.mimeType
      }));
    } catch (error) {
      console.error('OneDrive search error:', error);
      return [];
    }
  }

  // Get file metadata
  async getFileMetadata(fileId: string) {
    try {
      const client = await getUncachableOneDriveClient();
      
      const metadata = await client.api(`/me/drive/items/${fileId}`)
        .select('id,name,size,webUrl,createdDateTime,lastModifiedDateTime,createdBy,lastModifiedBy,file,shared')
        .get();

      return {
        id: metadata.id,
        name: metadata.name,
        size: metadata.size,
        webUrl: metadata.webUrl,
        createdDateTime: metadata.createdDateTime,
        lastModifiedDateTime: metadata.lastModifiedDateTime,
        createdBy: metadata.createdBy?.user?.displayName,
        lastModifiedBy: metadata.lastModifiedBy?.user?.displayName,
        mimeType: metadata.file?.mimeType,
        isShared: !!metadata.shared
      };
    } catch (error) {
      console.error('OneDrive get metadata error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const onedriveIntegration = new OneDriveIntegrationService();