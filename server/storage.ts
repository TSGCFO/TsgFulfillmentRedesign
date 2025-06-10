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
  updateMaterial(id: number, data: Partial<Material>): Promise<Material | undefined>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private employees = new Map<number, Employee>();
  private employeeId = 1;
  private quoteRequests = new Map<number, QuoteRequest>();
  private quoteRequestId = 1;
  
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with sample employee data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample employees with new role structure
    await this.createEmployee({
      fullName: "Super Administrator",
      username: "superadmin",
      email: "superadmin@tsgfulfillment.com",
      password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // hashed "superadmin123"
      role: "SuperAdmin"
    });
    
    await this.createEmployee({
      fullName: "Admin User",
      username: "admin",
      email: "admin@tsgfulfillment.com",
      password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // hashed "admin123"
      role: "Admin"
    });
    
    await this.createEmployee({
      fullName: "Regular User",
      username: "user",
      email: "user@tsgfulfillment.com",
      password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // hashed "user123"
      role: "User"
    });
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
      description: quoteRequest.description || null,
      budgetRange: quoteRequest.budgetRange || null,
      timeline: quoteRequest.timeline || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending"
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
    throw new Error("Vendor management not implemented in memory storage");
  }
  async getVendors(filters?: any): Promise<Vendor[]> { return []; }
  async updateVendor(id: number, data: Partial<Vendor>): Promise<Vendor | undefined> { return undefined; }
  
  async createMaterial(material: InsertMaterial): Promise<Material> {
    throw new Error("Material management not implemented in memory storage");
  }
  async getMaterials(filters?: any): Promise<Material[]> { return []; }
  async updateMaterial(id: number, data: Partial<Material>): Promise<Material | undefined> { return undefined; }
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

const isDatabaseEnabled = !!process.env.DATABASE_URL;
export const storage: IStorage = isDatabaseEnabled ? new DatabaseStorage() : new MemStorage();