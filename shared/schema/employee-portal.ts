import { pgTable, serial, text, integer, boolean, timestamp, jsonb, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users, quoteRequests } from "../schema";

// ============================================
// SALES TEAM MEMBERS TABLE
// ============================================
export const salesTeamMembers = pgTable("sales_team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  hubspotOwnerId: text("hubspot_owner_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// QUOTE INQUIRIES TABLE
// ============================================
export const quoteInquiries = pgTable("quote_inquiries", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  assignedTo: integer("assigned_to").references(() => salesTeamMembers.id),
  hubspotDealId: text("hubspot_deal_id"),
  hubspotContactId: text("hubspot_contact_id"),
  status: text("status").default("new"),
  priority: text("priority").default("medium"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: text("sync_status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// CONTRACTS TABLE
// ============================================
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  quoteInquiryId: integer("quote_inquiry_id").references(() => quoteInquiries.id),
  docusignEnvelopeId: text("docusign_envelope_id").notNull(),
  supabaseFilePath: text("supabase_file_path"),
  supabaseFileUrl: text("supabase_file_url"),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  contractType: text("contract_type"),
  status: text("status").default("pending"),
  signedAt: timestamp("signed_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// QUOTE VERSIONS TABLE
// ============================================
export const quoteVersions = pgTable("quote_versions", {
  id: serial("id").primaryKey(),
  quoteInquiryId: integer("quote_inquiry_id").references(() => quoteInquiries.id),
  versionNumber: integer("version_number").notNull(),
  pricingData: jsonb("pricing_data").notNull(),
  services: jsonb("services").notNull(),
  terms: text("terms"),
  validUntil: date("valid_until"),
  createdBy: integer("created_by").references(() => salesTeamMembers.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// ============================================
// MATERIALS TABLE
// ============================================
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  unitOfMeasure: text("unit_of_measure"),
  reorderPoint: integer("reorder_point"),
  reorderQuantity: integer("reorder_quantity"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// VENDORS TABLE
// ============================================
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  paymentTerms: text("payment_terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// MATERIAL INVENTORY TABLE
// ============================================
export const materialInventory = pgTable("material_inventory", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  currentQuantity: integer("current_quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  location: text("location"),
  lastCountedAt: timestamp("last_counted_at"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// MATERIAL PRICES TABLE
// ============================================
export const materialPrices = pgTable("material_prices", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  price: real("price").notNull(),
  minimumOrderQuantity: integer("minimum_order_quantity").default(1),
  leadTimeDays: integer("lead_time_days"),
  isCurrent: boolean("is_current").default(true),
  effectiveDate: date("effective_date").notNull(),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at").defaultNow()
});

// ============================================
// MATERIAL USAGE TABLE
// ============================================
export const materialUsage = pgTable("material_usage", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  quantityUsed: integer("quantity_used").notNull(),
  usedFor: text("used_for"),
  usedBy: integer("used_by").references(() => users.id),
  usageDate: date("usage_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// ============================================
// PURCHASE ORDERS TABLE
// ============================================
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  poNumber: text("po_number").notNull(),
  status: text("status").default("draft"),
  orderDate: date("order_date"),
  expectedDeliveryDate: date("expected_delivery_date"),
  totalAmount: real("total_amount"),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============================================
// PURCHASE ORDER ITEMS TABLE
// ============================================
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
  materialId: integer("material_id").references(() => materials.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  receivedDate: date("received_date")
});

// ============================================
// HUBSPOT SYNC LOG TABLE
// ============================================
export const hubspotSyncLog = pgTable("hubspot_sync_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  createdAt: timestamp("created_at").defaultNow()
});

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

// Sales Team Members Schemas
export const insertSalesTeamMemberSchema = createInsertSchema(salesTeamMembers, {
  email: z.string().email(),
  fullName: z.string().min(1).max(255),
});
export const selectSalesTeamMemberSchema = createSelectSchema(salesTeamMembers);

// Quote Inquiries Schemas
export const insertQuoteInquirySchema = createInsertSchema(quoteInquiries, {
  status: z.enum(["new", "contacted", "quoted", "negotiating", "won", "lost"]),
  priority: z.enum(["low", "medium", "high"]),
});
export const selectQuoteInquirySchema = createSelectSchema(quoteInquiries);

// Contracts Schemas
export const insertContractSchema = createInsertSchema(contracts, {
  clientEmail: z.string().email().optional(),
  status: z.enum(["pending", "completed", "declined", "voided"]),
});
export const selectContractSchema = createSelectSchema(contracts);

// Quote Versions Schemas
export const insertQuoteVersionSchema = createInsertSchema(quoteVersions, {
  versionNumber: z.number().int().positive(),
  pricingData: z.object({
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    lineItems: z.array(z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      total: z.number()
    }))
  }),
  services: z.array(z.string()),
});
export const selectQuoteVersionSchema = createSelectSchema(quoteVersions);

// Materials Schemas
export const insertMaterialSchema = createInsertSchema(materials, {
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  reorderPoint: z.number().int().nonnegative().optional(),
  reorderQuantity: z.number().int().positive().optional(),
});
export const selectMaterialSchema = createSelectSchema(materials);

// Vendors Schemas
export const insertVendorSchema = createInsertSchema(vendors, {
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
});
export const selectVendorSchema = createSelectSchema(vendors);

// Material Inventory Schemas
export const insertMaterialInventorySchema = createInsertSchema(materialInventory, {
  currentQuantity: z.number().int().nonnegative(),
  reservedQuantity: z.number().int().nonnegative(),
});
export const selectMaterialInventorySchema = createSelectSchema(materialInventory);

// Material Prices Schemas
export const insertMaterialPriceSchema = createInsertSchema(materialPrices, {
  price: z.number().positive(),
  minimumOrderQuantity: z.number().int().positive(),
  leadTimeDays: z.number().int().nonnegative().optional(),
});
export const selectMaterialPriceSchema = createSelectSchema(materialPrices);

// Material Usage Schemas
export const insertMaterialUsageSchema = createInsertSchema(materialUsage, {
  quantityUsed: z.number().int().positive(),
  usageDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const selectMaterialUsageSchema = createSelectSchema(materialUsage);

// Purchase Orders Schemas
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders, {
  poNumber: z.string().min(1).max(100),
  status: z.enum(["draft", "submitted", "approved", "rejected", "completed", "cancelled"]),
  totalAmount: z.number().positive().optional(),
});
export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);

// Purchase Order Items Schemas
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems, {
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
});
export const selectPurchaseOrderItemSchema = createSelectSchema(purchaseOrderItems);

// HubSpot Sync Log Schemas
export const insertHubspotSyncLogSchema = createInsertSchema(hubspotSyncLog, {
  entityType: z.enum(["quote_inquiry", "contact", "deal", "sales_team"]),
  action: z.enum(["create", "update", "delete", "sync"]),
  status: z.enum(["success", "failed", "pending"]),
});
export const selectHubspotSyncLogSchema = createSelectSchema(hubspotSyncLog);