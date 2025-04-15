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
  message: text("message").notNull(),
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
