import { 
  users, 
  type User, 
  type InsertUser, 
  type InsertQuoteRequest, 
  type QuoteRequest,
  type InsertInventoryLevel,
  type InventoryLevel,
  type InsertShipment,
  type Shipment,
  type InsertOrderStatistic,
  type OrderStatistic,
  type InsertClientKpi,
  type ClientKpi,
  type InsertDashboardSetting,
  type DashboardSetting 
} from "@shared/schema";

// Updated interface with all CRUD methods for analytics
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Quote request methods
  createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;
  
  // Inventory methods
  createInventoryLevel(data: InsertInventoryLevel): Promise<InventoryLevel>;
  getInventoryLevels(clientId?: number): Promise<InventoryLevel[]>;
  getInventoryLevel(id: number): Promise<InventoryLevel | undefined>;
  updateInventoryLevel(id: number, data: Partial<InventoryLevel>): Promise<InventoryLevel | undefined>;
  
  // Shipment methods
  createShipment(data: InsertShipment): Promise<Shipment>;
  getShipments(clientId?: number): Promise<Shipment[]>;
  getShipment(id: number): Promise<Shipment | undefined>;
  updateShipment(id: number, data: Partial<Shipment>): Promise<Shipment | undefined>;
  
  // Order statistics methods
  createOrderStatistic(data: InsertOrderStatistic): Promise<OrderStatistic>;
  getOrderStatistics(clientId?: number, startDate?: Date, endDate?: Date): Promise<OrderStatistic[]>;
  getOrderStatistic(id: number): Promise<OrderStatistic | undefined>;
  updateOrderStatistic(id: number, data: Partial<OrderStatistic>): Promise<OrderStatistic | undefined>;
  
  // Client KPI methods
  createClientKpi(data: InsertClientKpi): Promise<ClientKpi>;
  getClientKpis(clientId?: number, startDate?: Date, endDate?: Date): Promise<ClientKpi[]>;
  getClientKpi(id: number): Promise<ClientKpi | undefined>;
  updateClientKpi(id: number, data: Partial<ClientKpi>): Promise<ClientKpi | undefined>;
  
  // Dashboard settings methods
  saveDashboardSetting(data: InsertDashboardSetting): Promise<DashboardSetting>;
  getDashboardSettings(userId: number): Promise<DashboardSetting[]>;
  updateDashboardSetting(userId: number, widgetId: string, data: Partial<DashboardSetting>): Promise<DashboardSetting | undefined>;
  
  // Analytics specific methods
  getClientAnalyticsSummary(clientId: number): Promise<any>;
  getShippingPerformance(clientId?: number, startDate?: Date, endDate?: Date): Promise<any>;
  getInventoryReport(clientId?: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quoteRequests: Map<number, QuoteRequest>;
  private inventoryLevels: Map<number, InventoryLevel>;
  private shipments: Map<number, Shipment>;
  private orderStatistics: Map<number, OrderStatistic>;
  private clientKpis: Map<number, ClientKpi>;
  private dashboardSettings: Map<string, DashboardSetting>;
  
  currentId: number;
  quoteRequestId: number;
  inventoryLevelId: number;
  shipmentId: number;
  orderStatisticId: number;
  clientKpiId: number;

  constructor() {
    this.users = new Map();
    this.quoteRequests = new Map();
    this.inventoryLevels = new Map();
    this.shipments = new Map();
    this.orderStatistics = new Map();
    this.clientKpis = new Map();
    this.dashboardSettings = new Map();
    
    this.currentId = 1;
    this.quoteRequestId = 1;
    this.inventoryLevelId = 1;
    this.shipmentId = 1;
    this.orderStatisticId = 1;
    this.clientKpiId = 1;
    
    // Initialize with sample admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      lastLogin: null 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Quote request methods
  async createQuoteRequest(insertQuoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = this.quoteRequestId++;
    const createdAt = new Date();
    const quoteRequest: QuoteRequest = { 
      ...insertQuoteRequest, 
      id, 
      createdAt,
      status: 'new',
      assignedTo: null,
      convertedToClient: false
    };
    this.quoteRequests.set(id, quoteRequest);
    return quoteRequest;
  }
  
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values());
  }
  
  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }
  
  async updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const quoteRequest = await this.getQuoteRequest(id);
    if (!quoteRequest) return undefined;
    
    const updatedRequest = { ...quoteRequest, ...data };
    this.quoteRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Inventory methods
  async createInventoryLevel(data: InsertInventoryLevel): Promise<InventoryLevel> {
    const id = this.inventoryLevelId++;
    const updatedAt = new Date();
    const inventoryLevel: InventoryLevel = {
      ...data,
      id,
      updatedAt
    };
    this.inventoryLevels.set(id, inventoryLevel);
    return inventoryLevel;
  }
  
  async getInventoryLevels(clientId?: number): Promise<InventoryLevel[]> {
    if (clientId) {
      return Array.from(this.inventoryLevels.values())
        .filter(level => level.clientId === clientId);
    }
    return Array.from(this.inventoryLevels.values());
  }
  
  async getInventoryLevel(id: number): Promise<InventoryLevel | undefined> {
    return this.inventoryLevels.get(id);
  }
  
  async updateInventoryLevel(id: number, data: Partial<InventoryLevel>): Promise<InventoryLevel | undefined> {
    const level = await this.getInventoryLevel(id);
    if (!level) return undefined;
    
    const updatedLevel = { 
      ...level, 
      ...data, 
      updatedAt: new Date() 
    };
    this.inventoryLevels.set(id, updatedLevel);
    return updatedLevel;
  }
  
  // Shipment methods
  async createShipment(data: InsertShipment): Promise<Shipment> {
    const id = this.shipmentId++;
    const shipDate = new Date();
    const shipment: Shipment = {
      ...data,
      id,
      shipDate,
      status: 'processing'
    };
    this.shipments.set(id, shipment);
    return shipment;
  }
  
  async getShipments(clientId?: number): Promise<Shipment[]> {
    if (clientId) {
      return Array.from(this.shipments.values())
        .filter(shipment => shipment.clientId === clientId);
    }
    return Array.from(this.shipments.values());
  }
  
  async getShipment(id: number): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }
  
  async updateShipment(id: number, data: Partial<Shipment>): Promise<Shipment | undefined> {
    const shipment = await this.getShipment(id);
    if (!shipment) return undefined;
    
    const updatedShipment = { ...shipment, ...data };
    this.shipments.set(id, updatedShipment);
    return updatedShipment;
  }
  
  // Order statistics methods
  async createOrderStatistic(data: InsertOrderStatistic): Promise<OrderStatistic> {
    const id = this.orderStatisticId++;
    const statistic: OrderStatistic = {
      ...data,
      id
    };
    this.orderStatistics.set(id, statistic);
    return statistic;
  }
  
  async getOrderStatistics(clientId?: number, startDate?: Date, endDate?: Date): Promise<OrderStatistic[]> {
    let statistics = Array.from(this.orderStatistics.values());
    
    if (clientId) {
      statistics = statistics.filter(stat => stat.clientId === clientId);
    }
    
    if (startDate) {
      statistics = statistics.filter(stat => new Date(stat.date) >= startDate);
    }
    
    if (endDate) {
      statistics = statistics.filter(stat => new Date(stat.date) <= endDate);
    }
    
    return statistics;
  }
  
  async getOrderStatistic(id: number): Promise<OrderStatistic | undefined> {
    return this.orderStatistics.get(id);
  }
  
  async updateOrderStatistic(id: number, data: Partial<OrderStatistic>): Promise<OrderStatistic | undefined> {
    const statistic = await this.getOrderStatistic(id);
    if (!statistic) return undefined;
    
    const updatedStatistic = { ...statistic, ...data };
    this.orderStatistics.set(id, updatedStatistic);
    return updatedStatistic;
  }
  
  // Client KPI methods
  async createClientKpi(data: InsertClientKpi): Promise<ClientKpi> {
    const id = this.clientKpiId++;
    const kpi: ClientKpi = {
      ...data,
      id
    };
    this.clientKpis.set(id, kpi);
    return kpi;
  }
  
  async getClientKpis(clientId?: number, startDate?: Date, endDate?: Date): Promise<ClientKpi[]> {
    let kpis = Array.from(this.clientKpis.values());
    
    if (clientId) {
      kpis = kpis.filter(kpi => kpi.clientId === clientId);
    }
    
    if (startDate) {
      kpis = kpis.filter(kpi => new Date(kpi.month) >= startDate);
    }
    
    if (endDate) {
      kpis = kpis.filter(kpi => new Date(kpi.month) <= endDate);
    }
    
    return kpis;
  }
  
  async getClientKpi(id: number): Promise<ClientKpi | undefined> {
    return this.clientKpis.get(id);
  }
  
  async updateClientKpi(id: number, data: Partial<ClientKpi>): Promise<ClientKpi | undefined> {
    const kpi = await this.getClientKpi(id);
    if (!kpi) return undefined;
    
    const updatedKpi = { ...kpi, ...data };
    this.clientKpis.set(id, updatedKpi);
    return updatedKpi;
  }
  
  // Dashboard settings methods
  async saveDashboardSetting(data: InsertDashboardSetting): Promise<DashboardSetting> {
    const key = `${data.userId}_${data.widgetId}`;
    const now = new Date();
    const setting: DashboardSetting = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    this.dashboardSettings.set(key, setting);
    return setting;
  }
  
  async getDashboardSettings(userId: number): Promise<DashboardSetting[]> {
    return Array.from(this.dashboardSettings.values())
      .filter(setting => setting.userId === userId);
  }
  
  async updateDashboardSetting(userId: number, widgetId: string, data: Partial<DashboardSetting>): Promise<DashboardSetting | undefined> {
    const key = `${userId}_${widgetId}`;
    const setting = this.dashboardSettings.get(key);
    if (!setting) return undefined;
    
    const updatedSetting = { 
      ...setting, 
      ...data, 
      updatedAt: new Date() 
    };
    this.dashboardSettings.set(key, updatedSetting);
    return updatedSetting;
  }
  
  // Analytics specific methods
  async getClientAnalyticsSummary(clientId: number): Promise<any> {
    // Get all relevant data for this client
    const shipments = await this.getShipments(clientId);
    const inventoryLevels = await this.getInventoryLevels(clientId);
    const orderStats = await this.getOrderStatistics(clientId);
    const kpis = await this.getClientKpis(clientId);
    
    // Calculate summary statistics
    const totalShipments = shipments.length;
    const completedShipments = shipments.filter(s => s.status === 'delivered').length;
    const totalInventoryItems = inventoryLevels.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventoryLevels.filter(item => item.quantity <= item.minimumLevel).length;
    
    // Total orders aggregated from order statistics
    const totalOrders = orderStats.reduce((sum, stat) => sum + stat.ordersReceived, 0);
    const ordersProcessed = orderStats.reduce((sum, stat) => sum + stat.ordersProcessed, 0);
    const ordersFulfilled = orderStats.reduce((sum, stat) => sum + stat.ordersFulfilled, 0);
    
    // Get the latest KPI record if available
    const latestKpi = kpis.sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    )[0] || null;
    
    return {
      shipmentSummary: {
        total: totalShipments,
        completed: completedShipments,
        inProgress: totalShipments - completedShipments,
        completionRate: totalShipments ? (completedShipments / totalShipments) * 100 : 0
      },
      inventorySummary: {
        totalItems: totalInventoryItems,
        lowStock: lowStockItems,
        lowStockPercentage: totalInventoryItems ? (lowStockItems / inventoryLevels.length) * 100 : 0
      },
      orderSummary: {
        total: totalOrders,
        processed: ordersProcessed,
        fulfilled: ordersFulfilled,
        fulfillmentRate: totalOrders ? (ordersFulfilled / totalOrders) * 100 : 0
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
  
  async getShippingPerformance(clientId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    // Get filtered shipments
    let shipments = await this.getShipments(clientId);
    
    if (startDate) {
      shipments = shipments.filter(s => s.shipDate >= startDate);
    }
    
    if (endDate) {
      shipments = shipments.filter(s => s.shipDate <= endDate);
    }
    
    // Group by carrier and status
    const byCarrier: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const deliveryTimes: number[] = [];
    
    for (const shipment of shipments) {
      // Count by carrier
      byCarrier[shipment.carrier] = (byCarrier[shipment.carrier] || 0) + 1;
      
      // Count by status
      byStatus[shipment.status] = (byStatus[shipment.status] || 0) + 1;
      
      // Calculate delivery times for completed shipments
      if (shipment.status === 'delivered' && shipment.deliveryDate) {
        const deliveryTime = new Date(shipment.deliveryDate).getTime() - 
                             new Date(shipment.shipDate).getTime();
        deliveryTimes.push(deliveryTime / (1000 * 60 * 60 * 24)); // Convert to days
      }
    }
    
    // Calculate average delivery time
    const avgDeliveryTime = deliveryTimes.length ? 
      deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length : 
      null;
    
    return {
      totalShipments: shipments.length,
      byCarrier,
      byStatus,
      deliveryPerformance: {
        averageDeliveryTime: avgDeliveryTime,
        minimumTime: Math.min(...deliveryTimes),
        maximumTime: Math.max(...deliveryTimes)
      }
    };
  }
  
  async getInventoryReport(clientId?: number): Promise<any> {
    const inventoryLevels = await this.getInventoryLevels(clientId);
    
    // Group by warehouse location
    const byLocation: Record<string, number> = {};
    let totalItems = 0;
    let lowStockItems = 0;
    let optimalItems = 0;
    let overstockItems = 0;
    
    for (const item of inventoryLevels) {
      // Count by location
      byLocation[item.warehouseLocation] = 
        (byLocation[item.warehouseLocation] || 0) + item.quantity;
      
      // Total inventory
      totalItems += item.quantity;
      
      // Categorize inventory levels
      if (item.quantity <= item.minimumLevel) {
        lowStockItems++;
      } else if (item.maximumLevel && item.quantity >= item.maximumLevel) {
        overstockItems++;
      } else {
        optimalItems++;
      }
    }
    
    return {
      totalUniqueItems: inventoryLevels.length,
      totalQuantity: totalItems,
      inventoryHealth: {
        lowStock: lowStockItems,
        optimal: optimalItems,
        overstock: overstockItems
      },
      byLocation
    };
  }
}

export const storage = new MemStorage();
