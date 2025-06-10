import { db } from "./db";
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
  // Employee methods (formerly user methods)
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
    // Create sample admin employee
    await this.createEmployee({
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@tsgfulfillment.com",
      password: "$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // hashed "admin123"
      role: "admin"
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
      role: employee.role || "sales",
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
      services: quoteRequest.services || null,
      currentShipments: quoteRequest.currentShipments || null,
      expectedShipments: quoteRequest.expectedShipments || null,
      createdAt: new Date(),
      status: "new",
      assignedTo: null,
      convertedToClient: false,
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
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool: db as any, 
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
    return result.rowCount > 0;
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
}

const isDatabaseEnabled = !!process.env.DATABASE_URL;
export const storage: IStorage = isDatabaseEnabled ? new DatabaseStorage() : new MemStorage();