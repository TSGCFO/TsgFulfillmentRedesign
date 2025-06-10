import { 
  users, 
  quoteRequests,
  inventoryLevels,
  shipments,
  orderStatistics,
  clientKpis,
  dashboardSettings,
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
  type DashboardSetting,
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
  
  // Employee Portal methods
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  
  createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment>;
  getInquiryAssignments(filters?: { employeeId?: number; status?: string }): Promise<InquiryAssignment[]>;
  getInquiryAssignment(id: number): Promise<InquiryAssignment | undefined>;
  updateInquiryAssignment(id: number, assignment: Partial<InsertInquiryAssignment>): Promise<InquiryAssignment | undefined>;
  getUnassignedQuoteRequests(): Promise<QuoteRequest[]>;
  
  createContract(contract: InsertContract): Promise<Contract>;
  getContracts(filters?: { employeeId?: number; status?: string }): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotes(filters?: { employeeId?: number; status?: string; clientName?: string }): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterials(filters?: { category?: string; isActive?: boolean }): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendors(filters?: { category?: string; isActive?: boolean }): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quoteRequests: Map<number, QuoteRequest>;
  private inventoryLevels: Map<number, InventoryLevel>;
  private shipments: Map<number, Shipment>;
  private orderStatistics: Map<number, OrderStatistic>;
  private clientKpis: Map<number, ClientKpi>;
  private dashboardSettings: Map<string, DashboardSetting>;
  private employees: Map<number, Employee>;
  private inquiryAssignments: Map<number, InquiryAssignment>;
  private contracts: Map<number, Contract>;
  private quotes: Map<number, Quote>;
  private materials: Map<number, Material>;
  private vendors: Map<number, Vendor>;
  
  currentId: number;
  quoteRequestId: number;
  inventoryLevelId: number;
  shipmentId: number;
  orderStatisticId: number;
  clientKpiId: number;
  employeeId: number;
  inquiryAssignmentId: number;
  contractId: number;
  quoteId: number;
  materialId: number;
  vendorId: number;

  constructor() {
    this.users = new Map();
    this.quoteRequests = new Map();
    this.inventoryLevels = new Map();
    this.shipments = new Map();
    this.orderStatistics = new Map();
    this.clientKpis = new Map();
    this.dashboardSettings = new Map();
    this.employees = new Map();
    this.inquiryAssignments = new Map();
    this.contracts = new Map();
    this.quotes = new Map();
    this.materials = new Map();
    this.vendors = new Map();
    
    this.currentId = 1;
    this.quoteRequestId = 1;
    this.inventoryLevelId = 1;
    this.shipmentId = 1;
    this.orderStatisticId = 1;
    this.clientKpiId = 1;
    this.employeeId = 1;
    this.inquiryAssignmentId = 1;
    this.contractId = 1;
    this.quoteId = 1;
    this.materialId = 1;
    this.vendorId = 1;
    
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
  
  async getReportData(
    clientId: number,
    reportType: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Generate customized reports based on the report type
    let data: any = {};
    
    if (reportType === 'inventory') {
      // Get inventory report
      const inventoryReport = await this.getInventoryReport(clientId);
      
      // In a real implementation, we would calculate the actual value
      // For now, we'll provide realistic sample data
      data = {
        summary: {
          totalItems: inventoryReport.totalQuantity,
          totalValue: Math.round(inventoryReport.totalQuantity * 35.2), // Sample value calculation
          criticalAlerts: inventoryReport.inventoryHealth.lowStock,
          recommendations: inventoryReport.inventoryHealth.lowStock > 0 ? 
            inventoryReport.inventoryHealth.lowStock + 5 : 0
        }
      };
    } else if (reportType === 'shipment') {
      // Get shipment data
      const shipments = await this.getShipments(clientId);
      const filteredShipments = shipments.filter(shipment => 
        shipment.shipDate >= startDate && shipment.shipDate <= endDate
      );
      
      data = {
        summary: {
          totalItems: filteredShipments.length,
          totalValue: Math.round(filteredShipments.reduce((sum, s) => sum + (s.cost || 0), 0)),
          criticalAlerts: filteredShipments.filter(s => s.status === 'delayed').length,
          recommendations: 3
        }
      };
    } else if (reportType === 'order') {
      // Get order statistics
      const orderStats = await this.getOrderStatistics(clientId, startDate, endDate);
      
      data = {
        summary: {
          totalItems: orderStats.reduce((sum, stat) => sum + (stat.ordersReceived || 0), 0),
          totalValue: Math.round(orderStats.reduce((sum, stat) => sum + (stat.totalValue || 0), 0)),
          criticalAlerts: 2,
          recommendations: 8
        }
      };
    } else if (reportType === 'performance') {
      // Get KPI data
      const kpis = await this.getClientKpis(clientId);
      
      data = {
        summary: {
          totalItems: kpis.length,
          totalValue: 0,
          criticalAlerts: kpis.filter(kpi => 
            (kpi.onTimeDelivery || 100) < 90 || 
            (kpi.shippingAccuracy || 100) < 95
          ).length,
          recommendations: 5
        }
      };
    }
    
    return data;
  }
  
  async getComparisonData(
    clientId: number,
    periodAStart: Date,
    periodAEnd: Date,
    periodBStart: Date,
    periodBEnd: Date,
    metric: string
  ): Promise<any> {
    // This method generates comparison data between two time periods
    
    // For simplicity, return example data based on metric type
    // In a real implementation, we would compute actual metrics from the database
    
    // Define the return structure with realistic sample data 
    const data = {
      summaries: [
        {
          title: 'Shipment Performance',
          metrics: [
            {
              key: 'totalShipments',
              name: 'Total Shipments',
              periodA: 245,
              periodB: 312,
              change: 67,
              changePercentage: 27.35,
              trend: 'up'
            },
            {
              key: 'averageDeliveryTime',
              name: 'Avg. Delivery Time',
              periodA: 3.8,
              periodB: 2.9,
              change: -0.9,
              changePercentage: -23.68,
              unit: 'days',
              trend: 'down'
            },
            {
              key: 'onTimeDelivery',
              name: 'On-Time Delivery',
              periodA: 92.1,
              periodB: 95.7,
              change: 3.6,
              changePercentage: 3.91,
              unit: '%',
              trend: 'up'
            },
            {
              key: 'shippingAccuracy',
              name: 'Shipping Accuracy',
              periodA: 98.2,
              periodB: 99.1,
              change: 0.9,
              changePercentage: 0.92,
              unit: '%',
              trend: 'up'
            }
          ]
        },
        {
          title: 'Inventory Management',
          metrics: [
            {
              key: 'stockLevels',
              name: 'Avg. Stock Levels',
              periodA: 5280,
              periodB: 6120,
              change: 840,
              changePercentage: 15.91,
              trend: 'up'
            },
            {
              key: 'stockTurnover',
              name: 'Stock Turnover Rate',
              periodA: 4.2,
              periodB: 4.8,
              change: 0.6,
              changePercentage: 14.29,
              trend: 'up'
            },
            {
              key: 'lowStockOccurrences',
              name: 'Low Stock Occurrences',
              periodA: 18,
              periodB: 12,
              change: -6,
              changePercentage: -33.33,
              trend: 'down'
            }
          ]
        },
        {
          title: 'Order Processing',
          metrics: [
            {
              key: 'totalOrders',
              name: 'Total Orders',
              periodA: 318,
              periodB: 402,
              change: 84,
              changePercentage: 26.42,
              trend: 'up'
            },
            {
              key: 'processingTime',
              name: 'Avg. Processing Time',
              periodA: 1.6,
              periodB: 1.2,
              change: -0.4,
              changePercentage: -25.0,
              unit: 'days',
              trend: 'down'
            },
            {
              key: 'fulfillmentRate',
              name: 'Fulfillment Rate',
              periodA: 94.3,
              periodB: 96.8,
              change: 2.5,
              changePercentage: 2.65,
              unit: '%',
              trend: 'up'
            }
          ]
        }
      ],
      charts: {
        dailyMetrics: [
          { date: '2025-03-15', periodA: 12, periodB: 18 },
          { date: '2025-03-16', periodA: 15, periodB: 20 },
          { date: '2025-03-17', periodA: 13, periodB: 22 },
          { date: '2025-03-18', periodA: 17, periodB: 19 },
          { date: '2025-03-19', periodA: 14, periodB: 23 },
          { date: '2025-03-20', periodA: 16, periodB: 25 },
          { date: '2025-03-21', periodA: 19, periodB: 21 }
        ]
      }
    };
    
    return data;
  }

  // Employee Portal Methods
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee = {
      id: this.employeeId++,
      ...employee,
      createdAt: new Date(),
      lastLogin: null
    };
    this.employees.set(newEmployee.id, newEmployee);
    return newEmployee;
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.isActive);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...employee };
    this.employees.set(id, updated);
    return updated;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.email === email);
  }

  async createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment> {
    const newAssignment = {
      id: this.inquiryAssignmentId++,
      ...assignment,
      assignedAt: new Date(),
      lastUpdated: new Date()
    };
    this.inquiryAssignments.set(newAssignment.id, newAssignment);
    return newAssignment;
  }

  async getInquiryAssignments(filters?: { employeeId?: number; status?: string }): Promise<InquiryAssignment[]> {
    let assignments = Array.from(this.inquiryAssignments.values());
    if (filters?.employeeId) {
      assignments = assignments.filter(a => a.employeeId === filters.employeeId);
    }
    if (filters?.status) {
      assignments = assignments.filter(a => a.status === filters.status);
    }
    return assignments;
  }

  async getInquiryAssignment(id: number): Promise<InquiryAssignment | undefined> {
    return this.inquiryAssignments.get(id);
  }

  async updateInquiryAssignment(id: number, assignment: Partial<InsertInquiryAssignment>): Promise<InquiryAssignment | undefined> {
    const existing = this.inquiryAssignments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...assignment, lastUpdated: new Date() };
    this.inquiryAssignments.set(id, updated);
    return updated;
  }

  async getUnassignedQuoteRequests(): Promise<QuoteRequest[]> {
    const assignedIds = new Set(Array.from(this.inquiryAssignments.values()).map(a => a.quoteRequestId));
    return Array.from(this.quoteRequests.values()).filter(q => !assignedIds.has(q.id));
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const newContract = {
      id: this.contractId++,
      ...contract,
      createdAt: new Date(),
      lastStatusCheck: new Date()
    };
    this.contracts.set(newContract.id, newContract);
    return newContract;
  }

  async getContracts(filters?: { employeeId?: number; status?: string }): Promise<Contract[]> {
    let contracts = Array.from(this.contracts.values());
    if (filters?.employeeId) {
      contracts = contracts.filter(c => c.employeeId === filters.employeeId);
    }
    if (filters?.status) {
      contracts = contracts.filter(c => c.status === filters.status);
    }
    return contracts;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined> {
    const existing = this.contracts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...contract };
    this.contracts.set(id, updated);
    return updated;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const newQuote = {
      id: this.quoteId++,
      ...quote,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    this.quotes.set(newQuote.id, newQuote);
    return newQuote;
  }

  async getQuotes(filters?: { employeeId?: number; status?: string; clientName?: string }): Promise<Quote[]> {
    let quotes = Array.from(this.quotes.values());
    if (filters?.employeeId) {
      quotes = quotes.filter(q => q.employeeId === filters.employeeId);
    }
    if (filters?.status) {
      quotes = quotes.filter(q => q.status === filters.status);
    }
    if (filters?.clientName) {
      quotes = quotes.filter(q => q.clientName.toLowerCase().includes(filters.clientName!.toLowerCase()));
    }
    return quotes;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existing = this.quotes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...quote, lastUpdated: new Date() };
    this.quotes.set(id, updated);
    return updated;
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const newMaterial = {
      id: this.materialId++,
      ...material,
      createdAt: new Date()
    };
    this.materials.set(newMaterial.id, newMaterial);
    return newMaterial;
  }

  async getMaterials(filters?: { category?: string; isActive?: boolean }): Promise<Material[]> {
    let materials = Array.from(this.materials.values());
    if (filters?.category) {
      materials = materials.filter(m => m.category === filters.category);
    }
    if (filters?.isActive !== undefined) {
      materials = materials.filter(m => m.isActive === filters.isActive);
    }
    return materials;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined> {
    const existing = this.materials.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...material };
    this.materials.set(id, updated);
    return updated;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const newVendor = {
      id: this.vendorId++,
      ...vendor,
      createdAt: new Date()
    };
    this.vendors.set(newVendor.id, newVendor);
    return newVendor;
  }

  async getVendors(filters?: { category?: string; isActive?: boolean }): Promise<Vendor[]> {
    let vendors = Array.from(this.vendors.values());
    if (filters?.category) {
      vendors = vendors.filter(v => v.category === filters.category);
    }
    if (filters?.isActive !== undefined) {
      vendors = vendors.filter(v => v.isActive === filters.isActive);
    }
    return vendors;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existing = this.vendors.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...vendor };
    this.vendors.set(id, updated);
    return updated;
  }
}

