import { db } from "../../db";
import { contracts, quoteInquiries } from "../../../shared/schema/employee-portal";
import { eq, desc, and, or } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Type definitions
export interface ContractCreate {
  quoteInquiryId?: number;
  docusignEnvelopeId: string;
  clientName?: string;
  clientEmail?: string;
  contractType?: string;
  expiresAt?: Date;
  metadata?: any;
}

export interface ContractUpdate {
  status?: string;
  signedAt?: Date;
  supabaseFilePath?: string;
  supabaseFileUrl?: string;
  metadata?: any;
}

export interface ContractFilter {
  status?: string;
  clientEmail?: string;
  contractType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class ContractService {
  // Create a new contract
  static async create(data: ContractCreate) {
    // Verify quote inquiry exists if provided
    if (data.quoteInquiryId) {
      const [inquiry] = await db
        .select()
        .from(quoteInquiries)
        .where(eq(quoteInquiries.id, data.quoteInquiryId));

      if (!inquiry) {
        throw new Error("Quote inquiry not found");
      }
    }

    // Check if envelope ID already exists
    const existing = await db
      .select()
      .from(contracts)
      .where(eq(contracts.docusignEnvelopeId, data.docusignEnvelopeId))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Contract with this DocuSign envelope ID already exists");
    }

    // Create contract
    const [contract] = await db
      .insert(contracts)
      .values({
        ...data,
        status: "pending",
      })
      .returning();

    return contract;
  }

  // Get all contracts with filters
  static async getAll(filters: ContractFilter = {}) {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(contracts.status, filters.status));
    }
    if (filters.clientEmail) {
      conditions.push(eq(contracts.clientEmail, filters.clientEmail));
    }
    if (filters.contractType) {
      conditions.push(eq(contracts.contractType, filters.contractType));
    }

    const query = db
      .select({
        contract: contracts,
        inquiry: quoteInquiries,
      })
      .from(contracts)
      .leftJoin(quoteInquiries, eq(contracts.quoteInquiryId, quoteInquiries.id));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(contracts.createdAt));

    return results.map((row: any) => ({
      ...row.contract,
      quoteInquiry: row.inquiry,
    }));
  }

  // Get contract by ID
  static async getById(id: number) {
    const [result] = await db
      .select({
        contract: contracts,
        inquiry: quoteInquiries,
      })
      .from(contracts)
      .leftJoin(quoteInquiries, eq(contracts.quoteInquiryId, quoteInquiries.id))
      .where(eq(contracts.id, id));

    if (!result) {
      throw new Error("Contract not found");
    }

    return {
      ...result.contract,
      quoteInquiry: result.inquiry,
    };
  }

  // Get contract by DocuSign envelope ID
  static async getByEnvelopeId(envelopeId: string) {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.docusignEnvelopeId, envelopeId));

    if (!contract) {
      throw new Error("Contract not found");
    }

    return contract;
  }

  // Update contract
  static async update(id: number, data: ContractUpdate) {
    const [updated] = await db
      .update(contracts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();

    if (!updated) {
      throw new Error("Contract not found");
    }

    return updated;
  }

  // Process signed contract from DocuSign
  static async processSignedContract(
    envelopeId: string,
    documentBuffer: Buffer,
    fileName: string
  ) {
    // Get contract by envelope ID
    const contract = await this.getByEnvelopeId(envelopeId);

    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    try {
      // Upload to Supabase Storage
      const filePath = `contracts/${contract.id}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, documentBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Update contract record
      const updated = await this.update(contract.id, {
        status: "completed",
        signedAt: new Date(),
        supabaseFilePath: filePath,
        supabaseFileUrl: publicUrl,
      });

      return updated;
    } catch (error) {
      console.error("Error processing signed contract:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to process signed contract: ${errorMessage}`);
    }
  }

  // Update contract status
  static async updateStatus(id: number, status: string) {
    const validStatuses = ["pending", "completed", "declined", "voided"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    return this.update(id, { status });
  }

  // Get contracts by status
  static async getByStatus(status: string) {
    return this.getAll({ status });
  }

  // Get pending contracts
  static async getPending() {
    return this.getByStatus("pending");
  }

  // Get completed contracts
  static async getCompleted() {
    return this.getByStatus("completed");
  }

  // Get contracts expiring soon (within 30 days)
  static async getExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const results = await db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.status, "pending"),
          db.sql`${contracts.expiresAt} IS NOT NULL`,
          db.sql`${contracts.expiresAt} <= ${futureDate}`
        )
      )
      .orderBy(contracts.expiresAt);

    return results;
  }

  // Download contract from Supabase
  static async downloadContract(id: number) {
    const contract = await this.getById(id);

    if (!contract.supabaseFilePath) {
      throw new Error("Contract file not found in storage");
    }

    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data, error } = await supabase.storage
      .from("documents")
      .download(contract.supabaseFilePath);

    if (error) {
      throw new Error(`Failed to download contract: ${error.message}`);
    }

    return {
      data,
      fileName: contract.supabaseFilePath.split("/").pop(),
      contentType: "application/pdf",
    };
  }

  // Void contract
  static async voidContract(id: number, reason?: string) {
    const contract = await this.getById(id);

    if (contract.status === "completed") {
      throw new Error("Cannot void a completed contract");
    }

    const metadata = contract.metadata || {};
    metadata.voidedAt = new Date();
    metadata.voidReason = reason;

    return this.update(id, {
      status: "voided",
      metadata,
    });
  }

  // Get contract statistics
  static async getStatistics() {
    const [stats] = await db
      .select({
        total: db.sql`COUNT(*)`,
        pending: db.sql`COUNT(*) FILTER (WHERE status = 'pending')`,
        completed: db.sql`COUNT(*) FILTER (WHERE status = 'completed')`,
        declined: db.sql`COUNT(*) FILTER (WHERE status = 'declined')`,
        voided: db.sql`COUNT(*) FILTER (WHERE status = 'voided')`,
      })
      .from(contracts);

    return stats;
  }

  // Clean up expired contracts
  static async cleanupExpired() {
    const now = new Date();

    const expired = await db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.status, "pending"),
          db.sql`${contracts.expiresAt} IS NOT NULL`,
          db.sql`${contracts.expiresAt} < ${now}`
        )
      );

    const results = [];
    for (const contract of expired) {
      const updated = await this.update(contract.id, {
        status: "declined",
        metadata: {
          ...contract.metadata,
          autoDeclinedAt: now,
          autoDeclineReason: "Contract expired",
        },
      });
      results.push(updated);
    }

    return results;
  }
}