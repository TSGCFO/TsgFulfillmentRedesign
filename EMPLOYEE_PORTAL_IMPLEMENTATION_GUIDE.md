# Employee Portal Implementation Guide
## TSG Fulfillment Employee Portal - Complete Implementation Documentation

### Project Overview
This document provides detailed, step-by-step instructions for implementing an Employee Portal accessible at `https://www.tsgfulfillment.com/employee`. The portal will integrate with HubSpot, DocuSign, and Supabase to manage quotes, contracts, and materials tracking.

---

## PHASE 1: DATABASE SCHEMA DESIGN

### Step 1.1: Update Database Schema
**File to modify**: `shared/schema.ts`

**Action**: Add the following table definitions at the end of the file, before the export statements:

```typescript
// Employee Portal Tables
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'admin', 'sales', 'manager'
  isActive: boolean("is_active").default(true).notNull(),
  hubspotUserId: text("hubspot_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login")
});

export const inquiryAssignments = pgTable("inquiry_assignments", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  status: text("status").default("assigned").notNull(), // 'assigned', 'in_progress', 'completed', 'closed'
  priority: text("priority").default("medium").notNull(), // 'low', 'medium', 'high', 'urgent'
  notes: text("notes"),
  hubspotDealId: text("hubspot_deal_id"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  docusignEnvelopeId: text("docusign_envelope_id").notNull().unique(),
  contractTitle: text("contract_title").notNull(),
  clientName: text("client_name").notNull(),
  contractValue: real("contract_value"),
  signedDate: timestamp("signed_date"),
  status: text("status").default("sent").notNull(), // 'sent', 'signed', 'completed', 'voided'
  supabaseStoragePath: text("supabase_storage_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastStatusCheck: timestamp("last_status_check").defaultNow().notNull()
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  quoteNumber: text("quote_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").default("draft").notNull(), // 'draft', 'sent', 'accepted', 'rejected', 'expired'
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  hubspotQuoteId: text("hubspot_quote_id"),
  notes: text("notes")
});

export const quoteLineItems = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  category: text("category"), // 'fulfillment', 'storage', 'shipping', 'other'
  sortOrder: integer("sort_order").default(0)
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category").notNull(), // 'packaging', 'shipping', 'materials', 'equipment'
  isActive: boolean("is_active").default(true).notNull(),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'packaging', 'labels', 'tape', 'boxes', 'bubble_wrap'
  sku: text("sku").unique(),
  description: text("description"),
  unit: text("unit").notNull(), // 'pieces', 'rolls', 'sheets', 'boxes'
  currentStock: integer("current_stock").default(0).notNull(),
  minStock: integer("min_stock").default(0).notNull(),
  maxStock: integer("max_stock"),
  reorderPoint: integer("reorder_point"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const materialPrices = pgTable("material_prices", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  price: real("price").notNull(),
  currency: text("currency").default("CAD").notNull(),
  minQuantity: integer("min_quantity").default(1),
  isCurrentPrice: boolean("is_current_price").default(true).notNull(),
  effectiveDate: timestamp("effective_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date")
});

export const materialOrders = pgTable("material_orders", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  orderNumber: text("order_number").notNull().unique(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  totalAmount: real("total_amount").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'ordered', 'shipped', 'delivered', 'cancelled'
  notes: text("notes")
});

export const materialOrderItems = pgTable("material_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => materialOrders.id).notNull(),
  materialId: integer("material_id").references(() => materials.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull()
});

export const materialUsage = pgTable("material_usage", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  quantityUsed: integer("quantity_used").notNull(),
  usageDate: timestamp("usage_date").defaultNow().notNull(),
  purpose: text("purpose"), // 'fulfillment', 'kitting', 'packaging'
  clientReference: text("client_reference"),
  notes: text("notes")
});
```

**Action**: Add the following insert schemas after the existing ones:

```typescript
// Employee Portal Insert Schemas
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  lastLogin: true
});

export const insertInquiryAssignmentSchema = createInsertSchema(inquiryAssignments).omit({
  id: true,
  assignedAt: true,
  lastUpdated: true
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  lastStatusCheck: true
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({
  id: true
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true
});

export const insertMaterialPriceSchema = createInsertSchema(materialPrices).omit({
  id: true,
  effectiveDate: true
});

export const insertMaterialOrderSchema = createInsertSchema(materialOrders).omit({
  id: true,
  orderDate: true
});

export const insertMaterialOrderItemSchema = createInsertSchema(materialOrderItems).omit({
  id: true
});

export const insertMaterialUsageSchema = createInsertSchema(materialUsage).omit({
  id: true,
  usageDate: true
});
```

**Action**: Add the following type exports after the existing ones:

```typescript
// Employee Portal Types
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertInquiryAssignment = z.infer<typeof insertInquiryAssignmentSchema>;
export type InquiryAssignment = typeof inquiryAssignments.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type InsertMaterialPrice = z.infer<typeof insertMaterialPriceSchema>;
export type MaterialPrice = typeof materialPrices.$inferSelect;

export type InsertMaterialOrder = z.infer<typeof insertMaterialOrderSchema>;
export type MaterialOrder = typeof materialOrders.$inferSelect;

export type InsertMaterialOrderItem = z.infer<typeof insertMaterialOrderItemSchema>;
export type MaterialOrderItem = typeof materialOrderItems.$inferSelect;

export type InsertMaterialUsage = z.infer<typeof insertMaterialUsageSchema>;
export type MaterialUsage = typeof materialUsage.$inferSelect;
```

### Step 1.2: Push Database Changes
**Command to run**: `npm run db:push`

**Important**: After schema changes, you MUST run this command to update the database structure. If you get data-loss warnings, manually drop conflicting data using the SQL tool before proceeding.

---

## PHASE 2: EXTERNAL API INTEGRATIONS SETUP

### Step 2.1: Install Required Dependencies
**Command to run**: Use the packager tool to install these dependencies:
- `@hubspot/api-client`
- `docusign-esign`
- `@supabase/supabase-js` (already installed, verify it's latest version)

### Step 2.2: Environment Variables Setup
**File to modify**: `.env` (create if doesn't exist)

**Action**: Add these environment variables (user will need to provide actual values):

```env
# HubSpot Integration
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here
HUBSPOT_CLIENT_ID=your_hubspot_client_id_here
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret_here

# DocuSign Integration
DOCUSIGN_INTEGRATION_KEY=your_docusign_integration_key_here
DOCUSIGN_USER_ID=your_docusign_user_id_here
DOCUSIGN_ACCOUNT_ID=your_docusign_account_id_here
DOCUSIGN_PRIVATE_KEY=your_docusign_private_key_here
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi # Use https://www.docusign.net/restapi for production

# Supabase Storage (for contracts)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Step 2.3: Create External API Service Files

**File to create**: `server/services/hubspot.ts`

```typescript
import { Client } from "@hubspot/api-client";

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string;
    dealstage: string;
    closedate: string;
    hubspot_owner_id: string;
  };
}

export interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    company: string;
    phone: string;
  };
}

