import { db, pool } from "./db";
import { 
  employees,
  quoteRequests,
  inventoryLevels,
  shipments,
  orderStatistics,
  clientKpis,
  dashboardSettings,
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
  type InsertInquiryAssignment,
  type InquiryAssignment,
  type InsertContract,
  type Contract,
  type InsertQuote,
  type Quote,
  type InsertQuoteLineItem,
  type QuoteLineItem,
  type InsertVendor,
  type Vendor,
  type InsertMaterial,
  type Material,
  type InsertMaterialPrice,
  type MaterialPrice,
  type InsertMaterialOrder,
  type MaterialOrder,
  type InsertMaterialOrderItem,
  type MaterialOrderItem,
  type InsertMaterialUsage,
  type MaterialUsage
} from "@shared/schema";
import { eq, desc, gte, lte, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Updated interface with all CRUD methods for analytics
export interface IStorage {
  // Employee authentication & portal methods
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByUsername(username: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Quote request methods
  createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;
  
  // Inventory methods
  createInventoryLevel(inventory: InsertInventoryLevel): Promise<InventoryLevel>;
  getInventoryLevels(filters?: any): Promise<InventoryLevel[]>;
  getInventoryLevel(id: number): Promise<InventoryLevel | undefined>;
  updateInventoryLevel(id: number, data: Partial<InventoryLevel>): Promise<InventoryLevel | undefined>;
  
  // Shipment methods
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipments(filters?: any): Promise<Shipment[]>;
  getShipment(id: number): Promise<Shipment | undefined>;
  updateShipment(id: number, data: Partial<Shipment>): Promise<Shipment | undefined>;
  
  // Order statistics methods
  createOrderStatistic(stat: InsertOrderStatistic): Promise<OrderStatistic>;
  getOrderStatistics(clientId?: number, startDate?: Date, endDate?: Date): Promise<OrderStatistic[]>;
  updateOrderStatistic(id: number, data: Partial<OrderStatistic>): Promise<OrderStatistic | undefined>;
  
  // Client KPI methods
  createClientKpi(kpi: InsertClientKpi): Promise<ClientKpi>;
  getClientKpis(clientId?: number, startDate?: Date, endDate?: Date): Promise<ClientKpi[]>;
  updateClientKpi(id: number, data: Partial<ClientKpi>): Promise<ClientKpi | undefined>;
  
  // Dashboard settings methods
  saveDashboardSetting(setting: InsertDashboardSetting): Promise<DashboardSetting>;
  getDashboardSettings(userId?: number): Promise<DashboardSetting[]>;
  updateDashboardSetting(userId: number, key: string, data: Partial<DashboardSetting>): Promise<DashboardSetting | undefined>;
  
  // Analytics methods
  getClientAnalyticsSummary(clientId?: number): Promise<any>;
  getShippingPerformance(startDate?: Date, endDate?: Date, clientId?: number): Promise<any>;
  getInventoryReport(warehouseId?: number): Promise<any>;
  getReportData(reportType: string, dateRange: any, clientId?: number, warehouseId?: number): Promise<any>;
  getComparisonData(metric: string, period: string, currentStart?: Date, currentEnd?: Date, previousStart?: Date, previousEnd?: Date): Promise<any>;
  
  // Inquiry assignment methods
  getInquiryAssignments(employeeId?: number): Promise<InquiryAssignment[]>;
  getUnassignedQuoteRequests(): Promise<QuoteRequest[]>;
  createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment>;
  updateInquiryAssignment(id: number, data: Partial<InquiryAssignment>): Promise<InquiryAssignment | undefined>;
  
  // Quote methods
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotes(filters?: any): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  updateQuote(id: number, data: Partial<Quote>): Promise<Quote | undefined>;
  
  // Contract methods
  createContract(contract: InsertContract): Promise<Contract>;
  getContracts(filters?: any): Promise<Contract[]>;
  
  // Vendor methods
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendors(filters?: any): Promise<Vendor[]>;
  updateVendor(id: number, data: Partial<Vendor>): Promise<Vendor | undefined>;
  
  // Material methods
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterials(filters?: any): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  updateMaterial(id: number, data: Partial<Material>): Promise<Material | undefined>;
  
  // Material price methods
  createMaterialPrice(price: InsertMaterialPrice): Promise<MaterialPrice>;
  getMaterialPrices(filters?: any): Promise<MaterialPrice[]>;
  updateMaterialPrice(id: number, data: Partial<MaterialPrice>): Promise<MaterialPrice | undefined>;
  
  // Material order methods
  createMaterialOrder(order: InsertMaterialOrder): Promise<MaterialOrder>;
  getMaterialOrders(filters?: any): Promise<MaterialOrder[]>;
  getMaterialOrder(id: number): Promise<MaterialOrder | undefined>;
  updateMaterialOrder(id: number, data: Partial<MaterialOrder>): Promise<MaterialOrder | undefined>;
  
  // Material order item methods
  createMaterialOrderItem(item: InsertMaterialOrderItem): Promise<MaterialOrderItem>;
  getMaterialOrderItems(orderId: number): Promise<MaterialOrderItem[]>;
  
  // Material usage methods
  createMaterialUsage(usage: InsertMaterialUsage): Promise<MaterialUsage>;
  getMaterialUsage(filters?: any): Promise<MaterialUsage[]>;
  
  // Additional utility methods
  getEmployees(): Promise<Employee[]>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private employees = new Map<number, Employee>();
  private employeeId = 1;
  private quoteRequests = new Map<number, QuoteRequest>();
  private quoteRequestId = 1;
  
  // Material management storage maps
  private materials = new Map<number, Material>();
  private materialId = 1;
  private materialPrices = new Map<number, MaterialPrice>();
  private materialPriceId = 1;
  private materialOrders = new Map<number, MaterialOrder>();
  private materialOrderId = 1;
  private materialOrderItems = new Map<number, MaterialOrderItem>();
  private materialOrderItemId = 1;
  private materialUsage = new Map<number, MaterialUsage>();
  private materialUsageId = 1;
  private vendors = new Map<number, Vendor>();
  private vendorId = 1;
  
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with sample employee data synchronously
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample employees with new role structure and CORRECT password hashes
    // Using direct synchronous initialization for in-memory storage
    const superAdmin: Employee = {
      id: this.employeeId++,
      fullName: "Super Administrator",
      username: "superadmin",
      email: "superadmin@tsgfulfillment.com",
      password: "$2b$10$vl8hCzwsrLC1ZkBLTjRkN.JMnuZtC59Q2.IMsbM96jmhpN0DLGYaC", // hashed "superadmin123"
      role: "SuperAdmin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isActive: true,
      hubspotUserId: null
    };
    this.employees.set(superAdmin.id, superAdmin);
    
    const admin: Employee = {
      id: this.employeeId++,
      fullName: "Admin User",
      username: "admin",
      email: "admin@tsgfulfillment.com",
      password: "$2b$10$IIPHEJmyZDrIe2jmhmUWf.xBG29l/5tqD/k/B.EIVtxWQyYntnrna", // hashed "admin123"
      role: "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isActive: true,
      hubspotUserId: null
    };
    this.employees.set(admin.id, admin);
    
    const user: Employee = {
      id: this.employeeId++,
      fullName: "Regular User",
      username: "user",
      email: "user@tsgfulfillment.com",
      password: "$2b$10$PxwScsIwQuMLuzl9sKzsuOISZgID/9mV0BIRhvU1Nuog5pQDqevgC", // hashed "user123"
      role: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isActive: true,
      hubspotUserId: null
    };
    this.employees.set(user.id, user);
    
    // Initialize sample materials for testing
    const boxMaterial: Material = {
      id: this.materialId++,
      name: "Cardboard Box - Small",
      sku: "BOX-S-001",
      description: "Small cardboard box for shipping",
      unit: "piece",
      currentStock: 500,
      minimumStock: 100,
      category: "Packaging",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materials.set(boxMaterial.id, boxMaterial);
    
    const bubbleWrap: Material = {
      id: this.materialId++,
      name: "Bubble Wrap",
      sku: "BW-001",
      description: "Protective bubble wrap roll",
      unit: "meter",
      currentStock: 50,
      minimumStock: 100,
      category: "Packaging",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materials.set(bubbleWrap.id, bubbleWrap);
    
    const shippingLabel: Material = {
      id: this.materialId++,
      name: "Shipping Label",
      sku: "LABEL-001",
      description: "Adhesive shipping labels",
      unit: "piece",
      currentStock: 1000,
      minimumStock: 500,
      category: "Labels",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materials.set(shippingLabel.id, shippingLabel);
    
    // Initialize sample vendor
    const vendor: Vendor = {
      id: this.vendorId++,
      name: "ABC Packaging Supplies",
      contactEmail: "contact@abcpackaging.com",
      contactPhone: "(555) 123-4567",
      address: "123 Supply Street, Industrial City, IC 12345",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.vendors.set(vendor.id, vendor);
    
    console.log('[STORAGE] Initialized sample data with', this.employees.size, 'employees and', this.materials.size, 'materials');
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.username === username);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.isActive);
  }

  async getEmployees(): Promise<Employee[]> {
    return this.getAllEmployees();
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee: Employee = {
      id: this.employeeId++,
      ...employee,
      role: employee.role || "User",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      isActive: true,
      hubspotUserId: null
    };
    this.employees.set(newEmployee.id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updated = { ...employee, ...employeeData, updatedAt: new Date() };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  async createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const newQuoteRequest: QuoteRequest = {
      id: this.quoteRequestId++,
      ...quoteRequest,
      message: quoteRequest.message || null,
      createdAt: new Date(),
      status: "new",
      assignedTo: null,
      convertedToClient: false,
      currentShipments: quoteRequest.currentShipments || null,
      expectedShipments: quoteRequest.expectedShipments || null,
      services: quoteRequest.services || null
    };
    this.quoteRequests.set(newQuoteRequest.id, newQuoteRequest);
    return newQuoteRequest;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values());
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }

  async updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const quoteRequest = this.quoteRequests.get(id);
    if (!quoteRequest) return undefined;
    
    const updated = { ...quoteRequest, ...data };
    this.quoteRequests.set(id, updated);
    return updated;
  }

  // Material management method implementations
  async getMaterial(id: number): Promise<Material | undefined> { 
    return this.materials.get(id);
  }
  
  async createMaterialPrice(price: InsertMaterialPrice): Promise<MaterialPrice> {
    const newPrice: MaterialPrice = {
      id: this.materialPriceId++,
      ...price,
      effectiveDate: price.effectiveDate || new Date(),
      isActive: price.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materialPrices.set(newPrice.id, newPrice);
    return newPrice;
  }
  
  async getMaterialPrices(filters?: any): Promise<MaterialPrice[]> { 
    const prices = Array.from(this.materialPrices.values());
    if (filters?.materialId) {
      return prices.filter(p => p.materialId === filters.materialId);
    }
    if (filters?.vendorId) {
      return prices.filter(p => p.vendorId === filters.vendorId);
    }
    if (filters?.isActive !== undefined) {
      return prices.filter(p => p.isActive === filters.isActive);
    }
    return prices;
  }
  
  async updateMaterialPrice(id: number, data: Partial<MaterialPrice>): Promise<MaterialPrice | undefined> { 
    const price = this.materialPrices.get(id);
    if (!price) return undefined;
    
    const updated = { ...price, ...data, updatedAt: new Date() };
    this.materialPrices.set(id, updated);
    return updated;
  }
  
  async createMaterialOrder(order: InsertMaterialOrder): Promise<MaterialOrder> {
    const newOrder: MaterialOrder = {
      id: this.materialOrderId++,
      ...order,
      orderNumber: order.orderNumber || `ORD-${Date.now()}`,
      status: order.status || "pending",
      orderDate: order.orderDate || new Date(),
      expectedDeliveryDate: order.expectedDeliveryDate || null,
      actualDeliveryDate: order.actualDeliveryDate || null,
      notes: order.notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materialOrders.set(newOrder.id, newOrder);
    return newOrder;
  }
  
  async getMaterialOrders(filters?: any): Promise<MaterialOrder[]> { 
    const orders = Array.from(this.materialOrders.values());
    if (filters?.vendorId) {
      return orders.filter(o => o.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      return orders.filter(o => o.status === filters.status);
    }
    return orders;
  }
  
  async getMaterialOrder(id: number): Promise<MaterialOrder | undefined> { 
    return this.materialOrders.get(id);
  }
  
  async updateMaterialOrder(id: number, data: Partial<MaterialOrder>): Promise<MaterialOrder | undefined> { 
    const order = this.materialOrders.get(id);
    if (!order) return undefined;
    
    const updated = { ...order, ...data, updatedAt: new Date() };
    this.materialOrders.set(id, updated);
    return updated;
  }
  
  async createMaterialOrderItem(item: InsertMaterialOrderItem): Promise<MaterialOrderItem> {
    const newItem: MaterialOrderItem = {
      id: this.materialOrderItemId++,
      ...item,
      quantityReceived: item.quantityReceived || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materialOrderItems.set(newItem.id, newItem);
    return newItem;
  }
  
  async getMaterialOrderItems(orderId: number): Promise<MaterialOrderItem[]> { 
    return Array.from(this.materialOrderItems.values()).filter(item => item.orderId === orderId);
  }
  
  async createMaterialUsage(usage: InsertMaterialUsage): Promise<MaterialUsage> {
    const newUsage: MaterialUsage = {
      id: this.materialUsageId++,
      ...usage,
      purpose: usage.purpose || null,
      clientReference: usage.clientReference || null,
      notes: usage.notes || null,
      usedAt: new Date()
    };
    this.materialUsage.set(newUsage.id, newUsage);
    
    // Update material stock
    const material = this.materials.get(usage.materialId);
    if (material) {
      material.currentStock -= usage.quantityUsed;
      this.materials.set(material.id, material);
    }
    
    return newUsage;
  }
  
  async getMaterialUsage(filters?: any): Promise<MaterialUsage[]> { 
    const usage = Array.from(this.materialUsage.values());
    if (filters?.materialId) {
      return usage.filter(u => u.materialId === filters.materialId);
    }
    if (filters?.employeeId) {
      return usage.filter(u => u.employeeId === filters.employeeId);
    }
    return usage;
  }
  
  // Stub implementations for additional storage methods
  async createInventoryLevel(inventory: InsertInventoryLevel): Promise<InventoryLevel> {
    throw new Error("Inventory management not implemented in memory storage");
  }
  async getInventoryLevels(filters?: any): Promise<InventoryLevel[]> { return []; }
  async getInventoryLevel(id: number): Promise<InventoryLevel | undefined> { return undefined; }
  async updateInventoryLevel(id: number, data: Partial<InventoryLevel>): Promise<InventoryLevel | undefined> { return undefined; }
  
  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    throw new Error("Shipment management not implemented in memory storage");
  }
  async getShipments(filters?: any): Promise<Shipment[]> { return []; }
  async getShipment(id: number): Promise<Shipment | undefined> { return undefined; }
  async updateShipment(id: number, data: Partial<Shipment>): Promise<Shipment | undefined> { return undefined; }
  
  async createOrderStatistic(stat: InsertOrderStatistic): Promise<OrderStatistic> {
    throw new Error("Order statistics not implemented in memory storage");
  }
  async getOrderStatistics(startDate?: Date, endDate?: Date, clientId?: number): Promise<OrderStatistic[]> { return []; }
  async updateOrderStatistic(id: number, data: Partial<OrderStatistic>): Promise<OrderStatistic | undefined> { return undefined; }
  
  async createClientKpi(kpi: InsertClientKpi): Promise<ClientKpi> {
    throw new Error("Client KPIs not implemented in memory storage");
  }
  async getClientKpis(startDate?: Date, endDate?: Date, clientId?: number): Promise<ClientKpi[]> { return []; }
  async updateClientKpi(id: number, data: Partial<ClientKpi>): Promise<ClientKpi | undefined> { return undefined; }
  
  async saveDashboardSetting(setting: InsertDashboardSetting): Promise<DashboardSetting> {
    throw new Error("Dashboard settings not implemented in memory storage");
  }
  async getDashboardSettings(userId?: number): Promise<DashboardSetting[]> { return []; }
  async updateDashboardSetting(userId: number, key: string, data: Partial<DashboardSetting>): Promise<DashboardSetting | undefined> { return undefined; }
  
  async getClientAnalyticsSummary(clientId?: number): Promise<any> { return {}; }
  async getShippingPerformance(startDate?: Date, endDate?: Date, clientId?: number): Promise<any> { return {}; }
  async getInventoryReport(warehouseId?: number): Promise<any> { return {}; }
  async getReportData(reportType: string, dateRange: any, clientId?: number, warehouseId?: number): Promise<any> { return {}; }
  async getComparisonData(metric: string, period: string, currentStart?: Date, currentEnd?: Date, previousStart?: Date, previousEnd?: Date): Promise<any> { return {}; }
  
  async getInquiryAssignments(employeeId?: number): Promise<InquiryAssignment[]> { return []; }
  async getUnassignedQuoteRequests(): Promise<QuoteRequest[]> { return Array.from(this.quoteRequests.values()); }
  async createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment> {
    throw new Error("Inquiry assignments not implemented in memory storage");
  }
  async updateInquiryAssignment(id: number, data: Partial<InquiryAssignment>): Promise<InquiryAssignment | undefined> { return undefined; }
  
  async createQuote(quote: InsertQuote): Promise<Quote> {
    throw new Error("Quote management not implemented in memory storage");
  }
  async getQuotes(filters?: any): Promise<Quote[]> { return []; }
  async getQuote(id: number): Promise<Quote | undefined> { return undefined; }
  async updateQuote(id: number, data: Partial<Quote>): Promise<Quote | undefined> { return undefined; }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    throw new Error("Contract management not implemented in memory storage");
  }
  async getContracts(filters?: any): Promise<Contract[]> { return []; }
  
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const newVendor: Vendor = {
      id: this.vendorId++,
      ...vendor,
      isActive: vendor.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.vendors.set(newVendor.id, newVendor);
    return newVendor;
  }
  
  async getVendors(filters?: any): Promise<Vendor[]> { 
    const vendors = Array.from(this.vendors.values());
    if (filters?.isActive !== undefined) {
      return vendors.filter(v => v.isActive === filters.isActive);
    }
    return vendors;
  }
  
  async updateVendor(id: number, data: Partial<Vendor>): Promise<Vendor | undefined> { 
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updated = { ...vendor, ...data, updatedAt: new Date() };
    this.vendors.set(id, updated);
    return updated;
  }
  
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const newMaterial: Material = {
      id: this.materialId++,
      ...material,
      isActive: material.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materials.set(newMaterial.id, newMaterial);
    return newMaterial;
  }
  
  async getMaterials(filters?: any): Promise<Material[]> { 
    const materials = Array.from(this.materials.values());
    if (filters?.isActive !== undefined) {
      return materials.filter(m => m.isActive === filters.isActive);
    }
    if (filters?.category) {
      return materials.filter(m => m.category === filters.category);
    }
    return materials;
  }
  
  async updateMaterial(id: number, data: Partial<Material>): Promise<Material | undefined> { 
    const material = this.materials.get(id);
    if (!material) return undefined;
    
    const updated = { ...material, ...data, updatedAt: new Date() };
    this.materials.set(id, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool: pool, 
      createTableIfMissing: true 
    });
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return result[0];
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.username, username)).limit(1);
    return result[0];
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.isActive, true));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee | undefined> {
    const result = await db.update(employees).set({
      ...employeeData,
      updatedAt: new Date()
    }).where(eq(employees.id, id)).returning();
    return result[0];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const result = await db.insert(quoteRequests).values(quoteRequest).returning();
    return result[0];
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const result = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1);
    return result[0];
  }

  async updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const result = await db.update(quoteRequests).set(data).where(eq(quoteRequests.id, id)).returning();
    return result[0];
  }

  // Database implementations for additional storage methods
  async createInventoryLevel(inventory: InsertInventoryLevel): Promise<InventoryLevel> {
    const result = await db.insert(inventoryLevels).values(inventory).returning();
    return result[0];
  }
  async getInventoryLevels(filters?: any): Promise<InventoryLevel[]> {
    return await db.select().from(inventoryLevels);
  }
  async getInventoryLevel(id: number): Promise<InventoryLevel | undefined> {
    const result = await db.select().from(inventoryLevels).where(eq(inventoryLevels.id, id)).limit(1);
    return result[0];
  }
  async updateInventoryLevel(id: number, data: Partial<InventoryLevel>): Promise<InventoryLevel | undefined> {
    const result = await db.update(inventoryLevels).set(data).where(eq(inventoryLevels.id, id)).returning();
    return result[0];
  }
  
  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const result = await db.insert(shipments).values(shipment).returning();
    return result[0];
  }
  async getShipments(filters?: any): Promise<Shipment[]> {
    return await db.select().from(shipments);
  }
  async getShipment(id: number): Promise<Shipment | undefined> {
    const result = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    return result[0];
  }
  async updateShipment(id: number, data: Partial<Shipment>): Promise<Shipment | undefined> {
    const result = await db.update(shipments).set(data).where(eq(shipments.id, id)).returning();
    return result[0];
  }
  
  async createOrderStatistic(stat: InsertOrderStatistic): Promise<OrderStatistic> {
    const result = await db.insert(orderStatistics).values(stat).returning();
    return result[0];
  }
  async getOrderStatistics(clientId?: number, startDate?: Date, endDate?: Date): Promise<OrderStatistic[]> {
    return await db.select().from(orderStatistics);
  }
  async updateOrderStatistic(id: number, data: Partial<OrderStatistic>): Promise<OrderStatistic | undefined> {
    const result = await db.update(orderStatistics).set(data).where(eq(orderStatistics.id, id)).returning();
    return result[0];
  }
  
  async createClientKpi(kpi: InsertClientKpi): Promise<ClientKpi> {
    const result = await db.insert(clientKpis).values(kpi).returning();
    return result[0];
  }
  async getClientKpis(startDate?: Date, endDate?: Date, clientId?: number): Promise<ClientKpi[]> {
    return await db.select().from(clientKpis);
  }
  async updateClientKpi(id: number, data: Partial<ClientKpi>): Promise<ClientKpi | undefined> {
    const result = await db.update(clientKpis).set(data).where(eq(clientKpis.id, id)).returning();
    return result[0];
  }
  
  async saveDashboardSetting(setting: InsertDashboardSetting): Promise<DashboardSetting> {
    const result = await db.insert(dashboardSettings).values(setting).returning();
    return result[0];
  }
  async getDashboardSettings(userId?: number): Promise<DashboardSetting[]> {
    return await db.select().from(dashboardSettings);
  }
  async updateDashboardSetting(userId: number, key: string, data: Partial<DashboardSetting>): Promise<DashboardSetting | undefined> {
    const result = await db.update(dashboardSettings).set(data).where(eq(dashboardSettings.userId, userId)).returning();
    return result[0];
  }
  
  async getClientAnalyticsSummary(clientId?: number): Promise<any> {
    // Implement analytics aggregation logic
    return {};
  }
  async getShippingPerformance(startDate?: Date, endDate?: Date, clientId?: number): Promise<any> {
    // Implement shipping performance analytics
    return {};
  }
  async getInventoryReport(warehouseId?: number): Promise<any> {
    // Implement inventory reporting
    return {};
  }
  async getReportData(reportType: string, dateRange: any, clientId?: number, warehouseId?: number): Promise<any> {
    // Implement report data generation
    return {};
  }
  async getComparisonData(metric: string, period: string, currentStart?: Date, currentEnd?: Date, previousStart?: Date, previousEnd?: Date): Promise<any> {
    // Implement comparison data generation
    return {};
  }
  
  async getInquiryAssignments(employeeId?: number): Promise<InquiryAssignment[]> {
    return await db.select().from(inquiryAssignments);
  }
  async getUnassignedQuoteRequests(): Promise<QuoteRequest[]> {
    // Get quote requests that haven't been assigned
    return await db.select().from(quoteRequests);
  }
  async createInquiryAssignment(assignment: InsertInquiryAssignment): Promise<InquiryAssignment> {
    const result = await db.insert(inquiryAssignments).values(assignment).returning();
    return result[0];
  }
  async updateInquiryAssignment(id: number, data: Partial<InquiryAssignment>): Promise<InquiryAssignment | undefined> {
    const result = await db.update(inquiryAssignments).set(data).where(eq(inquiryAssignments.id, id)).returning();
    return result[0];
  }
  
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const result = await db.insert(quotes).values(quote).returning();
    return result[0];
  }
  async getQuotes(filters?: any): Promise<Quote[]> {
    return await db.select().from(quotes);
  }
  async getQuote(id: number): Promise<Quote | undefined> {
    const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    return result[0];
  }
  async updateQuote(id: number, data: Partial<Quote>): Promise<Quote | undefined> {
    const result = await db.update(quotes).set(data).where(eq(quotes.id, id)).returning();
    return result[0];
  }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    const result = await db.insert(contracts).values(contract).returning();
    return result[0];
  }
  async getContracts(filters?: any): Promise<Contract[]> {
    return await db.select().from(contracts);
  }
  
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }
  async getVendors(filters?: any): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }
  async updateVendor(id: number, data: Partial<Vendor>): Promise<Vendor | undefined> {
    const result = await db.update(vendors).set(data).where(eq(vendors.id, id)).returning();
    return result[0];
  }
  
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const result = await db.insert(materials).values(material).returning();
    return result[0];
  }
  async getMaterials(filters?: any): Promise<Material[]> {
    return await db.select().from(materials);
  }
  async updateMaterial(id: number, data: Partial<Material>): Promise<Material | undefined> {
    const result = await db.update(materials).set(data).where(eq(materials.id, id)).returning();
    return result[0];
  }
}

// For testing purposes, force MemStorage to use sample data
// To use database, set USE_DATABASE=true environment variable
const isDatabaseEnabled = process.env.USE_DATABASE === 'true';
export const storage: IStorage = isDatabaseEnabled ? new DatabaseStorage() : new MemStorage();