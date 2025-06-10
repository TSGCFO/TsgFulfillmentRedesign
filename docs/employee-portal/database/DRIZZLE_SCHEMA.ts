import { pgTable, serial, varchar, integer, boolean, timestamp, text, jsonb, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users, quoteRequests } from "./index"; // Assuming these exist in your main schema

// ============================================
// SALES TEAM MEMBERS TABLE
// ============================================
export const salesTeamMembers = pgTable("sales_team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  hubspotOwnerId: varchar("hubspot_owner_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ============================================
// QUOTE INQUIRIES TABLE
// ============================================
export const quoteInquiries = pgTable("quote_inquiries", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id, { onDelete: "cascade" }),
  assignedTo: integer("assigned_to").references(() => salesTeamMembers.id),
  hubspotDealId: varchar("hubspot_deal_id", { length: 255 }),
  hubspotContactId: varchar("hubspot_contact_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("new"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  syncStatus: varchar("sync_status", { length: 50 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ============================================
// CONTRACTS TABLE
// ============================================
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  quoteInquiryId: integer("quote_inquiry_id").references(() => quoteInquiries.id),
  docusignEnvelopeId: varchar("docusign_envelope_id", { length: 255 }).unique().notNull(),
  supabaseFilePath: varchar("supabase_file_path", { length: 500 }),
  supabaseFileUrl: text("supabase_file_url"),
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email", { length: 255 }),
  contractType: varchar("contract_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default("pending"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// ============================================
// MATERIALS TABLE
// ============================================
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  unitOfMeasure: varchar("unit_of_measure", { length: 50 }),
  reorderPoint: integer("reorder_point"),
  reorderQuantity: integer("reorder_quantity"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ============================================
// VENDORS TABLE
// ============================================
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ============================================
// MATERIAL INVENTORY TABLE
// ============================================
export const materialInventory = pgTable("material_inventory", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  currentQuantity: integer("current_quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  location: varchar("location", { length: 100 }),
  lastCountedAt: timestamp("last_counted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ============================================
// MATERIAL PRICES TABLE
// ============================================
export const materialPrices = pgTable("material_prices", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minimumOrderQuantity: integer("minimum_order_quantity").default(1),
  leadTimeDays: integer("lead_time_days"),
  isCurrent: boolean("is_current").default(true),
  effectiveDate: date("effective_date").notNull(),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// ============================================
// MATERIAL USAGE TABLE
// ============================================
export const materialUsage = pgTable("material_usage", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id),
  quantityUsed: integer("quantity_used").notNull(),
  usedFor: varchar("used_for", { length: 255 }),
  usedBy: integer("used_by").references(() => users.id),
  usageDate: date("usage_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// ============================================
// PURCHASE ORDERS TABLE
// ============================================
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  poNumber: varchar("po_number", { length: 100 }).unique().notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  orderDate: date("order_date"),
  expectedDeliveryDate: date("expected_delivery_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// ============================================
// PURCHASE ORDER ITEMS TABLE
// ============================================
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id, { onDelete: "cascade" }),
  materialId: integer("material_id").references(() => materials.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  receivedDate: date("received_date")
});

// ============================================
// HUBSPOT SYNC LOG TABLE
// ============================================
export const hubspotSyncLog = pgTable("hubspot_sync_log", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  errorMessage: text("error_message"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
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
  price: z.string().regex(/^\d+\.?\d{0,2}$/),
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
  totalAmount: z.string().regex(/^\d+\.?\d{0,2}$/).optional(),
});
export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);

// Purchase Order Items Schemas
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems, {
  quantity: z.number().int().positive(),
  unitPrice: z.string().regex(/^\d+\.?\d{0,2}$/),
  totalPrice: z.string().regex(/^\d+\.?\d{0,2}$/),
});
export const selectPurchaseOrderItemSchema = createSelectSchema(purchaseOrderItems);

// HubSpot Sync Log Schemas
export const insertHubspotSyncLogSchema = createInsertSchema(hubspotSyncLog, {
  entityType: z.enum(["quote_inquiry", "contact", "deal", "sales_team"]),
  action: z.enum(["create", "update", "delete", "sync"]),
  status: z.enum(["success", "failed", "pending"]),
});
export const selectHubspotSyncLogSchema = createSelectSchema(hubspotSyncLog);