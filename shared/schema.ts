import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  service: text("service").notNull(),
  currentShipments: text("current_shipments"),
  expectedShipments: text("expected_shipments"),
  services: text("services"),
  message: text("message"),
  consent: boolean("consent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("new").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  convertedToClient: boolean("converted_to_client").default(false),
});

// New Analytics Schemas
export const inventoryLevels = pgTable("inventory_levels", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  warehouseLocation: text("warehouse_location").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  minimumLevel: integer("minimum_level").default(0),
  maximumLevel: integer("maximum_level"),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier").notNull(),
  shipDate: timestamp("ship_date").defaultNow().notNull(),
  deliveryDate: timestamp("delivery_date"),
  status: text("status").default("processing").notNull(),
  weight: real("weight"),
  cost: real("cost"),
  destination: text("destination").notNull(),
  serviceLevel: text("service_level"),
});

export const orderStatistics = pgTable("order_statistics", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  date: date("date").notNull(),
  ordersReceived: integer("orders_received").default(0),
  ordersProcessed: integer("orders_processed").default(0),
  ordersFulfilled: integer("orders_fulfilled").default(0),
  averageProcessingTime: real("average_processing_time"),
  totalValue: real("total_value").default(0),
});

export const clientKpis = pgTable("client_kpis", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  month: date("month").notNull(),
  shippingAccuracy: real("shipping_accuracy"),
  inventoryAccuracy: real("inventory_accuracy"),
  onTimeDelivery: real("on_time_delivery"),
  returnRate: real("return_rate"),
  averageOrderValue: real("average_order_value"),
  totalOrders: integer("total_orders"),
  customerSatisfaction: real("customer_satisfaction"),
});

export const dashboardSettings = pgTable("dashboard_settings", {
  userId: integer("user_id").references(() => users.id).notNull(),
  widgetId: text("widget_id").notNull(),
  position: integer("position").notNull(),
  visible: boolean("visible").default(true).notNull(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.widgetId] })
  }
});

// Create insert schemas
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
  status: true,
  assignedTo: true,
  convertedToClient: true,
});

export const insertInventoryLevelSchema = createInsertSchema(inventoryLevels).omit({
  id: true,
  updatedAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  shipDate: true,
});

export const insertOrderStatisticsSchema = createInsertSchema(orderStatistics).omit({
  id: true,
});

export const insertClientKpisSchema = createInsertSchema(clientKpis).omit({
  id: true,
});

export const insertDashboardSettingsSchema = createInsertSchema(dashboardSettings).omit({
  createdAt: true,
  updatedAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;

export type InsertInventoryLevel = z.infer<typeof insertInventoryLevelSchema>;
export type InventoryLevel = typeof inventoryLevels.$inferSelect;

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;

export type InsertOrderStatistic = z.infer<typeof insertOrderStatisticsSchema>;
export type OrderStatistic = typeof orderStatistics.$inferSelect;

export type InsertClientKpi = z.infer<typeof insertClientKpisSchema>;
export type ClientKpi = typeof clientKpis.$inferSelect;

export type InsertDashboardSetting = z.infer<typeof insertDashboardSettingsSchema>;
export type DashboardSetting = typeof dashboardSettings.$inferSelect;

// Employee Portal Tables
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  hireDate: date("hire_date").notNull(),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  quoteNumber: text("quote_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientCompany: text("client_company").notNull(),
  servicesQuoted: jsonb("services_quoted").notNull(),
  pricingData: jsonb("pricing_data").notNull(),
  totalAmount: real("total_amount"),
  status: text("status").default("draft").notNull(),
  validUntil: date("valid_until"),
  createdBy: integer("created_by").references(() => employees.id),
  assignedTo: integer("assigned_to").references(() => employees.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  hubspotDealId: text("hubspot_deal_id"),
  notes: text("notes"),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id),
  contractNumber: text("contract_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  contractType: text("contract_type").notNull(),
  status: text("status").default("pending").notNull(),
  docusignEnvelopeId: text("docusign_envelope_id"),
  supabaseFilePath: text("supabase_file_path"),
  signedDate: timestamp("signed_date"),
  expiresDate: date("expires_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  vendorName: text("vendor_name").notNull(),
  vendorCode: text("vendor_code").notNull().unique(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  paymentTerms: text("payment_terms"),
  deliveryTerms: text("delivery_terms"),
  isActive: boolean("is_active").default(true),
  rating: integer("rating").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  materialCode: text("material_code").notNull().unique(),
  materialName: text("material_name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  unitOfMeasure: text("unit_of_measure").notNull(),
  currentStock: integer("current_stock").default(0),
  minimumStock: integer("minimum_stock").default(0),
  maximumStock: integer("maximum_stock"),
  reorderPoint: integer("reorder_point").default(0),
  standardCost: real("standard_cost"),
  lastPurchaseCost: real("last_purchase_cost"),
  preferredVendorId: integer("preferred_vendor_id").references(() => vendors.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: text("status").default("pending").notNull(),
  totalAmount: real("total_amount"),
  createdBy: integer("created_by").references(() => employees.id),
  approvedBy: integer("approved_by").references(() => employees.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
  materialId: integer("material_id").references(() => materials.id),
  quantity: integer("quantity").notNull(),
  unitCost: real("unit_cost").notNull(),
  totalCost: real("total_cost").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hubspotSyncLog = pgTable("hubspot_sync_log", {
  id: serial("id").primaryKey(),
  recordType: text("record_type").notNull(),
  recordId: integer("record_id").notNull(),
  hubspotId: text("hubspot_id"),
  syncAction: text("sync_action").notNull(),
  syncStatus: text("sync_status").notNull(),
  errorMessage: text("error_message"),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertHubspotSyncLogSchema = createInsertSchema(hubspotSyncLog).omit({
  id: true,
  syncedAt: true,
});

// Export types for Employee Portal
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

export type HubspotSyncLog = typeof hubspotSyncLog.$inferSelect;
export type InsertHubspotSyncLog = z.infer<typeof insertHubspotSyncLogSchema>;
