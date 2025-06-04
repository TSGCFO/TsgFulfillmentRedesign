// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  quoteRequests;
  inventoryLevels;
  shipments;
  orderStatistics;
  clientKpis;
  dashboardSettings;
  currentId;
  quoteRequestId;
  inventoryLevelId;
  shipmentId;
  orderStatisticId;
  clientKpiId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.quoteRequests = /* @__PURE__ */ new Map();
    this.inventoryLevels = /* @__PURE__ */ new Map();
    this.shipments = /* @__PURE__ */ new Map();
    this.orderStatistics = /* @__PURE__ */ new Map();
    this.clientKpis = /* @__PURE__ */ new Map();
    this.dashboardSettings = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.quoteRequestId = 1;
    this.inventoryLevelId = 1;
    this.shipmentId = 1;
    this.orderStatisticId = 1;
    this.clientKpiId = 1;
    this.createUser({
      username: "admin",
      password: "admin123",
      role: "admin"
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const user = {
      ...insertUser,
      id,
      createdAt,
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, userData) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Quote request methods
  async createQuoteRequest(insertQuoteRequest) {
    const id = this.quoteRequestId++;
    const createdAt = /* @__PURE__ */ new Date();
    const quoteRequest = {
      ...insertQuoteRequest,
      id,
      createdAt,
      status: "new",
      assignedTo: null,
      convertedToClient: false
    };
    this.quoteRequests.set(id, quoteRequest);
    return quoteRequest;
  }
  async getQuoteRequests() {
    return Array.from(this.quoteRequests.values());
  }
  async getQuoteRequest(id) {
    return this.quoteRequests.get(id);
  }
  async updateQuoteRequest(id, data) {
    const quoteRequest = await this.getQuoteRequest(id);
    if (!quoteRequest) return void 0;
    const updatedRequest = { ...quoteRequest, ...data };
    this.quoteRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  // Inventory methods
  async createInventoryLevel(data) {
    const id = this.inventoryLevelId++;
    const updatedAt = /* @__PURE__ */ new Date();
    const inventoryLevel = {
      ...data,
      id,
      updatedAt
    };
    this.inventoryLevels.set(id, inventoryLevel);
    return inventoryLevel;
  }
  async getInventoryLevels(clientId) {
    if (clientId) {
      return Array.from(this.inventoryLevels.values()).filter((level) => level.clientId === clientId);
    }
    return Array.from(this.inventoryLevels.values());
  }
  async getInventoryLevel(id) {
    return this.inventoryLevels.get(id);
  }
  async updateInventoryLevel(id, data) {
    const level = await this.getInventoryLevel(id);
    if (!level) return void 0;
    const updatedLevel = {
      ...level,
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.inventoryLevels.set(id, updatedLevel);
    return updatedLevel;
  }
  // Shipment methods
  async createShipment(data) {
    const id = this.shipmentId++;
    const shipDate = /* @__PURE__ */ new Date();
    const shipment = {
      ...data,
      id,
      shipDate,
      status: "processing"
    };
    this.shipments.set(id, shipment);
    return shipment;
  }
  async getShipments(clientId) {
    if (clientId) {
      return Array.from(this.shipments.values()).filter((shipment) => shipment.clientId === clientId);
    }
    return Array.from(this.shipments.values());
  }
  async getShipment(id) {
    return this.shipments.get(id);
  }
  async updateShipment(id, data) {
    const shipment = await this.getShipment(id);
    if (!shipment) return void 0;
    const updatedShipment = { ...shipment, ...data };
    this.shipments.set(id, updatedShipment);
    return updatedShipment;
  }
  // Order statistics methods
  async createOrderStatistic(data) {
    const id = this.orderStatisticId++;
    const statistic = {
      ...data,
      id
    };
    this.orderStatistics.set(id, statistic);
    return statistic;
  }
  async getOrderStatistics(clientId, startDate, endDate) {
    let statistics = Array.from(this.orderStatistics.values());
    if (clientId) {
      statistics = statistics.filter((stat) => stat.clientId === clientId);
    }
    if (startDate) {
      statistics = statistics.filter((stat) => new Date(stat.date) >= startDate);
    }
    if (endDate) {
      statistics = statistics.filter((stat) => new Date(stat.date) <= endDate);
    }
    return statistics;
  }
  async getOrderStatistic(id) {
    return this.orderStatistics.get(id);
  }
  async updateOrderStatistic(id, data) {
    const statistic = await this.getOrderStatistic(id);
    if (!statistic) return void 0;
    const updatedStatistic = { ...statistic, ...data };
    this.orderStatistics.set(id, updatedStatistic);
    return updatedStatistic;
  }
  // Client KPI methods
  async createClientKpi(data) {
    const id = this.clientKpiId++;
    const kpi = {
      ...data,
      id
    };
    this.clientKpis.set(id, kpi);
    return kpi;
  }
  async getClientKpis(clientId, startDate, endDate) {
    let kpis = Array.from(this.clientKpis.values());
    if (clientId) {
      kpis = kpis.filter((kpi) => kpi.clientId === clientId);
    }
    if (startDate) {
      kpis = kpis.filter((kpi) => new Date(kpi.month) >= startDate);
    }
    if (endDate) {
      kpis = kpis.filter((kpi) => new Date(kpi.month) <= endDate);
    }
    return kpis;
  }
  async getClientKpi(id) {
    return this.clientKpis.get(id);
  }
  async updateClientKpi(id, data) {
    const kpi = await this.getClientKpi(id);
    if (!kpi) return void 0;
    const updatedKpi = { ...kpi, ...data };
    this.clientKpis.set(id, updatedKpi);
    return updatedKpi;
  }
  // Dashboard settings methods
  async saveDashboardSetting(data) {
    const key = `${data.userId}_${data.widgetId}`;
    const now = /* @__PURE__ */ new Date();
    const setting = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.dashboardSettings.set(key, setting);
    return setting;
  }
  async getDashboardSettings(userId) {
    return Array.from(this.dashboardSettings.values()).filter((setting) => setting.userId === userId);
  }
  async updateDashboardSetting(userId, widgetId, data) {
    const key = `${userId}_${widgetId}`;
    const setting = this.dashboardSettings.get(key);
    if (!setting) return void 0;
    const updatedSetting = {
      ...setting,
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.dashboardSettings.set(key, updatedSetting);
    return updatedSetting;
  }
  // Analytics specific methods
  async getClientAnalyticsSummary(clientId) {
    const shipments2 = await this.getShipments(clientId);
    const inventoryLevels2 = await this.getInventoryLevels(clientId);
    const orderStats = await this.getOrderStatistics(clientId);
    const kpis = await this.getClientKpis(clientId);
    const totalShipments = shipments2.length;
    const completedShipments = shipments2.filter((s) => s.status === "delivered").length;
    const totalInventoryItems = inventoryLevels2.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventoryLevels2.filter((item) => item.quantity <= item.minimumLevel).length;
    const totalOrders = orderStats.reduce((sum, stat) => sum + stat.ordersReceived, 0);
    const ordersProcessed = orderStats.reduce((sum, stat) => sum + stat.ordersProcessed, 0);
    const ordersFulfilled = orderStats.reduce((sum, stat) => sum + stat.ordersFulfilled, 0);
    const latestKpi = kpis.sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
    )[0] || null;
    return {
      shipmentSummary: {
        total: totalShipments,
        completed: completedShipments,
        inProgress: totalShipments - completedShipments,
        completionRate: totalShipments ? completedShipments / totalShipments * 100 : 0
      },
      inventorySummary: {
        totalItems: totalInventoryItems,
        lowStock: lowStockItems,
        lowStockPercentage: totalInventoryItems ? lowStockItems / inventoryLevels2.length * 100 : 0
      },
      orderSummary: {
        total: totalOrders,
        processed: ordersProcessed,
        fulfilled: ordersFulfilled,
        fulfillmentRate: totalOrders ? ordersFulfilled / totalOrders * 100 : 0
      },
      performance: latestKpi ? {
        shippingAccuracy: latestKpi.shippingAccuracy,
        inventoryAccuracy: latestKpi.inventoryAccuracy,
        onTimeDelivery: latestKpi.onTimeDelivery,
        returnRate: latestKpi.returnRate,
        customerSatisfaction: latestKpi.customerSatisfaction
      } : null
    };
  }
  async getShippingPerformance(clientId, startDate, endDate) {
    let shipments2 = await this.getShipments(clientId);
    if (startDate) {
      shipments2 = shipments2.filter((s) => s.shipDate >= startDate);
    }
    if (endDate) {
      shipments2 = shipments2.filter((s) => s.shipDate <= endDate);
    }
    const byCarrier = {};
    const byStatus = {};
    const deliveryTimes = [];
    for (const shipment of shipments2) {
      byCarrier[shipment.carrier] = (byCarrier[shipment.carrier] || 0) + 1;
      byStatus[shipment.status] = (byStatus[shipment.status] || 0) + 1;
      if (shipment.status === "delivered" && shipment.deliveryDate) {
        const deliveryTime = new Date(shipment.deliveryDate).getTime() - new Date(shipment.shipDate).getTime();
        deliveryTimes.push(deliveryTime / (1e3 * 60 * 60 * 24));
      }
    }
    const avgDeliveryTime = deliveryTimes.length ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length : null;
    return {
      totalShipments: shipments2.length,
      byCarrier,
      byStatus,
      deliveryPerformance: {
        averageDeliveryTime: avgDeliveryTime,
        minimumTime: Math.min(...deliveryTimes),
        maximumTime: Math.max(...deliveryTimes)
      }
    };
  }
  async getInventoryReport(clientId) {
    const inventoryLevels2 = await this.getInventoryLevels(clientId);
    const byLocation = {};
    let totalItems = 0;
    let lowStockItems = 0;
    let optimalItems = 0;
    let overstockItems = 0;
    for (const item of inventoryLevels2) {
      byLocation[item.warehouseLocation] = (byLocation[item.warehouseLocation] || 0) + item.quantity;
      totalItems += item.quantity;
      if (item.quantity <= item.minimumLevel) {
        lowStockItems++;
      } else if (item.maximumLevel && item.quantity >= item.maximumLevel) {
        overstockItems++;
      } else {
        optimalItems++;
      }
    }
    return {
      totalUniqueItems: inventoryLevels2.length,
      totalQuantity: totalItems,
      inventoryHealth: {
        lowStock: lowStockItems,
        optimal: optimalItems,
        overstock: overstockItems
      },
      byLocation
    };
  }
  async getReportData(clientId, reportType, startDate, endDate) {
    let data = {};
    if (reportType === "inventory") {
      const inventoryReport = await this.getInventoryReport(clientId);
      data = {
        summary: {
          totalItems: inventoryReport.totalQuantity,
          totalValue: Math.round(inventoryReport.totalQuantity * 35.2),
          // Sample value calculation
          criticalAlerts: inventoryReport.inventoryHealth.lowStock,
          recommendations: inventoryReport.inventoryHealth.lowStock > 0 ? inventoryReport.inventoryHealth.lowStock + 5 : 0
        }
      };
    } else if (reportType === "shipment") {
      const shipments2 = await this.getShipments(clientId);
      const filteredShipments = shipments2.filter(
        (shipment) => shipment.shipDate >= startDate && shipment.shipDate <= endDate
      );
      data = {
        summary: {
          totalItems: filteredShipments.length,
          totalValue: Math.round(filteredShipments.reduce((sum, s) => sum + (s.cost || 0), 0)),
          criticalAlerts: filteredShipments.filter((s) => s.status === "delayed").length,
          recommendations: 3
        }
      };
    } else if (reportType === "order") {
      const orderStats = await this.getOrderStatistics(clientId, startDate, endDate);
      data = {
        summary: {
          totalItems: orderStats.reduce((sum, stat) => sum + (stat.ordersReceived || 0), 0),
          totalValue: Math.round(orderStats.reduce((sum, stat) => sum + (stat.totalValue || 0), 0)),
          criticalAlerts: 2,
          recommendations: 8
        }
      };
    } else if (reportType === "performance") {
      const kpis = await this.getClientKpis(clientId);
      data = {
        summary: {
          totalItems: kpis.length,
          totalValue: 0,
          criticalAlerts: kpis.filter(
            (kpi) => (kpi.onTimeDelivery || 100) < 90 || (kpi.shippingAccuracy || 100) < 95
          ).length,
          recommendations: 5
        }
      };
    }
    return data;
  }
  async getComparisonData(clientId, periodAStart, periodAEnd, periodBStart, periodBEnd, metric) {
    const data = {
      summaries: [
        {
          title: "Shipment Performance",
          metrics: [
            {
              key: "totalShipments",
              name: "Total Shipments",
              periodA: 245,
              periodB: 312,
              change: 67,
              changePercentage: 27.35,
              trend: "up"
            },
            {
              key: "averageDeliveryTime",
              name: "Avg. Delivery Time",
              periodA: 3.8,
              periodB: 2.9,
              change: -0.9,
              changePercentage: -23.68,
              unit: "days",
              trend: "down"
            },
            {
              key: "onTimeDelivery",
              name: "On-Time Delivery",
              periodA: 92.1,
              periodB: 95.7,
              change: 3.6,
              changePercentage: 3.91,
              unit: "%",
              trend: "up"
            },
            {
              key: "shippingAccuracy",
              name: "Shipping Accuracy",
              periodA: 98.2,
              periodB: 99.1,
              change: 0.9,
              changePercentage: 0.92,
              unit: "%",
              trend: "up"
            }
          ]
        },
        {
          title: "Inventory Management",
          metrics: [
            {
              key: "stockLevels",
              name: "Avg. Stock Levels",
              periodA: 5280,
              periodB: 6120,
              change: 840,
              changePercentage: 15.91,
              trend: "up"
            },
            {
              key: "stockTurnover",
              name: "Stock Turnover Rate",
              periodA: 4.2,
              periodB: 4.8,
              change: 0.6,
              changePercentage: 14.29,
              trend: "up"
            },
            {
              key: "lowStockOccurrences",
              name: "Low Stock Occurrences",
              periodA: 18,
              periodB: 12,
              change: -6,
              changePercentage: -33.33,
              trend: "down"
            }
          ]
        },
        {
          title: "Order Processing",
          metrics: [
            {
              key: "totalOrders",
              name: "Total Orders",
              periodA: 318,
              periodB: 402,
              change: 84,
              changePercentage: 26.42,
              trend: "up"
            },
            {
              key: "processingTime",
              name: "Avg. Processing Time",
              periodA: 1.6,
              periodB: 1.2,
              change: -0.4,
              changePercentage: -25,
              unit: "days",
              trend: "down"
            },
            {
              key: "fulfillmentRate",
              name: "Fulfillment Rate",
              periodA: 94.3,
              periodB: 96.8,
              change: 2.5,
              changePercentage: 2.65,
              unit: "%",
              trend: "up"
            }
          ]
        }
      ],
      charts: {
        dailyMetrics: [
          { date: "2025-03-15", periodA: 12, periodB: 18 },
          { date: "2025-03-16", periodA: 15, periodB: 20 },
          { date: "2025-03-17", periodA: 13, periodB: 22 },
          { date: "2025-03-18", periodA: 17, periodB: 19 },
          { date: "2025-03-19", periodA: 14, periodB: 23 },
          { date: "2025-03-20", periodA: 16, periodB: 25 },
          { date: "2025-03-21", periodA: 19, periodB: 21 }
        ]
      }
    };
    return data;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true
});
var quoteRequests = pgTable("quote_requests", {
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
  convertedToClient: boolean("converted_to_client").default(false)
});
var inventoryLevels = pgTable("inventory_levels", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  warehouseLocation: text("warehouse_location").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  minimumLevel: integer("minimum_level").default(0),
  maximumLevel: integer("maximum_level")
});
var shipments = pgTable("shipments", {
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
  serviceLevel: text("service_level")
});
var orderStatistics = pgTable("order_statistics", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  date: date("date").notNull(),
  ordersReceived: integer("orders_received").default(0),
  ordersProcessed: integer("orders_processed").default(0),
  ordersFulfilled: integer("orders_fulfilled").default(0),
  averageProcessingTime: real("average_processing_time"),
  totalValue: real("total_value").default(0)
});
var clientKpis = pgTable("client_kpis", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  month: date("month").notNull(),
  shippingAccuracy: real("shipping_accuracy"),
  inventoryAccuracy: real("inventory_accuracy"),
  onTimeDelivery: real("on_time_delivery"),
  returnRate: real("return_rate"),
  averageOrderValue: real("average_order_value"),
  totalOrders: integer("total_orders"),
  customerSatisfaction: real("customer_satisfaction")
});
var dashboardSettings = pgTable("dashboard_settings", {
  userId: integer("user_id").references(() => users.id).notNull(),
  widgetId: text("widget_id").notNull(),
  position: integer("position").notNull(),
  visible: boolean("visible").default(true).notNull(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.widgetId] })
  };
});
var insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
  status: true,
  assignedTo: true,
  convertedToClient: true
});
var insertInventoryLevelSchema = createInsertSchema(inventoryLevels).omit({
  id: true,
  updatedAt: true
});
var insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  shipDate: true
});
var insertOrderStatisticsSchema = createInsertSchema(orderStatistics).omit({
  id: true
});
var insertClientKpisSchema = createInsertSchema(clientKpis).omit({
  id: true
});
var insertDashboardSettingsSchema = createInsertSchema(dashboardSettings).omit({
  createdAt: true,
  updatedAt: true
});

