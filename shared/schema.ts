import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["SuperAdmin", "Admin", "User"] }).default("User").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  username: true,
  email: true,
  password: true,
  role: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;

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

// Export types - User types already defined above

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