export class HubSpotService {
  async createContact(contactData: {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
  }): Promise<HubSpotContact> {
    try {
      const response = await hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email: contactData.email,
          firstname: contactData.firstName,
          lastname: contactData.lastName,
          company: contactData.company,
          phone: contactData.phone,
        },
      });
      return response as HubSpotContact;
    } catch (error) {
      console.error("Error creating HubSpot contact:", error);
      throw new Error("Failed to create HubSpot contact");
    }
  }

  async createDeal(dealData: {
    dealName: string;
    amount: number;
    contactId: string;
    stage: string;
    ownerId: string;
  }): Promise<HubSpotDeal> {
    try {
      const response = await hubspotClient.crm.deals.basicApi.create({
        properties: {
          dealname: dealData.dealName,
          amount: dealData.amount.toString(),
          dealstage: dealData.stage,
          hubspot_owner_id: dealData.ownerId,
        },
        associations: [
          {
            to: { id: dealData.contactId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
          },
        ],
      });
      return response as HubSpotDeal;
    } catch (error) {
      console.error("Error creating HubSpot deal:", error);
      throw new Error("Failed to create HubSpot deal");
    }
  }

  async updateDeal(dealId: string, updateData: Partial<HubSpotDeal['properties']>): Promise<HubSpotDeal> {
    try {
      const response = await hubspotClient.crm.deals.basicApi.update(dealId, {
        properties: updateData,
      });
      return response as HubSpotDeal;
    } catch (error) {
      console.error("Error updating HubSpot deal:", error);
      throw new Error("Failed to update HubSpot deal");
    }
  }

  async getDeal(dealId: string): Promise<HubSpotDeal> {
    try {
      const response = await hubspotClient.crm.deals.basicApi.getById(dealId);
      return response as HubSpotDeal;
    } catch (error) {
      console.error("Error fetching HubSpot deal:", error);
      throw new Error("Failed to fetch HubSpot deal");
    }
  }

  async syncQuoteRequestToHubSpot(quoteRequest: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    service: string;
    message: string;
  }): Promise<{ contactId: string; dealId: string }> {
    try {
      // Create or find contact
      const contact = await this.createContact({
        email: quoteRequest.email,
        firstName: quoteRequest.name.split(' ')[0],
        lastName: quoteRequest.name.split(' ').slice(1).join(' ') || 'Unknown',
        company: quoteRequest.company,
        phone: quoteRequest.phone,
      });

      // Create deal
      const deal = await this.createDeal({
        dealName: `${quoteRequest.company} - ${quoteRequest.service}`,
        amount: 0, // Will be updated when quote is created
        contactId: contact.id,
        stage: "appointmentscheduled", // Default HubSpot stage
        ownerId: process.env.HUBSPOT_DEFAULT_OWNER_ID || "",
      });

      return {
        contactId: contact.id,
        dealId: deal.id,
      };
    } catch (error) {
      console.error("Error syncing to HubSpot:", error);
      throw error;
    }
  }
}

export const hubSpotService = new HubSpotService();
```

**File to create**: `server/services/docusign.ts`

```typescript
import * as docusign from "docusign-esign";
import * as fs from "fs";
import * as path from "path";

export interface DocuSignEnvelope {
  envelopeId: string;
  status: string;
  documentsUri: string;
  recipientsUri: string;
  certificateUri: string;
}

export interface ContractTemplate {
  name: string;
  templateId: string;
  description: string;
}

export class DocuSignService {
  private apiClient: docusign.ApiClient;
  private accountId: string;

  constructor() {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH!);
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID!;
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const jwtAuth = await this.apiClient.requestJWTUserToken(
        process.env.DOCUSIGN_INTEGRATION_KEY!,
        process.env.DOCUSIGN_USER_ID!,
        "signature impersonation",
        Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, 'base64'),
        3600
      );

      this.apiClient.addDefaultHeader("Authorization", "Bearer " + jwtAuth.body.access_token);
    } catch (error) {
      console.error("DocuSign authentication error:", error);
      throw new Error("Failed to authenticate with DocuSign");
    }
  }

  async createEnvelopeFromTemplate(
    templateId: string,
    signerEmail: string,
    signerName: string,
    contractData: {
      clientName: string;
      contractValue: number;
      serviceDescription: string;
      effectiveDate: string;
    }
  ): Promise<DocuSignEnvelope> {
    try {
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.templateId = templateId;
      envelopeDefinition.templateRoles = [
        {
          email: signerEmail,
          name: signerName,
          roleName: "Client",
          tabs: {
            textTabs: [
              {
                tabLabel: "client_name",
                value: contractData.clientName,
              },
              {
                tabLabel: "contract_value",
                value: `$${contractData.contractValue.toLocaleString()}`,
              },
              {
                tabLabel: "service_description",
                value: contractData.serviceDescription,
              },
              {
                tabLabel: "effective_date",
                value: contractData.effectiveDate,
              },
            ],
          },
        },
      ];
      envelopeDefinition.status = "sent";

      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const result = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition,
      });

      return {
        envelopeId: result.envelopeId!,
        status: result.status!,
        documentsUri: result.documentsUri!,
        recipientsUri: result.recipientsUri!,
        certificateUri: result.certificateUri!,
      };
    } catch (error) {
      console.error("Error creating DocuSign envelope:", error);
      throw new Error("Failed to create DocuSign envelope");
    }
  }

  async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
    try {
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const result = await envelopesApi.getEnvelope(this.accountId, envelopeId);

      return {
        envelopeId: result.envelopeId!,
        status: result.status!,
        documentsUri: result.documentsUri!,
        recipientsUri: result.recipientsUri!,
        certificateUri: result.certificateUri!,
      };
    } catch (error) {
      console.error("Error getting envelope status:", error);
      throw new Error("Failed to get envelope status");
    }
  }

  async downloadCompletedDocument(envelopeId: string): Promise<Buffer> {
    try {
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const result = await envelopesApi.getDocument(this.accountId, "combined", envelopeId);
      
      return Buffer.from(result, 'binary');
    } catch (error) {
      console.error("Error downloading document:", error);
      throw new Error("Failed to download document");
    }
  }

  async listTemplates(): Promise<ContractTemplate[]> {
    try {
      const templatesApi = new docusign.TemplatesApi(this.apiClient);
      const result = await templatesApi.listTemplates(this.accountId);

      return result.envelopeTemplates?.map(template => ({
        name: template.name!,
        templateId: template.templateId!,
        description: template.description || "",
      })) || [];
    } catch (error) {
      console.error("Error listing templates:", error);
      throw new Error("Failed to list templates");
    }
  }
}