// server/routes.ts
var handleError = (res, error, message = "An error occurred") => {
  console.error(`Error: ${message}`, error);
  res.status(400).json({
    message,
    error: error instanceof Error ? error.message : "Unknown error"
  });
};
async function registerRoutes(app2) {
  app2.post("/api/quote-requests", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      res.status(200).json({
        message: "Quote request received successfully",
        data: quoteRequest
      });
    } catch (error) {
      handleError(res, error, "Invalid quote request data");
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      console.log("Contact form submission:", req.body);
      res.status(200).json({
        message: "Contact form submitted successfully"
      });
    } catch (error) {
      handleError(res, error, "Error processing contact form");
    }
  });
  app2.post("/api/quote", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      res.status(200).json({
        message: "Quote request received successfully",
        data: quoteRequest
      });
    } catch (error) {
      handleError(res, error, "Invalid quote request data");
    }
  });
  app2.get("/api/quote", async (req, res) => {
    try {
      const quoteRequests2 = await storage.getQuoteRequests();
      res.status(200).json({ data: quoteRequests2 });
    } catch (error) {
      handleError(res, error, "Error retrieving quote requests");
    }
  });
  app2.get("/api/quote/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quoteRequest = await storage.getQuoteRequest(id);
      if (!quoteRequest) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      res.status(200).json({ data: quoteRequest });
    } catch (error) {
      handleError(res, error, "Error retrieving quote request");
    }
  });
  app2.patch("/api/quote/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedQuoteRequest = await storage.updateQuoteRequest(id, req.body);
      if (!updatedQuoteRequest) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      res.status(200).json({
        message: "Quote request updated successfully",
        data: updatedQuoteRequest
      });
    } catch (error) {
      handleError(res, error, "Error updating quote request");
    }
  });
  app2.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventoryLevelSchema.parse(req.body);
      const inventoryLevel = await storage.createInventoryLevel(validatedData);
      res.status(200).json({
        message: "Inventory level created successfully",
        data: inventoryLevel
      });
    } catch (error) {
      handleError(res, error, "Invalid inventory level data");
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const inventoryLevels2 = await storage.getInventoryLevels(clientId);
      res.status(200).json({ data: inventoryLevels2 });
    } catch (error) {
      handleError(res, error, "Error retrieving inventory levels");
    }
  });
  app2.get("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inventoryLevel = await storage.getInventoryLevel(id);
      if (!inventoryLevel) {
        return res.status(404).json({ message: "Inventory level not found" });
      }
      res.status(200).json({ data: inventoryLevel });
    } catch (error) {
      handleError(res, error, "Error retrieving inventory level");
    }
  });
  app2.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedInventoryLevel = await storage.updateInventoryLevel(id, req.body);
      if (!updatedInventoryLevel) {
        return res.status(404).json({ message: "Inventory level not found" });
      }
      res.status(200).json({
        message: "Inventory level updated successfully",
        data: updatedInventoryLevel
      });
    } catch (error) {
      handleError(res, error, "Error updating inventory level");
    }
  });
  app2.post("/api/shipments", async (req, res) => {
    try {
      const validatedData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validatedData);
      res.status(200).json({
        message: "Shipment created successfully",
        data: shipment
      });
    } catch (error) {
      handleError(res, error, "Invalid shipment data");
    }
  });
  app2.get("/api/shipments", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const shipments2 = await storage.getShipments(clientId);
      res.status(200).json({ data: shipments2 });
    } catch (error) {
      handleError(res, error, "Error retrieving shipments");
    }
  });
  app2.get("/api/shipments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shipment = await storage.getShipment(id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.status(200).json({ data: shipment });
    } catch (error) {
      handleError(res, error, "Error retrieving shipment");
    }
  });
  app2.patch("/api/shipments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedShipment = await storage.updateShipment(id, req.body);
      if (!updatedShipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.status(200).json({
        message: "Shipment updated successfully",
        data: updatedShipment
      });
    } catch (error) {
      handleError(res, error, "Error updating shipment");
    }
  });
  app2.post("/api/order-statistics", async (req, res) => {
    try {
      const validatedData = insertOrderStatisticsSchema.parse(req.body);
      const orderStatistic = await storage.createOrderStatistic(validatedData);
      res.status(200).json({
        message: "Order statistics created successfully",
        data: orderStatistic
      });
    } catch (error) {
      handleError(res, error, "Invalid order statistics data");
    }
  });
  app2.get("/api/order-statistics", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const orderStatistics2 = await storage.getOrderStatistics(clientId, startDate, endDate);
      res.status(200).json({ data: orderStatistics2 });
    } catch (error) {
      handleError(res, error, "Error retrieving order statistics");
    }
  });
  app2.patch("/api/order-statistics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedStatistic = await storage.updateOrderStatistic(id, req.body);
      if (!updatedStatistic) {
        return res.status(404).json({ message: "Order statistic not found" });
      }
      res.status(200).json({
        message: "Order statistic updated successfully",
        data: updatedStatistic
      });
    } catch (error) {
      handleError(res, error, "Error updating order statistic");
    }
  });
  app2.post("/api/client-kpis", async (req, res) => {
    try {
      const validatedData = insertClientKpisSchema.parse(req.body);
      const clientKpi = await storage.createClientKpi(validatedData);
      res.status(200).json({
        message: "Client KPI created successfully",
        data: clientKpi
      });
    } catch (error) {
      handleError(res, error, "Invalid client KPI data");
    }
  });
  app2.get("/api/client-kpis", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const clientKpis2 = await storage.getClientKpis(clientId, startDate, endDate);
      res.status(200).json({ data: clientKpis2 });
    } catch (error) {
      handleError(res, error, "Error retrieving client KPIs");
    }
  });
  app2.patch("/api/client-kpis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedKpi = await storage.updateClientKpi(id, req.body);
      if (!updatedKpi) {
        return res.status(404).json({ message: "Client KPI not found" });
      }
      res.status(200).json({
        message: "Client KPI updated successfully",
        data: updatedKpi
      });
    } catch (error) {
      handleError(res, error, "Error updating client KPI");
    }
  });
  app2.post("/api/dashboard-settings", async (req, res) => {
    try {
      const validatedData = insertDashboardSettingsSchema.parse(req.body);
      const dashboardSetting = await storage.saveDashboardSetting(validatedData);
      res.status(200).json({
        message: "Dashboard setting saved successfully",
        data: dashboardSetting
      });
    } catch (error) {
      handleError(res, error, "Invalid dashboard setting data");
    }
  });
  app2.get("/api/dashboard-settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const dashboardSettings2 = await storage.getDashboardSettings(userId);
      res.status(200).json({ data: dashboardSettings2 });
    } catch (error) {
      handleError(res, error, "Error retrieving dashboard settings");
    }
  });
  app2.patch("/api/dashboard-settings/:userId/:widgetId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const widgetId = req.params.widgetId;
      const updatedSetting = await storage.updateDashboardSetting(userId, widgetId, req.body);
      if (!updatedSetting) {
        return res.status(404).json({ message: "Dashboard setting not found" });
      }
      res.status(200).json({
        message: "Dashboard setting updated successfully",
        data: updatedSetting
      });
    } catch (error) {
      handleError(res, error, "Error updating dashboard setting");
    }
  });
  app2.get("/api/analytics/client-summary/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const analyticsSummary = await storage.getClientAnalyticsSummary(clientId);
      res.status(200).json({ data: analyticsSummary });
    } catch (error) {
      handleError(res, error, "Error retrieving client analytics summary");
    }
  });
  app2.get("/api/analytics/shipping-performance", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const shippingPerformance = await storage.getShippingPerformance(clientId, startDate, endDate);
      res.status(200).json({ data: shippingPerformance });
    } catch (error) {
      handleError(res, error, "Error retrieving shipping performance");
    }
  });
  app2.get("/api/analytics/inventory-report", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const inventoryReport = await storage.getInventoryReport(clientId);
      res.status(200).json({ data: inventoryReport });
    } catch (error) {
      handleError(res, error, "Error retrieving inventory report");
    }
  });
  app2.get("/api/analytics/report-data", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      const reportType = req.query.reportType;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      if (!clientId || !reportType || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      const reportData = await storage.getReportData(clientId, reportType, startDate, endDate);
      res.status(200).json({ data: reportData });
    } catch (error) {
      handleError(res, error, "Error retrieving report data");
    }
  });
  app2.get("/api/analytics/comparison", async (req, res) => {
    try {
      const { clientId, periodAStart, periodAEnd, periodBStart, periodBEnd, metric } = req.query;
      if (!clientId || !periodAStart || !periodAEnd || !periodBStart || !periodBEnd || !metric) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      const clientIdNum = parseInt(clientId);
      const comparisonData = await storage.getComparisonData(
        clientIdNum,
        new Date(periodAStart),
        new Date(periodAEnd),
        new Date(periodBStart),
        new Date(periodBEnd),
        metric
      );
      res.status(200).json({ data: comparisonData });
    } catch (error) {
      handleError(res, error, "Error retrieving comparison data");
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/seed-data.ts
async function seedAnalyticsData() {
  console.log("Seeding analytics data...");
  const admin = await storage.getUserByUsername("admin");
  if (!admin) {
    console.log("Creating admin user for sample data...");
    await storage.createUser({
      username: "admin",
      password: "admin123",
      role: "admin"
    });
  }
  const existingInventory = await storage.getInventoryLevels();
  if (existingInventory.length > 0) {
    console.log("Analytics data already exists, skipping seed");
    return;
  }
  const clientId = 1;
  const inventoryItems = [
    { clientId, productId: 1001, quantity: 150, warehouseLocation: "Warehouse A", minimumLevel: 20, maximumLevel: 200 },
    { clientId, productId: 1002, quantity: 75, warehouseLocation: "Warehouse B", minimumLevel: 15, maximumLevel: 100 },
    { clientId, productId: 1003, quantity: 5, warehouseLocation: "Warehouse A", minimumLevel: 10, maximumLevel: 50 },
    { clientId, productId: 1004, quantity: 0, warehouseLocation: "Warehouse C", minimumLevel: 5, maximumLevel: 30 },
    { clientId, productId: 1005, quantity: 35, warehouseLocation: "Warehouse B", minimumLevel: 10, maximumLevel: 40 },
    { clientId, productId: 1006, quantity: 120, warehouseLocation: "Warehouse A", minimumLevel: 20, maximumLevel: 150 },
    { clientId, productId: 1007, quantity: 8, warehouseLocation: "Warehouse C", minimumLevel: 12, maximumLevel: 60 },
    { clientId, productId: 1008, quantity: 200, warehouseLocation: "Warehouse A", minimumLevel: 50, maximumLevel: 250 },
    { clientId, productId: 1009, quantity: 45, warehouseLocation: "Warehouse B", minimumLevel: 20, maximumLevel: 80 },
    { clientId, productId: 1010, quantity: 60, warehouseLocation: "Warehouse C", minimumLevel: 15, maximumLevel: 100 }
  ];
  console.log("Seeding inventory data...");
  for (const item of inventoryItems) {
    await storage.createInventoryLevel(item);
  }
  const shipments2 = [
    {
      clientId,
      trackingNumber: "TRK-1001",
      carrier: "FedEx",
      destination: "New York, NY",
      status: "delivered",
      deliveryDate: /* @__PURE__ */ new Date("2025-04-10"),
      weight: 5.2,
      cost: 25.99,
      serviceLevel: "Priority"
    },
    {
      clientId,
      trackingNumber: "TRK-1002",
      carrier: "UPS",
      destination: "Los Angeles, CA",
      status: "delivered",
      deliveryDate: /* @__PURE__ */ new Date("2025-04-09"),
      weight: 3.7,
      cost: 18.5,
      serviceLevel: "Ground"
    },
    {
      clientId,
      trackingNumber: "TRK-1003",
      carrier: "USPS",
      destination: "Chicago, IL",
      status: "delivered",
      deliveryDate: /* @__PURE__ */ new Date("2025-04-08"),
      weight: 2.1,
      cost: 12.75,
      serviceLevel: "First Class"
    },
    {
      clientId,
      trackingNumber: "TRK-1004",
      carrier: "DHL",
      destination: "Houston, TX",
      status: "in-transit",
      weight: 6.8,
      cost: 32.25,
      serviceLevel: "Express"
    },
    {
      clientId,
      trackingNumber: "TRK-1005",
      carrier: "FedEx",
      destination: "Miami, FL",
      status: "processing",
      weight: 4.3,
      cost: 22.99,
      serviceLevel: "Standard"
    }
  ];
  console.log("Seeding shipment data...");
  for (const shipment of shipments2) {
    await storage.createShipment(shipment);
  }
  const orderStats = [
    {
      clientId,
      date: "2025-04-01",
      ordersReceived: 45,
      ordersProcessed: 42,
      ordersFulfilled: 40,
      averageProcessingTime: 1.2,
      totalValue: 3250.75
    },
    {
      clientId,
      date: "2025-04-02",
      ordersReceived: 52,
      ordersProcessed: 50,
      ordersFulfilled: 48,
      averageProcessingTime: 1.3,
      totalValue: 3845.25
    },
    {
      clientId,
      date: "2025-04-03",
      ordersReceived: 48,
      ordersProcessed: 46,
      ordersFulfilled: 45,
      averageProcessingTime: 1.1,
      totalValue: 3562.5
    },
    {
      clientId,
      date: "2025-04-04",
      ordersReceived: 55,
      ordersProcessed: 53,
      ordersFulfilled: 51,
      averageProcessingTime: 1.2,
      totalValue: 4125.99
    },
    {
      clientId,
      date: "2025-04-05",
      ordersReceived: 42,
      ordersProcessed: 40,
      ordersFulfilled: 38,
      averageProcessingTime: 1.4,
      totalValue: 3050.25
    },
    {
      clientId,
      date: "2025-04-06",
      ordersReceived: 38,
      ordersProcessed: 36,
      ordersFulfilled: 35,
      averageProcessingTime: 1.2,
      totalValue: 2850.75
    },
    {
      clientId,
      date: "2025-04-07",
      ordersReceived: 44,
      ordersProcessed: 42,
      ordersFulfilled: 41,
      averageProcessingTime: 1.3,
      totalValue: 3325.5
    },
    {
      clientId,
      date: "2025-04-08",
      ordersReceived: 49,
      ordersProcessed: 47,
      ordersFulfilled: 46,
      averageProcessingTime: 1.2,
      totalValue: 3725.25
    },
    {
      clientId,
      date: "2025-04-09",
      ordersReceived: 53,
      ordersProcessed: 51,
      ordersFulfilled: 49,
      averageProcessingTime: 1.3,
      totalValue: 3950.99
    },
    {
      clientId,
      date: "2025-04-10",
      ordersReceived: 47,
      ordersProcessed: 45,
      ordersFulfilled: 43,
      averageProcessingTime: 1.1,
      totalValue: 3500.25
    }
  ];
  console.log("Seeding order statistics...");
  for (const stat of orderStats) {
    await storage.createOrderStatistic(stat);
  }
  const kpiData = [
    {
      clientId,
      month: "2025-01-01",
      shippingAccuracy: 98.5,
      inventoryAccuracy: 97.2,
      onTimeDelivery: 95.8,
      returnRate: 3.2,
      averageOrderValue: 75.25,
      totalOrders: 1450,
      customerSatisfaction: 4.6
    },
    {
      clientId,
      month: "2025-02-01",
      shippingAccuracy: 98.7,
      inventoryAccuracy: 97.5,
      onTimeDelivery: 96.2,
      returnRate: 2.9,
      averageOrderValue: 76.5,
      totalOrders: 1525,
      customerSatisfaction: 4.7
    },
    {
      clientId,
      month: "2025-03-01",
      shippingAccuracy: 99.1,
      inventoryAccuracy: 98,
      onTimeDelivery: 96.8,
      returnRate: 2.5,
      averageOrderValue: 78.75,
      totalOrders: 1600,
      customerSatisfaction: 4.7
    },
    {
      clientId,
      month: "2025-04-01",
      shippingAccuracy: 99.4,
      inventoryAccuracy: 98.7,
      onTimeDelivery: 97.2,
      returnRate: 2.3,
      averageOrderValue: 80.25,
      totalOrders: 1675,
      customerSatisfaction: 4.8
    }
  ];
  console.log("Seeding KPI data...");
  for (const kpi of kpiData) {
    await storage.createClientKpi(kpi);
  }
  const dashboardSettings2 = [
    {
      userId: 1,
      widgetId: "inventory-summary",
      position: 1,
      visible: true,
      settings: { showChart: true, chartType: "pie" }
    },
    {
      userId: 1,
      widgetId: "shipment-status",
      position: 2,
      visible: true,
      settings: { showChart: true, chartType: "bar" }
    },
    {
      userId: 1,
      widgetId: "order-trends",
      position: 3,
      visible: true,
      settings: { showChart: true, chartType: "line", timeRange: "7d" }
    },
    {
      userId: 1,
      widgetId: "performance-kpis",
      position: 4,
      visible: true,
      settings: { metrics: ["shipping_accuracy", "on_time_delivery", "return_rate"] }
    }
  ];
  console.log("Seeding dashboard settings...");
  for (const setting of dashboardSettings2) {
    await storage.saveDashboardSetting(setting);
  }
  console.log("Analytics data seeding complete!");
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  try {
    await seedAnalyticsData();
  } catch (error) {
    log(`Error seeding analytics data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
