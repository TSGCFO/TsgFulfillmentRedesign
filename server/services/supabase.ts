import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseStorageService {
  private bucketName = "contracts";

  async ensureBucketExists(): Promise<void> {
    try {
      const { data: bucket } = await supabase.storage.getBucket(this.bucketName);
      
      if (!bucket) {
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: false,
          allowedMimeTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          throw new Error(`Failed to create bucket: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      throw error;
    }
  }

  async uploadContract(
    contractId: string,
    fileName: string,
    fileBuffer: Buffer,
    contentType: string = "application/pdf"
  ): Promise<string> {
    try {
      await this.ensureBucketExists();

      const filePath = `contracts/${contractId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to upload contract: ${error.message}`);
      }

      return data.path;
    } catch (error) {
      console.error("Error uploading contract:", error);
      throw error;
    }
  }

  async getContractUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to get contract URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Error getting contract URL:", error);
      throw error;
    }
  }

  async deleteContract(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Failed to delete contract: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      throw error;
    }
  }

  async listContractsByClientId(contractId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(`contracts/${contractId}`);

      if (error) {
        throw new Error(`Failed to list contracts: ${error.message}`);
      }

      return data?.map(file => `contracts/${contractId}/${file.name}`) || [];
    } catch (error) {
      console.error("Error listing contracts:", error);
      throw error;
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();