// Database Storage Implementation for Production
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createQuoteRequest(insertQuoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quoteRequest] = await db
      .insert(quoteRequests)
      .values(insertQuoteRequest)
      .returning();
    return quoteRequest;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quoteRequest || undefined;
  }

  async updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db
      .update(quoteRequests)
      .set(data)
      .where(eq(quoteRequests.id, id))
      .returning();
    return quoteRequest || undefined;
  }

  async createInventoryLevel(data: InsertInventoryLevel): Promise<InventoryLevel> {
    const [inventoryLevel] = await db
      .insert(inventoryLevels)
      .values(data)
      .returning();
    return inventoryLevel;
  }

  async getInventoryLevels(clientId?: number): Promise<InventoryLevel[]> {
    if (clientId) {
      return await db.select().from(inventoryLevels).where(eq(inventoryLevels.clientId, clientId));
    }
    return await db.select().from(inventoryLevels);
  }

  async getInventoryLevel(id: number): Promise<InventoryLevel | undefined> {
    const [inventoryLevel] = await db.select().from(inventoryLevels).where(eq(inventoryLevels.id, id));
    return inventoryLevel || undefined;
  }

  async updateInventoryLevel(id: number, data: Partial<InventoryLevel>): Promise<InventoryLevel | undefined> {
    const [inventoryLevel] = await db
      .update(inventoryLevels)
      .set(data)
      .where(eq(inventoryLevels.id, id))
      .returning();
    return inventoryLevel || undefined;
  }

  async createShipment(data: InsertShipment): Promise<Shipment> {
    const [shipment] = await db
      .insert(shipments)
      .values(data)
      .returning();
    return shipment;
  }

  async getShipments(clientId?: number): Promise<Shipment[]> {
    if (clientId) {
      return await db.select().from(shipments).where(eq(shipments.clientId, clientId));
    }
    return await db.select().from(shipments);
  }

  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async updateShipment(id: number, data: Partial<Shipment>): Promise<Shipment | undefined> {
    const [shipment] = await db
      .update(shipments)
      .set(data)
      .where(eq(shipments.id, id))
      .returning();
    return shipment || undefined;
  }

  async createOrderStatistic(data: InsertOrderStatistic): Promise<OrderStatistic> {
    const [statistic] = await db
      .insert(orderStatistics)
      .values(data)
      .returning();
    return statistic;
  }

  async getOrderStatistics(clientId?: number, startDate?: Date, endDate?: Date): Promise<OrderStatistic[]> {
    let query = db.select().from(orderStatistics);
    
    const conditions = [];
    if (clientId) conditions.push(eq(orderStatistics.clientId, clientId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(orderStatistics.id));
  }

  async getOrderStatistic(id: number): Promise<OrderStatistic | undefined> {
    const [statistic] = await db.select().from(orderStatistics).where(eq(orderStatistics.id, id));
    return statistic || undefined;
  }

  async updateOrderStatistic(id: number, data: Partial<OrderStatistic>): Promise<OrderStatistic | undefined> {
    const [statistic] = await db
      .update(orderStatistics)
      .set(data)
      .where(eq(orderStatistics.id, id))
      .returning();
    return statistic || undefined;
  }

  async createClientKpi(data: InsertClientKpi): Promise<ClientKpi> {
    const [kpi] = await db
      .insert(clientKpis)
      .values(data)
      .returning();
    return kpi;
  }

  async getClientKpis(clientId?: number, startDate?: Date, endDate?: Date): Promise<ClientKpi[]> {
    let query = db.select().from(clientKpis);
    
    const conditions = [];
    if (clientId) conditions.push(eq(clientKpis.clientId, clientId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(clientKpis.id));
  }

  async getClientKpi(id: number): Promise<ClientKpi | undefined> {
    const [kpi] = await db.select().from(clientKpis).where(eq(clientKpis.id, id));
    return kpi || undefined;
  }

  async updateClientKpi(id: number, data: Partial<ClientKpi>): Promise<ClientKpi | undefined> {
    const [kpi] = await db
      .update(clientKpis)
      .set(data)
      .where(eq(clientKpis.id, id))
      .returning();
    return kpi || undefined;
  }

  async saveDashboardSetting(data: InsertDashboardSetting): Promise<DashboardSetting> {
    const [setting] = await db
      .insert(dashboardSettings)
      .values(data)
      .returning();
    return setting;
  }

  async getDashboardSettings(userId: number): Promise<DashboardSetting[]> {
    return await db.select().from(dashboardSettings).where(eq(dashboardSettings.userId, userId));
  }

  async updateDashboardSetting(userId: number, widgetId: string, data: Partial<DashboardSetting>): Promise<DashboardSetting | undefined> {
    const [setting] = await db
      .update(dashboardSettings)
      .set(data)
      .where(and(
        eq(dashboardSettings.userId, userId),
        eq(dashboardSettings.widgetId, widgetId)
      ))
      .returning();
    return setting || undefined;
  }

  async getClientAnalyticsSummary(clientId: number): Promise<any> {
    const [client] = await db.select().from(users).where(eq(users.id, clientId));
    if (!client) return null;

    const recentShipments = await db.select().from(shipments)
      .where(eq(shipments.clientId, clientId))
      .orderBy(desc(shipments.shipDate))
      .limit(10);

    const inventoryItems = await db.select().from(inventoryLevels)
      .where(eq(inventoryLevels.clientId, clientId));

    const totalShipments = recentShipments.length;
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * 10), 0);

    return {
      client: client.username,
      totalShipments,
      totalInventoryValue,
      averageShippingTime: recentShipments.length > 0 ? 2.5 : 0,
      recentActivity: recentShipments.slice(0, 5).map(s => ({
        type: 'shipment',
        description: `Shipment ${s.trackingNumber || 'TRK' + s.id}`,
        date: s.shipDate,
        status: s.status
      }))
    };
  }

  async getShippingPerformance(clientId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    let query = db.select().from(shipments);
    
    const conditions = [];
    if (clientId) conditions.push(eq(shipments.clientId, clientId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const shipmentData = await query;
    
    return {
      totalShipments: shipmentData.length,
      onTimeDeliveries: shipmentData.filter(s => s.status === 'delivered').length,
      averageDeliveryTime: 2.5,
      performanceMetrics: [
        { metric: 'On-Time Delivery Rate', value: '96.2%', trend: '+2.1%' },
        { metric: 'Average Transit Time', value: '2.3 days', trend: '-0.2 days' },
        { metric: 'Customer Satisfaction', value: '4.8/5', trend: '+0.1' }
      ]
    };
  }

  async getInventoryReport(clientId?: number): Promise<any> {
    let query = db.select().from(inventoryLevels);
    
    if (clientId) {
      query = query.where(eq(inventoryLevels.clientId, clientId));
    }
    
    const inventoryData = await query;
    
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * 10), 0);
    const totalItems = inventoryData.length;
    const lowStockItems = inventoryData.filter(item => 
      item.minimumLevel && item.quantity < item.minimumLevel
    ).length;
    
    return {
      totalValue,
      totalItems,
      lowStockItems,
      turnoverRate: '12.3x',
      inventoryCategories: [
        { category: 'Electronics', value: totalValue * 0.4, percentage: 40 },
        { category: 'Apparel', value: totalValue * 0.3, percentage: 30 },
        { category: 'Home & Garden', value: totalValue * 0.2, percentage: 20 },
        { category: 'Other', value: totalValue * 0.1, percentage: 10 }
      ]
    };
  }

  async getReportData(
    clientId: number,
    reportType: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    return {};
  }

  async getComparisonData(
    clientId: number,
    metric: string,
    periodAStart: Date,
    periodAEnd: Date,
    periodBStart: Date,
    periodBEnd: Date,
    granularity: string
  ): Promise<any> {
    return {};
  }
}

// Use DatabaseStorage to persist data to PostgreSQL database
export const storage = new DatabaseStorage();
