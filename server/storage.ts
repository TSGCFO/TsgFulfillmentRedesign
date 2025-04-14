import { users, type User, type InsertUser, type InsertQuoteRequest, type QuoteRequest } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuoteRequest(quoteRequest: InsertQuoteRequest): Promise<QuoteRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quoteRequests: Map<number, QuoteRequest>;
  currentId: number;
  quoteRequestId: number;

  constructor() {
    this.users = new Map();
    this.quoteRequests = new Map();
    this.currentId = 1;
    this.quoteRequestId = 1;
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQuoteRequest(insertQuoteRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = this.quoteRequestId++;
    const createdAt = new Date();
    const quoteRequest: QuoteRequest = { 
      ...insertQuoteRequest, 
      id, 
      createdAt 
    };
    this.quoteRequests.set(id, quoteRequest);
    return quoteRequest;
  }
}

export const storage = new MemStorage();
