import { db } from "../../db";
import { quoteInquiries, salesTeamMembers, hubspotSyncLog } from "../../../shared/schema/employee-portal";
import { quoteRequests } from "../../../shared/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { z } from "zod";

// Type definitions
export interface QuoteInquiryFilter {
  status?: string;
  assignedTo?: number;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface QuoteInquiryUpdate {
  assignedTo?: number;
  status?: string;
  priority?: string;
  notes?: string;
  hubspotDealId?: string;
  hubspotContactId?: string;
}

export class QuoteInquiryService {
  // Get all quote inquiries with filters
  static async getAll(filters: QuoteInquiryFilter = {}) {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(quoteInquiries.status, filters.status));
    }
    if (filters.assignedTo) {
      conditions.push(eq(quoteInquiries.assignedTo, filters.assignedTo));
    }
    if (filters.priority) {
      conditions.push(eq(quoteInquiries.priority, filters.priority));
    }
    if (filters.dateFrom || filters.dateTo) {
      // Add date filtering logic if needed
    }

    const query = db
      .select({
        inquiry: quoteInquiries,
        quoteRequest: quoteRequests,
        salesPerson: salesTeamMembers,
      })
      .from(quoteInquiries)
      .leftJoin(quoteRequests, eq(quoteInquiries.quoteRequestId, quoteRequests.id))
      .leftJoin(salesTeamMembers, eq(quoteInquiries.assignedTo, salesTeamMembers.id));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(quoteInquiries.createdAt));

    return results.map((row: any) => ({
      ...row.inquiry,
      quoteRequest: row.quoteRequest,
      salesPerson: row.salesPerson,
    }));
  }

  // Get single quote inquiry by ID
  static async getById(id: number) {
    const [result] = await db
      .select({
        inquiry: quoteInquiries,
        quoteRequest: quoteRequests,
        salesPerson: salesTeamMembers,
      })
      .from(quoteInquiries)
      .leftJoin(quoteRequests, eq(quoteInquiries.quoteRequestId, quoteRequests.id))
      .leftJoin(salesTeamMembers, eq(quoteInquiries.assignedTo, salesTeamMembers.id))
      .where(eq(quoteInquiries.id, id));

    if (!result) {
      throw new Error("Quote inquiry not found");
    }

    return {
      ...result.inquiry,
      quoteRequest: result.quoteRequest,
      salesPerson: result.salesPerson,
    };
  }

  // Create quote inquiry from quote request
  static async createFromQuoteRequest(quoteRequestId: number, assignedTo?: number) {
    // Verify quote request exists
    const [quoteRequest] = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, quoteRequestId));

    if (!quoteRequest) {
      throw new Error("Quote request not found");
    }

    // Create the inquiry
    const [inquiry] = await db
      .insert(quoteInquiries)
      .values({
        quoteRequestId,
        assignedTo,
        status: "new",
        priority: "medium",
        syncStatus: "pending",
      })
      .returning();

    // Log the creation
    await this.logHubSpotSync(inquiry.id, "create", "pending", undefined, { action: "created_from_quote_request" });

    return inquiry;
  }

  // Update quote inquiry
  static async update(id: number, updates: QuoteInquiryUpdate) {
    const [updated] = await db
      .update(quoteInquiries)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(quoteInquiries.id, id))
      .returning();

    if (!updated) {
      throw new Error("Quote inquiry not found");
    }

    // Log the update
    await this.logHubSpotSync(id, "update", "pending", undefined, { updates });

    return updated;
  }

  // Assign to sales team member
  static async assignToSalesPerson(inquiryId: number, salesPersonId: number) {
    // Verify sales person exists
    const [salesPerson] = await db
      .select()
      .from(salesTeamMembers)
      .where(eq(salesTeamMembers.id, salesPersonId));

    if (!salesPerson) {
      throw new Error("Sales team member not found");
    }

    return this.update(inquiryId, { assignedTo: salesPersonId });
  }

  // Update status
  static async updateStatus(id: number, status: string) {
    const validStatuses = ["new", "contacted", "quoted", "negotiating", "won", "lost"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    return this.update(id, { status });
  }

  // Sync with HubSpot
  static async syncWithHubSpot(id: number) {
    const inquiry = await this.getById(id);

    try {
      // TODO: Implement actual HubSpot API calls
      // For now, this is a placeholder
      const mockHubSpotResponse = {
        dealId: `DEAL-${Date.now()}`,
        contactId: `CONTACT-${Date.now()}`,
      };

      // Update inquiry with HubSpot IDs
      await this.update(id, {
        hubspotDealId: mockHubSpotResponse.dealId,
        hubspotContactId: mockHubSpotResponse.contactId,
      });

      // Update sync status
      await db
        .update(quoteInquiries)
        .set({
          lastSyncedAt: new Date(),
          syncStatus: "success",
        })
        .where(eq(quoteInquiries.id, id));

      // Log success
      await this.logHubSpotSync(id, "sync", "success", undefined, mockHubSpotResponse);

      return { success: true, hubspotData: mockHubSpotResponse };
    } catch (error) {
      // Log failure
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.logHubSpotSync(id, "sync", "failed", errorMessage, null);

      // Update sync status
      await db
        .update(quoteInquiries)
        .set({
          syncStatus: "failed",
        })
        .where(eq(quoteInquiries.id, id));

      throw error;
    }
  }

  // Get inquiries by status
  static async getByStatus(status: string) {
    return this.getAll({ status });
  }

  // Get inquiries assigned to a specific sales person
  static async getBySalesPerson(salesPersonId: number) {
    return this.getAll({ assignedTo: salesPersonId });
  }

  // Get unassigned inquiries
  static async getUnassigned() {
    const results = await db
      .select({
        inquiry: quoteInquiries,
        quoteRequest: quoteRequests,
      })
      .from(quoteInquiries)
      .leftJoin(quoteRequests, eq(quoteInquiries.quoteRequestId, quoteRequests.id))
      .where(isNull(quoteInquiries.assignedTo))
      .orderBy(desc(quoteInquiries.createdAt));

    return results.map((row: any) => ({
      ...row.inquiry,
      quoteRequest: row.quoteRequest,
    }));
  }

  // Log HubSpot sync activity
  private static async logHubSpotSync(
    entityId: number,
    action: string,
    status: string,
    errorMessage?: string,
    responseData?: any
  ) {
    await db.insert(hubspotSyncLog).values({
      entityType: "quote_inquiry",
      entityId,
      action,
      status,
      errorMessage,
      requestData: null,
      responseData: responseData ? responseData : null,
    });
  }

  // Get sync history for an inquiry
  static async getSyncHistory(inquiryId: number) {
    return db
      .select()
      .from(hubspotSyncLog)
      .where(
        and(
          eq(hubspotSyncLog.entityType, "quote_inquiry"),
          eq(hubspotSyncLog.entityId, inquiryId)
        )
      )
      .orderBy(desc(hubspotSyncLog.createdAt));
  }
}