export const docuSignService = new DocuSignService();
```

**File to create**: `server/services/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export class SupabaseStorageService {
  private bucketName = "contracts";

  async ensureBucketExists(): Promise<void> {
    try {
      const { data: bucket } = await supabaseAdmin.storage.getBucket(this.bucketName);
      
      if (!bucket) {
        const { error } = await supabaseAdmin.storage.createBucket(this.bucketName, {
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
      
      const { data, error } = await supabaseAdmin.storage
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
      const { data, error } = await supabaseAdmin.storage
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
      const { error } = await supabaseAdmin.storage
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
      const { data, error } = await supabaseAdmin.storage
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
```

---

## PHASE 3: BACKEND API DEVELOPMENT

### Step 3.1: Update Storage Interface
**File to modify**: `server/storage.ts`

**Action**: Add these imports at the top:

```typescript
import { 
  employees,
  inquiryAssignments,
  contracts,
  quotes,
  quoteLineItems,
  vendors,
  materials,
  materialPrices,
  materialOrders,
  materialOrderItems,
  materialUsage,
  type Employee,
  type InsertEmployee,
  type InquiryAssignment,
  type InsertInquiryAssignment,
  type Contract,
  type InsertContract,
  type Quote,
  type InsertQuote,
  type QuoteLineItem,
  type InsertQuoteLineItem,
  type Vendor,
  type InsertVendor,
  type Material,
  type InsertMaterial,
  type MaterialPrice,
  type InsertMaterialPrice,
  type MaterialOrder,
  type InsertMaterialOrder,
  type MaterialOrderItem,
  type InsertMaterialOrderItem,
  type MaterialUsage,
  type InsertMaterialUsage
} from "@shared/schema";
```

**Action**: Add these methods to the `IStorage` interface:

```typescript
  // Employee Management
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | null>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | null>;
  deleteEmployee(id: number): Promise<boolean>;
  getEmployeeByEmail(email: string): Promise<Employee | null>;

  // Inquiry Assignments
  createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment>;
  getInquiryAssignments(filters?: { employeeId?: number; status?: string }): Promise<InquiryAssignment[]>;
  getInquiryAssignment(id: number): Promise<InquiryAssignment | null>;
  updateInquiryAssignment(id: number, assignment: Partial<InsertInquiryAssignment>): Promise<InquiryAssignment | null>;
  getUnassignedQuoteRequests(): Promise<QuoteRequest[]>;

  // Contract Management
  createContract(contract: InsertContract): Promise<Contract>;
  getContracts(filters?: { employeeId?: number; status?: string }): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | null>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | null>;
  getContractByDocuSignId(envelopeId: string): Promise<Contract | null>;

  // Quote Management
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotes(filters?: { employeeId?: number; status?: string; clientName?: string }): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | null>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | null>;
  deleteQuote(id: number): Promise<boolean>;

  // Quote Line Items
  createQuoteLineItem(lineItem: InsertQuoteLineItem): Promise<QuoteLineItem>;
  getQuoteLineItems(quoteId: number): Promise<QuoteLineItem[]>;
  updateQuoteLineItem(id: number, lineItem: Partial<InsertQuoteLineItem>): Promise<QuoteLineItem | null>;
  deleteQuoteLineItem(id: number): Promise<boolean>;

  // Vendor Management
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendors(filters?: { category?: string; isActive?: boolean }): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | null>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | null>;

  // Material Management
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterials(filters?: { category?: string; isActive?: boolean }): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | null>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | null>;
  getLowStockMaterials(): Promise<Material[]>;

  // Material Pricing
  createMaterialPrice(price: InsertMaterialPrice): Promise<MaterialPrice>;
  getMaterialPrices(materialId: number): Promise<MaterialPrice[]>;
  getCurrentMaterialPrice(materialId: number, vendorId: number): Promise<MaterialPrice | null>;
  updateMaterialPrice(id: number, price: Partial<InsertMaterialPrice>): Promise<MaterialPrice | null>;

  // Material Orders
  createMaterialOrder(order: InsertMaterialOrder): Promise<MaterialOrder>;
  getMaterialOrders(filters?: { vendorId?: number; status?: string }): Promise<MaterialOrder[]>;
  getMaterialOrder(id: number): Promise<MaterialOrder | null>;
  updateMaterialOrder(id: number, order: Partial<InsertMaterialOrder>): Promise<MaterialOrder | null>;

  // Material Order Items
  createMaterialOrderItem(item: InsertMaterialOrderItem): Promise<MaterialOrderItem>;
  getMaterialOrderItems(orderId: number): Promise<MaterialOrderItem[]>;
  updateMaterialOrderItem(id: number, item: Partial<InsertMaterialOrderItem>): Promise<MaterialOrderItem | null>;

  // Material Usage
  createMaterialUsage(usage: InsertMaterialUsage): Promise<MaterialUsage>;
  getMaterialUsage(filters?: { materialId?: number; employeeId?: number; startDate?: Date; endDate?: Date }): Promise<MaterialUsage[]>;
  getMaterialUsageStats(materialId: number, startDate: Date, endDate: Date): Promise<{ totalUsed: number; averageDaily: number }>;
```

**Action**: Add these implementations to the `DatabaseStorage` class:

```typescript
  // Employee Management
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [result] = await this.db.insert(employees).values(employee).returning();
    return result;
  }

  async getEmployees(): Promise<Employee[]> {
    return await this.db.select().from(employees).where(eq(employees.isActive, true));
  }

  async getEmployee(id: number): Promise<Employee | null> {
    const [employee] = await this.db.select().from(employees).where(eq(employees.id, id));
    return employee || null;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | null> {
    const [result] = await this.db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return result || null;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await this.db.update(employees).set({ isActive: false }).where(eq(employees.id, id));
    return result.rowCount > 0;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const [employee] = await this.db.select().from(employees).where(eq(employees.email, email));
    return employee || null;
  }

  // Inquiry Assignments
  async createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment> {
    const [result] = await this.db.insert(inquiryAssignments).values(assignment).returning();
    return result;
  }

  async getInquiryAssignments(filters?: { employeeId?: number; status?: string }): Promise<InquiryAssignment[]> {
    let query = this.db.select().from(inquiryAssignments);
    
    if (filters?.employeeId) {
      query = query.where(eq(inquiryAssignments.employeeId, filters.employeeId));
    }
    if (filters?.status) {
      query = query.where(eq(inquiryAssignments.status, filters.status));
    }
    
    return await query;
  }

  async getInquiryAssignment(id: number): Promise<InquiryAssignment | null> {
    const [assignment] = await this.db.select().from(inquiryAssignments).where(eq(inquiryAssignments.id, id));
    return assignment || null;
  }

  async updateInquiryAssignment(id: number, assignment: Partial<InsertInquiryAssignment>): Promise<InquiryAssignment | null> {
    const [result] = await this.db.update(inquiryAssignments)
      .set({ ...assignment, lastUpdated: new Date() })
      .where(eq(inquiryAssignments.id, id))
      .returning();
    return result || null;
  }

  async getUnassignedQuoteRequests(): Promise<QuoteRequest[]> {
    return await this.db.select()
      .from(quoteRequests)
      .leftJoin(inquiryAssignments, eq(quoteRequests.id, inquiryAssignments.quoteRequestId))
      .where(isNull(inquiryAssignments.id));
  }

  // Contract Management
  async createContract(contract: InsertContract): Promise<Contract> {
    const [result] = await this.db.insert(contracts).values(contract).returning();
    return result;
  }

  async getContracts(filters?: { employeeId?: number; status?: string }): Promise<Contract[]> {
    let query = this.db.select().from(contracts);
    
    if (filters?.employeeId) {
      query = query.where(eq(contracts.employeeId, filters.employeeId));
    }
    if (filters?.status) {
      query = query.where(eq(contracts.status, filters.status));
    }
    
    return await query;
  }

  async getContract(id: number): Promise<Contract | null> {
    const [contract] = await this.db.select().from(contracts).where(eq(contracts.id, id));
    return contract || null;
  }

  async updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | null> {
    const [result] = await this.db.update(contracts).set(contract).where(eq(contracts.id, id)).returning();
    return result || null;
  }

  async getContractByDocuSignId(envelopeId: string): Promise<Contract | null> {
    const [contract] = await this.db.select().from(contracts).where(eq(contracts.docusignEnvelopeId, envelopeId));
    return contract || null;
  }

  // Quote Management
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [result] = await this.db.insert(quotes).values(quote).returning();
    return result;
  }

  async getQuotes(filters?: { employeeId?: number; status?: string; clientName?: string }): Promise<Quote[]> {
    let query = this.db.select().from(quotes);
    
    if (filters?.employeeId) {
      query = query.where(eq(quotes.employeeId, filters.employeeId));
    }
    if (filters?.status) {
      query = query.where(eq(quotes.status, filters.status));
    }
    if (filters?.clientName) {
      query = query.where(ilike(quotes.clientName, `%${filters.clientName}%`));
    }
    
    return await query.orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: number): Promise<Quote | null> {
    const [quote] = await this.db.select().from(quotes).where(eq(quotes.id, id));
    return quote || null;
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | null> {
    const [result] = await this.db.update(quotes)
      .set({ ...quote, lastUpdated: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return result || null;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const result = await this.db.delete(quotes).where(eq(quotes.id, id));
    return result.rowCount > 0;
  }

  // Quote Line Items
  async createQuoteLineItem(lineItem: InsertQuoteLineItem): Promise<QuoteLineItem> {
    const [result] = await this.db.insert(quoteLineItems).values(lineItem).returning();
    return result;
  }

  async getQuoteLineItems(quoteId: number): Promise<QuoteLineItem[]> {
    return await this.db.select().from(quoteLineItems)
      .where(eq(quoteLineItems.quoteId, quoteId))
      .orderBy(quoteLineItems.sortOrder);
  }

  async updateQuoteLineItem(id: number, lineItem: Partial<InsertQuoteLineItem>): Promise<QuoteLineItem | null> {
    const [result] = await this.db.update(quoteLineItems).set(lineItem).where(eq(quoteLineItems.id, id)).returning();
    return result || null;
  }

  async deleteQuoteLineItem(id: number): Promise<boolean> {
    const result = await this.db.delete(quoteLineItems).where(eq(quoteLineItems.id, id));
    return result.rowCount > 0;
  }

  // Vendor Management
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [result] = await this.db.insert(vendors).values(vendor).returning();
    return result;
  }

  async getVendors(filters?: { category?: string; isActive?: boolean }): Promise<Vendor[]> {
    let query = this.db.select().from(vendors);
    
    if (filters?.category) {
      query = query.where(eq(vendors.category, filters.category));
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(vendors.isActive, filters.isActive));
    }
    
    return await query.orderBy(vendors.name);
  }

  async getVendor(id: number): Promise<Vendor | null> {
    const [vendor] = await this.db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || null;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | null> {
    const [result] = await this.db.update(vendors).set(vendor).where(eq(vendors.id, id)).returning();
    return result || null;
  }

  // Material Management
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [result] = await this.db.insert(materials).values(material).returning();
    return result;
  }

  async getMaterials(filters?: { category?: string; isActive?: boolean }): Promise<Material[]> {
    let query = this.db.select().from(materials);
    
    if (filters?.category) {
      query = query.where(eq(materials.category, filters.category));
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(materials.isActive, filters.isActive));
    }
    
    return await query.orderBy(materials.name);
  }

  async getMaterial(id: number): Promise<Material | null> {
    const [material] = await this.db.select().from(materials).where(eq(materials.id, id));
    return material || null;
  }

  async updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | null> {
    const [result] = await this.db.update(materials).set(material).where(eq(materials.id, id)).returning();
    return result || null;
  }

  async getLowStockMaterials(): Promise<Material[]> {
    return await this.db.select().from(materials)
      .where(and(
        eq(materials.isActive, true),
        sql`${materials.currentStock} <= ${materials.reorderPoint}`
      ));
  }

  // Material Pricing
  async createMaterialPrice(price: InsertMaterialPrice): Promise<MaterialPrice> {
    // Set previous prices as not current
    await this.db.update(materialPrices)
      .set({ isCurrentPrice: false })
      .where(and(
        eq(materialPrices.materialId, price.materialId),
        eq(materialPrices.vendorId, price.vendorId)
      ));

    const [result] = await this.db.insert(materialPrices).values(price).returning();
    return result;
  }

  async getMaterialPrices(materialId: number): Promise<MaterialPrice[]> {
    return await this.db.select().from(materialPrices)
      .where(eq(materialPrices.materialId, materialId))
      .orderBy(desc(materialPrices.effectiveDate));
  }

  async getCurrentMaterialPrice(materialId: number, vendorId: number): Promise<MaterialPrice | null> {
    const [price] = await this.db.select().from(materialPrices)
      .where(and(
        eq(materialPrices.materialId, materialId),
        eq(materialPrices.vendorId, vendorId),
        eq(materialPrices.isCurrentPrice, true)
      ));
    return price || null;
  }

  async updateMaterialPrice(id: number, price: Partial<InsertMaterialPrice>): Promise<MaterialPrice | null> {
    const [result] = await this.db.update(materialPrices).set(price).where(eq(materialPrices.id, id)).returning();
    return result || null;
  }

  // Material Orders
  async createMaterialOrder(order: InsertMaterialOrder): Promise<MaterialOrder> {
    const [result] = await this.db.insert(materialOrders).values(order).returning();
    return result;
  }

  async getMaterialOrders(filters?: { vendorId?: number; status?: string }): Promise<MaterialOrder[]> {
    let query = this.db.select().from(materialOrders);
    
    if (filters?.vendorId) {
      query = query.where(eq(materialOrders.vendorId, filters.vendorId));
    }
    if (filters?.status) {
      query = query.where(eq(materialOrders.status, filters.status));
    }
    
    return await query.orderBy(desc(materialOrders.orderDate));
  }

  async getMaterialOrder(id: number): Promise<MaterialOrder | null> {
    const [order] = await this.db.select().from(materialOrders).where(eq(materialOrders.id, id));
    return order || null;
  }

  async updateMaterialOrder(id: number, order: Partial<InsertMaterialOrder>): Promise<MaterialOrder | null> {
    const [result] = await this.db.update(materialOrders).set(order).where(eq(materialOrders.id, id)).returning();
    return result || null;
  }

  // Material Order Items
  async createMaterialOrderItem(item: InsertMaterialOrderItem): Promise<MaterialOrderItem> {
    const [result] = await this.db.insert(materialOrderItems).values(item).returning();
    return result;
  }

  async getMaterialOrderItems(orderId: number): Promise<MaterialOrderItem[]> {
    return await this.db.select().from(materialOrderItems).where(eq(materialOrderItems.orderId, orderId));
  }

  async updateMaterialOrderItem(id: number, item: Partial<InsertMaterialOrderItem>): Promise<MaterialOrderItem | null> {
    const [result] = await this.db.update(materialOrderItems).set(item).where(eq(materialOrderItems.id, id)).returning();
    return result || null;
  }

  // Material Usage
  async createMaterialUsage(usage: InsertMaterialUsage): Promise<MaterialUsage> {
    const [result] = await this.db.insert(materialUsage).values(usage).returning();
    
    // Update material stock
    await this.db.update(materials)
      .set({ 
        currentStock: sql`${materials.currentStock} - ${usage.quantityUsed}` 
      })
      .where(eq(materials.id, usage.materialId));
    
    return result;
  }

  async getMaterialUsage(filters?: { 
    materialId?: number; 
    employeeId?: number; 
    startDate?: Date; 
    endDate?: Date 
  }): Promise<MaterialUsage[]> {
    let query = this.db.select().from(materialUsage);
    const conditions = [];
    
    if (filters?.materialId) {
      conditions.push(eq(materialUsage.materialId, filters.materialId));
    }
    if (filters?.employeeId) {
      conditions.push(eq(materialUsage.employeeId, filters.employeeId));
    }
    if (filters?.startDate) {
      conditions.push(gte(materialUsage.usageDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(materialUsage.usageDate, filters.endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(materialUsage.usageDate));
  }

  async getMaterialUsageStats(materialId: number, startDate: Date, endDate: Date): Promise<{ totalUsed: number; averageDaily: number }> {
    const [result] = await this.db
      .select({
        totalUsed: sql<number>`sum(${materialUsage.quantityUsed})`,
        days: sql<number>`extract(days from ${endDate} - ${startDate}) + 1`
      })
      .from(materialUsage)
      .where(and(
        eq(materialUsage.materialId, materialId),
        gte(materialUsage.usageDate, startDate),
        lte(materialUsage.usageDate, endDate)
      ));

    const totalUsed = result?.totalUsed || 0;
    const days = result?.days || 1;
    const averageDaily = totalUsed / days;

    return { totalUsed, averageDaily };
  }
```

**Important**: You must also add the same methods to the `MemStorage` class with in-memory implementations. For brevity, implement them as simple array operations following the existing pattern.

### Step 3.2: Create Employee Portal API Routes
**File to modify**: `server/routes.ts`

**Action**: Add these imports at the top:

```typescript
import { hubSpotService } from "./services/hubspot";
import { docuSignService } from "./services/docusign";
import { supabaseStorageService } from "./services/supabase";
import { 
  insertEmployeeSchema,
  insertInquiryAssignmentSchema,
  insertContractSchema,
  insertQuoteSchema,
  insertQuoteLineItemSchema,
  insertVendorSchema,
  insertMaterialSchema,
  insertMaterialPriceSchema,
  insertMaterialOrderSchema,
  insertMaterialOrderItemSchema,
  insertMaterialUsageSchema
} from "@shared/schema";
```

**Action**: Add these routes before the final `return server;` statement:

```typescript
  // ===== EMPLOYEE PORTAL ROUTES =====

  // Employee Authentication & Management
  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json({ message: "Employee created successfully", data: employee });
    } catch (error) {
      handleError(res, error, "Invalid employee data");
    }
  });

  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json({ data: employees });
    } catch (error) {
      handleError(res, error, "Error retrieving employees");
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ data: employee });
    } catch (error) {
      handleError(res, error, "Error retrieving employee");
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.updateEmployee(id, req.body);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee updated successfully", data: employee });
    } catch (error) {
      handleError(res, error, "Error updating employee");
    }
  });

  // Inquiry Management
  app.get("/api/inquiries", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const status = req.query.status as string;
      
      const assignments = await storage.getInquiryAssignments({ employeeId, status });
      
      // Get full quote request details for each assignment
      const inquiriesWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const quoteRequest = await storage.getQuoteRequest(assignment.quoteRequestId);
          return {
            ...assignment,
            quoteRequest
          };
        })
      );
      
      res.json({ data: inquiriesWithDetails });
    } catch (error) {
      handleError(res, error, "Error retrieving inquiries");
    }
  });

  app.get("/api/inquiries/unassigned", async (req, res) => {
    try {
      const unassignedRequests = await storage.getUnassignedQuoteRequests();
      res.json({ data: unassignedRequests });
    } catch (error) {
      handleError(res, error, "Error retrieving unassigned inquiries");
    }
  });

  app.post("/api/inquiries/assign", async (req, res) => {
    try {
      const validatedData = insertInquiryAssignmentSchema.parse(req.body);
      const assignment = await storage.createInquiryAssignment(validatedData);
      
      // Sync with HubSpot if enabled
      try {
        const quoteRequest = await storage.getQuoteRequest(validatedData.quoteRequestId);
        if (quoteRequest) {
          const hubspotData = await hubSpotService.syncQuoteRequestToHubSpot(quoteRequest);
          await storage.updateInquiryAssignment(assignment.id, {
            hubspotDealId: hubspotData.dealId
          });
        }
      } catch (hubspotError) {
        console.warn("HubSpot sync failed:", hubspotError);
        // Continue without failing the assignment
      }
      
      res.status(201).json({ message: "Inquiry assigned successfully", data: assignment });
    } catch (error) {
      handleError(res, error, "Invalid assignment data");
    }
  });

  app.patch("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assignment = await storage.updateInquiryAssignment(id, req.body);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Sync status updates with HubSpot if dealId exists
      if (assignment.hubspotDealId && req.body.status) {
        try {
          const hubspotStage = getHubSpotStageFromStatus(req.body.status);
          await hubSpotService.updateDeal(assignment.hubspotDealId, {
            dealstage: hubspotStage
          });
        } catch (hubspotError) {
          console.warn("HubSpot update failed:", hubspotError);
        }
      }
      
      res.json({ message: "Assignment updated successfully", data: assignment });
    } catch (error) {
      handleError(res, error, "Error updating assignment");
    }
  });

  // Quote Management
  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      
      // Generate quote number
      const quoteNumber = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const quoteData = { ...validatedData, quoteNumber };
      
      const quote = await storage.createQuote(quoteData);
      res.status(201).json({ message: "Quote created successfully", data: quote });
    } catch (error) {
      handleError(res, error, "Invalid quote data");
    }
  });

  app.get("/api/quotes", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const status = req.query.status as string;
      const clientName = req.query.clientName as string;
      
      const quotes = await storage.getQuotes({ employeeId, status, clientName });
      res.json({ data: quotes });
    } catch (error) {
      handleError(res, error, "Error retrieving quotes");
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const lineItems = await storage.getQuoteLineItems(id);
      res.json({ data: { ...quote, lineItems } });
    } catch (error) {
      handleError(res, error, "Error retrieving quote");
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.updateQuote(id, req.body);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json({ message: "Quote updated successfully", data: quote });
    } catch (error) {
      handleError(res, error, "Error updating quote");
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuote(id);
      if (!success) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json({ message: "Quote deleted successfully" });
    } catch (error) {
      handleError(res, error, "Error deleting quote");
    }
  });

  // Quote Line Items
  app.post("/api/quotes/:quoteId/line-items", async (req, res) => {
    try {
      const quoteId = parseInt(req.params.quoteId);
      const validatedData = insertQuoteLineItemSchema.parse({ ...req.body, quoteId });
      const lineItem = await storage.createQuoteLineItem(validatedData);
      res.status(201).json({ message: "Line item added successfully", data: lineItem });
    } catch (error) {
      handleError(res, error, "Invalid line item data");
    }
  });

  app.patch("/api/quote-line-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lineItem = await storage.updateQuoteLineItem(id, req.body);
      if (!lineItem) {
        return res.status(404).json({ message: "Line item not found" });
      }
      res.json({ message: "Line item updated successfully", data: lineItem });
    } catch (error) {
      handleError(res, error, "Error updating line item");
    }
  });

  app.delete("/api/quote-line-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuoteLineItem(id);
      if (!success) {
        return res.status(404).json({ message: "Line item not found" });
      }
      res.json({ message: "Line item deleted successfully" });
    } catch (error) {
      handleError(res, error, "Error deleting line item");
    }
  });

  // Contract Management
  app.post("/api/contracts", async (req, res) => {
    try {
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData);
      res.status(201).json({ message: "Contract created successfully", data: contract });
    } catch (error) {
      handleError(res, error, "Invalid contract data");
    }
  });

  app.get("/api/contracts", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const status = req.query.status as string;
      
      const contracts = await storage.getContracts({ employeeId, status });
      res.json({ data: contracts });
    } catch (error) {
      handleError(res, error, "Error retrieving contracts");
    }
  });

  app.post("/api/contracts/:id/send-docusign", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const { templateId, signerEmail, signerName, serviceDescription, effectiveDate } = req.body;

      const envelope = await docuSignService.createEnvelopeFromTemplate(
        templateId,
        signerEmail,
        signerName,
        {
          clientName: contract.clientName,
          contractValue: contract.contractValue || 0,
          serviceDescription,
          effectiveDate
        }
      );

      await storage.updateContract(id, {
        docusignEnvelopeId: envelope.envelopeId,
        status: "sent"
      });

      res.json({ message: "Contract sent via DocuSign successfully", data: envelope });
    } catch (error) {
      handleError(res, error, "Error sending contract via DocuSign");
    }
  });

  app.post("/api/contracts/docusign-webhook", async (req, res) => {
    try {
      const { envelopeId, status } = req.body;
      
      const contract = await storage.getContractByDocuSignId(envelopeId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      if (status === "completed") {
        // Download signed document
        const documentBuffer = await docuSignService.downloadCompletedDocument(envelopeId);
        
        // Upload to Supabase
        const fileName = `${contract.contractTitle.replace(/\s+/g, '_')}_signed.pdf`;
        const storagePath = await supabaseStorageService.uploadContract(
          contract.id.toString(),
          fileName,
          documentBuffer,
          "application/pdf"
        );

        await storage.updateContract(contract.id, {
          status: "signed",
          signedDate: new Date(),
          supabaseStoragePath: storagePath
        });
      } else {
        await storage.updateContract(contract.id, {
          status: status,
          lastStatusCheck: new Date()
        });
      }

      res.json({ message: "Contract status updated successfully" });
    } catch (error) {
      handleError(res, error, "Error processing DocuSign webhook");
    }
  });

  // Vendor Management
  app.post("/api/vendors", async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      res.status(201).json({ message: "Vendor created successfully", data: vendor });
    } catch (error) {
      handleError(res, error, "Invalid vendor data");
    }
  });

  app.get("/api/vendors", async (req, res) => {
    try {
      const category = req.query.category as string;
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      
      const vendors = await storage.getVendors({ category, isActive });
      res.json({ data: vendors });
    } catch (error) {
      handleError(res, error, "Error retrieving vendors");
    }
  });

  app.patch("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.updateVendor(id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ message: "Vendor updated successfully", data: vendor });
    } catch (error) {
      handleError(res, error, "Error updating vendor");
    }
  });

  // Material Management
  app.post("/api/materials", async (req, res) => {
    try {
      const validatedData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(validatedData);
      res.status(201).json({ message: "Material created successfully", data: material });
    } catch (error) {
      handleError(res, error, "Invalid material data");
    }
  });

  app.get("/api/materials", async (req, res) => {
    try {
      const category = req.query.category as string;
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      
      const materials = await storage.getMaterials({ category, isActive });
      res.json({ data: materials });
    } catch (error) {
      handleError(res, error, "Error retrieving materials");
    }
  });

  app.get("/api/materials/low-stock", async (req, res) => {
    try {
      const materials = await storage.getLowStockMaterials();
      res.json({ data: materials });
    } catch (error) {
      handleError(res, error, "Error retrieving low stock materials");
    }
  });

  app.patch("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.updateMaterial(id, req.body);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      res.json({ message: "Material updated successfully", data: material });
    } catch (error) {
      handleError(res, error, "Error updating material");
    }
  });

  // Material Usage Tracking
  app.post("/api/material-usage", async (req, res) => {
    try {
      const validatedData = insertMaterialUsageSchema.parse(req.body);
      const usage = await storage.createMaterialUsage(validatedData);
      res.status(201).json({ message: "Material usage recorded successfully", data: usage });
    } catch (error) {
      handleError(res, error, "Invalid usage data");
    }
  });

  app.get("/api/material-usage", async (req, res) => {
    try {
      const materialId = req.query.materialId ? parseInt(req.query.materialId as string) : undefined;
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const usage = await storage.getMaterialUsage({ materialId, employeeId, startDate, endDate });
      res.json({ data: usage });
    } catch (error) {
      handleError(res, error, "Error retrieving material usage");
    }
  });

  // Material Orders
  app.post("/api/material-orders", async (req, res) => {
    try {
      const validatedData = insertMaterialOrderSchema.parse(req.body);
      
      // Generate order number
      const orderNumber = `MO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const orderData = { ...validatedData, orderNumber };
      
      const order = await storage.createMaterialOrder(orderData);
      res.status(201).json({ message: "Material order created successfully", data: order });
    } catch (error) {
      handleError(res, error, "Invalid order data");
    }
  });

  app.get("/api/material-orders", async (req, res) => {
    try {
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined;
      const status = req.query.status as string;
      
      const orders = await storage.getMaterialOrders({ vendorId, status });
      res.json({ data: orders });
    } catch (error) {
      handleError(res, error, "Error retrieving material orders");
    }
  });

  app.patch("/api/material-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.updateMaterialOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order updated successfully", data: order });
    } catch (error) {
      handleError(res, error, "Error updating order");
    }
  });
```

**Action**: Add this helper function before the routes:

```typescript
function getHubSpotStageFromStatus(status: string): string {
  const stageMapping: Record<string, string> = {
    "assigned": "appointmentscheduled",
    "in_progress": "qualifiedtobuy",
    "completed": "closedwon",
    "closed": "closedlost"
  };
  return stageMapping[status] || "appointmentscheduled";
}
```

---

## PHASE 4: FRONTEND DEVELOPMENT

### Step 4.1: Create Employee Portal Route
**File to modify**: `client/src/App.tsx`

**Action**: Add this import:

```typescript
import { EmployeePortal } from "./pages/EmployeePortal";
```

**Action**: Add this route inside the `<Switch>` component:

```typescript
<Route path="/employee" component={EmployeePortal} />
```

### Step 4.2: Create Employee Portal Main Page
**File to create**: `client/src/pages/EmployeePortal.tsx`

```typescript
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Calculator, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { InquiryManagement } from '../components/employee/InquiryManagement';
import { ContractManagement } from '../components/employee/ContractManagement';
import { QuoteManagement } from '../components/employee/QuoteManagement';
import { MaterialsInventory } from '../components/employee/MaterialsInventory';

export interface Employee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export function EmployeePortal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/employee-stats'],
    enabled: !!currentEmployee
  });

  // Mock authentication for demo - in production, implement proper auth
  React.useEffect(() => {
    // This would be replaced with actual authentication
    setCurrentEmployee({
      id: 1,
      email: "demo@tsgfulfillment.com",
      firstName: "Demo",
      lastName: "User",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }, []);

  if (!currentEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Employee Portal Login</CardTitle>
            <CardDescription>Please sign in to access the employee portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Button className="w-full">Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
              <p className="text-sm text-gray-500">Welcome back, {currentEmployee.firstName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={currentEmployee.role === 'admin' ? 'default' : 'secondary'}>
                {currentEmployee.role}
              </Badge>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiryManagement employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="quotes">
            <QuoteManagement employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractManagement employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsInventory employeeId={currentEmployee.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardOverview({ employeeId }: { employeeId: number }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/employee-stats', employeeId]
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  // Mock data for demonstration
  const mockStats = {
    totalInquiries: 24,
    activeQuotes: 8,
    signedContracts: 12,
    lowStockItems: 3,
    recentActivity: [
      { type: "inquiry", message: "New inquiry from ABC Corp", time: "2 hours ago" },
      { type: "quote", message: "Quote Q-12345 accepted", time: "4 hours ago" },
      { type: "contract", message: "Contract signed for XYZ Ltd", time: "1 day ago" },
      { type: "material", message: "Low stock alert: Bubble wrap", time: "2 days ago" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-blue-600">{mockStats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                <p className="text-3xl font-bold text-yellow-600">{mockStats.activeQuotes}</p>
              </div>
              <Calculator className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed Contracts</p>
                <p className="text-3xl font-bold text-green-600">{mockStats.signedContracts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{mockStats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {activity.type === 'inquiry' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                  {activity.type === 'quote' && <Calculator className="h-5 w-5 text-yellow-500" />}
                  {activity.type === 'contract' && <FileText className="h-5 w-5 text-green-500" />}
                  {activity.type === 'material' && <Package className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4.3: Create Component Files Directory
**Action**: Create directory `client/src/components/employee/`

### Step 4.4: Create Inquiry Management Component
**File to create**: `client/src/components/employee/InquiryManagement.tsx`

```typescript
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Clock, User, Mail, Phone, Building2, MessageSquare } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  createdAt: string;
  status: string;
}

interface InquiryAssignment {
  id: number;
  quoteRequestId: number;
  employeeId: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  assignedAt: string;
  lastUpdated: string;
  quoteRequest: QuoteRequest;
}

interface InquiryManagementProps {
  employeeId: number;
}

export function InquiryManagement({ employeeId }: InquiryManagementProps) {
  const [selectedTab, setSelectedTab] = useState<'assigned' | 'unassigned'>('assigned');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryAssignment | null>(null);
  const [assignDialog, setAssignDialog] = useState<QuoteRequest | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch assigned inquiries
  const { data: assignedInquiries, isLoading: assignedLoading } = useQuery({
    queryKey: ['/api/inquiries', { employeeId }],
    enabled: selectedTab === 'assigned'
  });

  // Fetch unassigned inquiries
  const { data: unassignedInquiries, isLoading: unassignedLoading } = useQuery({
    queryKey: ['/api/inquiries/unassigned'],
    enabled: selectedTab === 'unassigned'
  });

  // Assign inquiry mutation
  const assignMutation = useMutation({
    mutationFn: (data: { quoteRequestId: number; employeeId: number; priority: string; notes?: string }) => 
      apiRequest('/api/inquiries/assign', 'POST', data),
    onSuccess: () => {
      toast({ title: "Success", description: "Inquiry assigned successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      setAssignDialog(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign inquiry", variant: "destructive" });
    }
  });

  // Update inquiry mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; status?: string; notes?: string; priority?: string }) => 
      apiRequest(`/api/inquiries/${id}`, 'PATCH', data),
    onSuccess: () => {
      toast({ title: "Success", description: "Inquiry updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      setSelectedInquiry(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update inquiry", variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inquiry Management</h2>
          <p className="text-gray-600">Manage customer inquiries and assignments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedTab === 'assigned' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('assigned')}
          >
            My Assignments
          </Button>
          <Button
            variant={selectedTab === 'unassigned' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('unassigned')}
          >
            Unassigned
          </Button>
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'assigned' && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Inquiries</CardTitle>
            <CardDescription>Inquiries assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedLoading ? (
              <div>Loading...</div>
            ) : assignedInquiries?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assigned inquiries found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedInquiries?.data?.map((inquiry: InquiryAssignment) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquiry.quoteRequest.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {inquiry.quoteRequest.email}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {inquiry.quoteRequest.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {inquiry.quoteRequest.company}
                        </div>
                      </TableCell>
                      <TableCell>{inquiry.quoteRequest.service}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(inquiry.priority)}>
                          {inquiry.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(inquiry.assignedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'unassigned' && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Inquiries</CardTitle>
            <CardDescription>New inquiries waiting for assignment</CardDescription>
          </CardHeader>
          <CardContent>
            {unassignedLoading ? (
              <div>Loading...</div>
            ) : unassignedInquiries?.data?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No unassigned inquiries found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedInquiries?.data?.map((request: QuoteRequest) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-gray-500">{request.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.company}</TableCell>
                      <TableCell>{request.service}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignDialog(request)}
                        >
                          Assign to Me
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      {assignDialog && (
        <AssignmentDialog
          request={assignDialog}
          employeeId={employeeId}
          onClose={() => setAssignDialog(null)}
          onAssign={(data) => assignMutation.mutate(data)}
          isLoading={assignMutation.isPending}
        />
      )}

      {/* Inquiry Detail Dialog */}
      {selectedInquiry && (
        <InquiryDetailDialog
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdate={(data) => updateMutation.mutate({ id: selectedInquiry.id, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function AssignmentDialog({ 
  request, 
  employeeId, 
  onClose, 
  onAssign, 
  isLoading 
}: {
  request: QuoteRequest;
  employeeId: number;
  onClose: () => void;
  onAssign: (data: any) => void;
  isLoading: boolean;
}) {
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onAssign({
      quoteRequestId: request.id,
      employeeId,
      priority,
      notes: notes || undefined
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Inquiry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {request.name}</p>
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Phone:</strong> {request.phone}</p>
                <p><strong>Company:</strong> {request.company}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Request Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Service:</strong> {request.service}</p>
                <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Message</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {request.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Initial Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any initial notes or observations..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Assigning...' : 'Assign to Me'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InquiryDetailDialog({ 
  inquiry, 
  onClose, 
  onUpdate, 
  isLoading 
}: {
  inquiry: InquiryAssignment;
  onClose: () => void;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [status, setStatus] = useState(inquiry.status);
  const [priority, setPriority] = useState(inquiry.priority);
  const [notes, setNotes] = useState(inquiry.notes || '');

  const handleSubmit = () => {
    onUpdate({ status, priority, notes: notes || undefined });
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Inquiry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {inquiry.quoteRequest.name}</p>
                <p><strong>Email:</strong> {inquiry.quoteRequest.email}</p>
                <p><strong>Phone:</strong> {inquiry.quoteRequest.phone}</p>
                <p><strong>Company:</strong> {inquiry.quoteRequest.company}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Request Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Service:</strong> {inquiry.quoteRequest.service}</p>
                <p><strong>Submitted:</strong> {new Date(inquiry.quoteRequest.createdAt).toLocaleString()}</p>
                <p><strong>Assigned:</strong> {new Date(inquiry.assignedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Customer Message</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {inquiry.quoteRequest.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this inquiry..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Inquiry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## PHASE 5: TESTING AND DEPLOYMENT PREPARATION

### Step 5.1: Create Test Data Seeding Script
**File to create**: `scripts/seed-employee-portal.js`

```javascript
const { db } = require('../server/db');
const { employees, vendors, materials, materialPrices } = require('../shared/schema');

async function seedEmployeePortalData() {
  console.log("🌱 Seeding Employee Portal data...");

  try {
    // Create sample employees
    const sampleEmployees = [
      {
        email: "admin@tsgfulfillment.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true
      },
      {
        email: "sales1@tsgfulfillment.com",
        firstName: "John",
        lastName: "Smith",
        role: "sales",
        isActive: true
      },
      {
        email: "sales2@tsgfulfillment.com",
        firstName: "Jane",
        lastName: "Doe",
        role: "sales",
        isActive: true
      }
    ];

    await db.insert(employees).values(sampleEmployees);
    console.log("✅ Sample employees created");

    // Create sample vendors
    const sampleVendors = [
      {
        name: "PackagingPro Inc",
        contactPerson: "Mike Johnson",
        email: "mike@packagingpro.com",
        phone: "416-555-0101",
        category: "packaging",
        isActive: true,
        paymentTerms: "Net 30"
      },
      {
        name: "ShipFast Solutions",
        contactPerson: "Sarah Lee",
        email: "sarah@shipfast.com",
        phone: "416-555-0102",
        category: "shipping",
        isActive: true,
        paymentTerms: "Net 15"
      }
    ];

    await db.insert(vendors).values(sampleVendors);
    console.log("✅ Sample vendors created");

    // Create sample materials
    const sampleMaterials = [
      {
        name: "Bubble Wrap Roll",
        category: "packaging",
        sku: "BW-12-500",
        description: "12\" x 500ft bubble wrap roll",
        unit: "rolls",
        currentStock: 45,
        minStock: 20,
        reorderPoint: 25,
        isActive: true
      },
      {
        name: "Shipping Labels",
        category: "labels",
        sku: "LBL-4X6-1000",
        description: "4\"x6\" thermal shipping labels, 1000/roll",
        unit: "rolls",
        currentStock: 12,
        minStock: 10,
        reorderPoint: 15,
        isActive: true
      },
      {
        name: "Cardboard Boxes - Medium",
        category: "boxes",
        sku: "BOX-12X10X8",
        description: "12\"x10\"x8\" corrugated boxes",
        unit: "pieces",
        currentStock: 5,
        minStock: 50,
        reorderPoint: 75,
        isActive: true
      }
    ];

    const createdMaterials = await db.insert(materials).values(sampleMaterials).returning();
    console.log("✅ Sample materials created");

    // Create sample pricing
    const samplePrices = [
      {
        materialId: createdMaterials[0].id,
        vendorId: 1,
        price: 12.50,
        currency: "CAD",
        minQuantity: 1,
        isCurrentPrice: true
      },
      {
        materialId: createdMaterials[1].id,
        vendorId: 1,
        price: 8.99,
        currency: "CAD",
        minQuantity: 1,
        isCurrentPrice: true
      },
      {
        materialId: createdMaterials[2].id,
        vendorId: 1,
        price: 1.25,
        currency: "CAD",
        minQuantity: 50,
        isCurrentPrice: true
      }
    ];

    await db.insert(materialPrices).values(samplePrices);
    console.log("✅ Sample pricing created");

    console.log("🎉 Employee Portal data seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding Employee Portal data:", error);
    throw error;
  }
}

module.exports = { seedEmployeePortalData };

// Run seeding if called directly
if (require.main === module) {
  seedEmployeePortalData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
```

### Step 5.2: Environment Variables Documentation
**File to create**: `EMPLOYEE_PORTAL_ENV_SETUP.md`

```markdown
# Employee Portal Environment Variables Setup

## Required API Keys and Credentials

The Employee Portal requires several external service integrations. Follow these steps to obtain and configure the necessary API keys:

### 1. HubSpot Integration

**Purpose**: Sync quote requests, manage deals, and track customer interactions

**Required Variables**:
- `HUBSPOT_ACCESS_TOKEN`
- `HUBSPOT_CLIENT_ID`
- `HUBSPOT_CLIENT_SECRET`

**Setup Steps**:
1. Log in to your HubSpot account (https://app.hubspot.com)
2. Navigate to Settings → Integrations → Private Apps
3. Create a new private app named "TSG Employee Portal"
4. Grant the following scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
5. Generate and copy the access token
6. Note down your Client ID and Client Secret

### 2. DocuSign Integration

**Purpose**: Send contracts for electronic signature and store signed documents

**Required Variables**:
- `DOCUSIGN_INTEGRATION_KEY`
- `DOCUSIGN_USER_ID`
- `DOCUSIGN_ACCOUNT_ID`
- `DOCUSIGN_PRIVATE_KEY`
- `DOCUSIGN_BASE_PATH`

**Setup Steps**:
1. Log in to DocuSign Developer Portal (https://developers.docusign.com)
2. Create a new application
3. Configure JWT authentication
4. Generate RSA key pair and copy the private key
5. Note your Integration Key, User ID, and Account ID
6. Set `DOCUSIGN_BASE_PATH` to:
   - Demo: `https://demo.docusign.net/restapi`
   - Production: `https://www.docusign.net/restapi`

### 3. Supabase Storage

**Purpose**: Store signed contracts and documents

**Required Variables**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Setup Steps**:
1. Log in to Supabase (https://app.supabase.com)
2. Create a new project or use existing
3. Navigate to Settings → API
4. Copy the Project URL, anon/public key, and service_role key

### 4. Add to Environment File

Create or update your `.env` file with these variables:

```env
# HubSpot Integration
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here
HUBSPOT_CLIENT_ID=your_hubspot_client_id_here
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret_here

# DocuSign Integration
DOCUSIGN_INTEGRATION_KEY=your_docusign_integration_key_here
DOCUSIGN_USER_ID=your_docusign_user_id_here
DOCUSIGN_ACCOUNT_ID=your_docusign_account_id_here
DOCUSIGN_PRIVATE_KEY=your_base64_encoded_private_key_here
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi

# Supabase Storage
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Testing Credentials

For development and testing, you can use sandbox/demo accounts:

- **HubSpot**: Use HubSpot's free tier or sandbox
- **DocuSign**: Use DocuSign Developer Sandbox
- **Supabase**: Use Supabase free tier

## Security Notes

1. Never commit `.env` files to version control
2. Use different keys for development, staging, and production
3. Rotate keys regularly
4. Monitor API usage and set up alerts
5. Use service role keys only on the server-side
```

---

## PHASE 6: IMPLEMENTATION ORDER AND CHECKLIST

### Complete Implementation Checklist

**CRITICAL**: Complete tasks in EXACTLY this order. Do not skip steps or rearrange.

#### Phase 1: Database Foundation ✓
- [ ] 1.1: Update `shared/schema.ts` with all Employee Portal tables
- [ ] 1.2: Run `npm run db:push` to apply schema changes
- [ ] 1.3: Verify database tables were created successfully

#### Phase 2: External Services Setup ✓
- [ ] 2.1: Install required dependencies using packager tool
- [ ] 2.2: Request API keys from user using ask_secrets tool
- [ ] 2.3: Create `server/services/hubspot.ts`
- [ ] 2.4: Create `server/services/docusign.ts`
- [ ] 2.5: Create `server/services/supabase.ts`
- [ ] 2.6: Test service connections (create simple test endpoints)

#### Phase 3: Backend API Development ✓
- [ ] 3.1: Update `server/storage.ts` with all new interface methods
- [ ] 3.2: Implement DatabaseStorage methods for all new tables
- [ ] 3.3: Implement MemStorage methods for all new tables
- [ ] 3.4: Add all Employee Portal API routes to `server/routes.ts`
- [ ] 3.5: Test all API endpoints using curl or API testing tool

#### Phase 4: Frontend Development ✓
- [ ] 4.1: Add Employee Portal route to `client/src/App.tsx`
- [ ] 4.2: Create `client/src/pages/EmployeePortal.tsx`
- [ ] 4.3: Create `client/src/components/employee/InquiryManagement.tsx`
- [ ] 4.4: Create `client/src/components/employee/QuoteManagement.tsx`
- [ ] 4.5: Create `client/src/components/employee/ContractManagement.tsx`
- [ ] 4.6: Create `client/src/components/employee/MaterialsInventory.tsx`

#### Phase 5: Testing and Integration ✓
- [ ] 5.1: Create and run seeding script `scripts/seed-employee-portal.js`
- [ ] 5.2: Test Employee Portal access at `/employee`
- [ ] 5.3: Test inquiry assignment and management
- [ ] 5.4: Test quote creation and line items
- [ ] 5.5: Test contract creation and DocuSign integration
- [ ] 5.6: Test materials inventory and usage tracking
- [ ] 5.7: Test HubSpot synchronization

#### Phase 6: Authentication and Security ✓
- [ ] 6.1: Implement employee authentication system
- [ ] 6.2: Add role-based access control
- [ ] 6.3: Secure API endpoints with authentication middleware
- [ ] 6.4: Test security and access controls

### Important Implementation Notes

1. **Database First**: Always implement database schema changes first and test with `npm run db:push`

2. **API Testing**: After creating each API endpoint, test it immediately with curl commands:
   ```bash
   curl -X GET "http://localhost:5000/api/employees"
   curl -X POST "http://localhost:5000/api/employees" -H "Content-Type: application/json" -d '{"email":"test@test.com","firstName":"Test","lastName":"User","role":"admin"}'
   ```

3. **Service Integration**: Test external services separately before integrating:
   ```bash
   # Create simple test endpoints first
   curl -X GET "http://localhost:5000/api/test-hubspot"
   curl -X GET "http://localhost:5000/api/test-docusign"
   curl -X GET "http://localhost:5000/api/test-supabase"
   ```

4. **Frontend Components**: Build components incrementally and test each independently before combining

5. **Error Handling**: Implement comprehensive error handling at each layer (database, API, frontend)

### Deployment Considerations

1. **Environment Variables**: Ensure all required environment variables are set in production
2. **Database Migrations**: Use `npm run db:push` for schema changes
3. **File Uploads**: Configure Supabase bucket permissions for contract storage
4. **API Rate Limits**: Monitor and handle rate limits for external services
5. **Authentication**: Implement proper session management and security

### Success Criteria

The Employee Portal implementation is complete when:

1. ✅ All database tables are created and accessible
2. ✅ All API endpoints return proper responses
3. ✅ Employee Portal loads at `/employee` URL
4. ✅ Inquiry assignment workflow works end-to-end
5. ✅ Quote creation and management functions properly
6. ✅ DocuSign integration sends and tracks contracts
7. ✅ Materials inventory tracks usage and stock levels
8. ✅ HubSpot synchronization updates deals and contacts
9. ✅ All forms validate and display appropriate error messages
10. ✅ Data persists correctly across page refreshes

---

## TROUBLESHOOTING GUIDE

### Common Issues and Solutions

#### Database Issues
- **Schema conflicts**: Run `npm run db:push` after any schema changes
- **Missing tables**: Verify schema.ts exports and imports are correct
- **Data loss warnings**: Manually drop conflicting data using SQL tool

#### API Integration Issues
- **HubSpot 401 errors**: Verify access token and scopes
- **DocuSign authentication failures**: Check RSA key format and User ID
- **Supabase storage errors**: Verify bucket exists and permissions are set

#### Frontend Issues
- **Components not rendering**: Check import paths and component exports
- **API calls failing**: Verify backend is running and routes are correct
- **Form validation errors**: Ensure Zod schemas match database schema

#### Performance Issues
- **Slow queries**: Add database indexes for frequently queried columns
- **Large payloads**: Implement pagination for list endpoints
- **Memory leaks**: Use React.memo for heavy components

This documentation provides a complete, step-by-step implementation guide for the TSG Fulfillment Employee Portal. Follow each phase sequentially, test thoroughly at each step, and refer to the troubleshooting guide for common issues.