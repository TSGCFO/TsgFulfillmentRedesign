# TSG Fulfillment Employee Portal - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Database Schema Extensions](#3-database-schema-extensions)
4. [Environment Configuration](#4-environment-configuration)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Deployment Instructions](#7-deployment-instructions)
8. [Testing Procedures](#8-testing-procedures)
9. [Security Considerations](#9-security-considerations)
10. [Maintenance and Monitoring](#10-maintenance-and-monitoring)

---

## 1. PROJECT OVERVIEW

### 1.1 Feature Description
The Employee Portal is a secure web application accessible at `https://www.tsgfulfillment.com/employee` that provides internal staff with tools to manage customer inquiries, contracts, quotes, and inventory tracking.

### 1.2 Core Requirements
1. **Lead Management**: Display and assign quote requests from website forms
2. **HubSpot Integration**: Bi-directional sync with HubSpot CRM
3. **DocuSign Integration**: Automated contract storage in Supabase
4. **Quote Tracking**: Complete sales cycle management
5. **Inventory Management**: Material tracking and vendor management

### 1.3 User Roles
- **Sales Representative**: Manage assigned quotes and contracts
- **Sales Manager**: Oversee all sales activities and assignments
- **Inventory Manager**: Handle materials, vendors, and purchase orders
- **Admin**: Full system access and user management

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Current Stack Analysis
- **Frontend**: React 18 + TypeScript + Wouter routing
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL with existing tables
- **Authentication**: Basic user schema (needs implementation)
- **Storage**: Supabase for documents/files
- **UI Components**: shadcn/ui + Tailwind CSS

### 2.2 Integration Points
- **HubSpot API**: OAuth 2.0 + REST API
- **DocuSign API**: JWT authentication + eSignature API
- **Supabase**: Storage buckets for contracts
- **Existing Forms**: UnifiedContactForm component

### 2.3 New Components Required
- Authentication middleware and JWT handling
- HubSpot service integration
- DocuSign service integration
- Employee portal UI components
- Role-based access control

---

## 3. DATABASE SCHEMA EXTENSIONS

### 3.1 Required New Tables

**IMPORTANT**: Execute these SQL commands in your PostgreSQL database in the exact order listed. Do not skip any steps.

```sql
-- Step 1: Create employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Create quotes table
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  quote_request_id INTEGER REFERENCES quote_requests(id),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_company VARCHAR(255) NOT NULL,
  services_quoted JSONB NOT NULL,
  pricing_data JSONB NOT NULL,
  total_amount DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'draft',
  valid_until DATE,
  created_by INTEGER REFERENCES employees(id),
  assigned_to INTEGER REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  hubspot_deal_id VARCHAR(100),
  notes TEXT
);

-- Step 3: Create contracts table
CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  docusign_envelope_id VARCHAR(100),
  supabase_file_path VARCHAR(500),
  signed_date TIMESTAMP,
  expires_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create vendors table
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_code VARCHAR(50) UNIQUE NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  delivery_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Create materials table
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  material_code VARCHAR(100) UNIQUE NOT NULL,
  material_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(50) NOT NULL,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  reorder_point INTEGER DEFAULT 0,
  standard_cost DECIMAL(10,2),
  last_purchase_cost DECIMAL(10,2),
  preferred_vendor_id INTEGER REFERENCES vendors(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 6: Create purchase_orders table
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  vendor_id INTEGER REFERENCES vendors(id) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(12,2),
  created_by INTEGER REFERENCES employees(id),
  approved_by INTEGER REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 7: Create purchase_order_items table
CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 8: Create hubspot_sync_log table
CREATE TABLE hubspot_sync_log (
  id SERIAL PRIMARY KEY,
  record_type VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  hubspot_id VARCHAR(100),
  sync_action VARCHAR(50) NOT NULL,
  sync_status VARCHAR(50) NOT NULL,
  error_message TEXT,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Step 9: Add indexes for performance
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_quotes_quote_request_id ON quotes(quote_request_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_assigned_to ON quotes(assigned_to);
CREATE INDEX idx_contracts_quote_id ON contracts(quote_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_is_active ON materials(is_active);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_hubspot_sync_log_record ON hubspot_sync_log(record_type, record_id);
```

### 3.2 Update shared/schema.ts

Add these exact lines to `/home/hassan/projects/TsgFulfillmentRedesign/shared/schema.ts` after the existing table definitions:

```typescript
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

// Export types
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
```

---

## 4. ENVIRONMENT CONFIGURATION

### 4.1 Required Environment Variables

Add these exact lines to your `.env` file:

```bash
# Employee Portal Configuration
EMPLOYEE_PORTAL_ENABLED=true
EMPLOYEE_PORTAL_SECRET=your-256-bit-secret-key-here

# HubSpot Integration
HUBSPOT_CLIENT_ID=your-hubspot-client-id
HUBSPOT_CLIENT_SECRET=your-hubspot-client-secret
HUBSPOT_REDIRECT_URI=https://www.tsgfulfillment.com/api/auth/hubspot/callback
HUBSPOT_SCOPES=contacts,deals,companies
HUBSPOT_ACCESS_TOKEN=your-hubspot-access-token

# DocuSign Integration
DOCUSIGN_INTEGRATION_KEY=your-docusign-integration-key
DOCUSIGN_USER_ID=your-docusign-user-id
DOCUSIGN_ACCOUNT_ID=your-docusign-account-id
DOCUSIGN_PRIVATE_KEY_PATH=./keys/docusign-private.key
DOCUSIGN_BASE_URL=https://demo.docusign.net

# Supabase Configuration (for document storage)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### 4.2 API Key Setup Instructions

1. **HubSpot Setup**:
   - Go to HubSpot Developer Account
   - Create new private app
   - Generate access token with contacts, deals, companies scopes
   - Copy client ID, secret, and access token

2. **DocuSign Setup**:
   - Create DocuSign developer account
   - Generate integration key
   - Create RSA key pair for JWT authentication
   - Save private key to `/keys/docusign-private.key`

3. **Supabase Setup**:
   - Create new bucket named 'contracts'
   - Set bucket policies for authenticated access
   - Copy URL, anon key, and service key

---

## 5. BACKEND IMPLEMENTATION

### 5.1 Install Required Dependencies

Run these exact commands in your project root:

```bash
npm install passport passport-local express-session bcryptjs jsonwebtoken
npm install @hubspot/api-client docusign-esign
npm install @types/passport @types/passport-local @types/express-session @types/bcryptjs @types/jsonwebtoken --save-dev
```

### 5.2 Authentication Middleware

Create `/home/hassan/projects/TsgFulfillmentRedesign/server/auth.ts`:

```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// JWT Secret
const JWT_SECRET = process.env.EMPLOYEE_PORTAL_SECRET || 'fallback-secret-key';

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// JWT Token Generation
export const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// JWT Verification Middleware
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid access token' });
  }
};

// Role-based Authorization
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

export default passport;
```

### 5.3 HubSpot Integration Service

Create `/home/hassan/projects/TsgFulfillmentRedesign/server/services/hubspot.ts`:

```typescript
import { Client as HubSpotClient } from '@hubspot/api-client';
import { storage } from '../storage';

class HubSpotService {
  private client: HubSpotClient;

  constructor() {
    this.client = new HubSpotClient({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN
    });
  }

  // Sync quote request to HubSpot as a deal
  async syncQuoteRequestToDeal(quoteRequestId: number) {
    try {
      const quoteRequest = await storage.getQuoteRequest(quoteRequestId);
      if (!quoteRequest) throw new Error('Quote request not found');

      // Create or update contact
      const contactId = await this.createOrUpdateContact({
        email: quoteRequest.email,
        firstname: quoteRequest.name.split(' ')[0],
        lastname: quoteRequest.name.split(' ').slice(1).join(' '),
        company: quoteRequest.company,
        phone: quoteRequest.phone
      });

      // Create deal
      const dealData = {
        properties: {
          dealname: `${quoteRequest.company} - ${quoteRequest.service}`,
          dealstage: 'appointmentscheduled',
          pipeline: 'default',
          amount: '0',
          closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          hubspot_owner_id: quoteRequest.assignedTo?.toString() || '',
          deal_currency_code: 'USD'
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
          }
        ]
      };

      const deal = await this.client.crm.deals.basicApi.create(dealData);

      // Log sync
      await storage.createHubspotSyncLog({
        recordType: 'quote_request',
        recordId: quoteRequestId,
        hubspotId: deal.id,
        syncAction: 'create_deal',
        syncStatus: 'success'
      });

      return deal;
    } catch (error) {
      // Log sync error
      await storage.createHubspotSyncLog({
        recordType: 'quote_request',
        recordId: quoteRequestId,
        hubspotId: null,
        syncAction: 'create_deal',
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Create or update contact in HubSpot
  private async createOrUpdateContact(contactData: any) {
    try {
      // Try to find existing contact by email
      const searchResults = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: contactData.email
          }]
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1
      });

      if (searchResults.results && searchResults.results.length > 0) {
        // Update existing contact
        const contactId = searchResults.results[0].id;
        await this.client.crm.contacts.basicApi.update(contactId, {
          properties: contactData
        });
        return contactId;
      } else {
        // Create new contact
        const contact = await this.client.crm.contacts.basicApi.create({
          properties: contactData
        });
        return contact.id;
      }
    } catch (error) {
      console.error('Error creating/updating HubSpot contact:', error);
      throw error;
    }
  }

  // Sync deal updates from HubSpot
  async syncDealFromHubSpot(dealId: string) {
    try {
      const deal = await this.client.crm.deals.basicApi.getById(dealId, [
        'dealname', 'dealstage', 'amount', 'closedate'
      ]);

      // Find corresponding quote in our system
      const quote = await storage.getQuoteByHubspotDealId(dealId);
      if (quote) {
        await storage.updateQuote(quote.id, {
          totalAmount: parseFloat(deal.properties.amount || '0'),
          status: this.mapHubspotStageToStatus(deal.properties.dealstage),
          updatedAt: new Date()
        });
      }

      return deal;
    } catch (error) {
      console.error('Error syncing deal from HubSpot:', error);
      throw error;
    }
  }

  private mapHubspotStageToStatus(hubspotStage: string): string {
    const stageMap: { [key: string]: string } = {
      'appointmentscheduled': 'pending',
      'qualifiedtobuy': 'in_review',
      'presentationscheduled': 'quoted',
      'decisionmakerboughtin': 'approved',
      'contractsent': 'contract_sent',
      'closedwon': 'accepted',
      'closedlost': 'rejected'
    };
    return stageMap[hubspotStage] || 'draft';
  }
}

export default new HubSpotService();
```

### 5.4 DocuSign Integration Service

Create `/home/hassan/projects/TsgFulfillmentRedesign/server/services/docusign.ts`:

```typescript
import docusign from 'docusign-esign';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';
import { supabase } from '../lib/supabase';

class DocuSignService {
  private apiClient: docusign.ApiClient;
  private accountId: string;

  constructor() {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi');
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
    
    this.configureJWTAuth();
  }

  private configureJWTAuth() {
    try {
      const privateKeyPath = process.env.DOCUSIGN_PRIVATE_KEY_PATH || './keys/docusign-private.key';
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      
      this.apiClient.configureJWTAuthorizationFlow(
        privateKey,
        'signature',
        process.env.DOCUSIGN_INTEGRATION_KEY || '',
        process.env.DOCUSIGN_USER_ID || '',
        3600 // 1 hour
      );
    } catch (error) {
      console.error('Error configuring DocuSign JWT:', error);
    }
  }

  // Send contract for signature
  async sendContractForSignature(quoteId: number, contractTemplateId: string, signerData: {
    name: string;
    email: string;
    company: string;
  }) {
    try {
      const quote = await storage.getQuote(quoteId);
      if (!quote) throw new Error('Quote not found');

      // Create envelope definition
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.emailSubject = `Contract for ${signerData.company} - TSG Fulfillment Services`;
      envelopeDefinition.templateId = contractTemplateId;

      // Template roles
      const templateRole = new docusign.TemplateRole();
      templateRole.email = signerData.email;
      templateRole.name = signerData.name;
      templateRole.roleName = 'Client';
      templateRole.tabs = new docusign.Tabs();

      // Add custom fields
      const textTabs = [
        this.createTextTab('ClientName', signerData.name),
        this.createTextTab('CompanyName', signerData.company),
        this.createTextTab('QuoteNumber', quote.quoteNumber),
        this.createTextTab('TotalAmount', quote.totalAmount?.toString() || '0')
      ];
      templateRole.tabs.textTabs = textTabs;

      envelopeDefinition.templateRoles = [templateRole];
      envelopeDefinition.status = 'sent';

      // Send envelope
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const envelopeSummary = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition
      });

      if (!envelopeSummary.envelopeId) {
        throw new Error('Failed to create DocuSign envelope');
      }

      // Create contract record
      const contractNumber = `CON-${quote.quoteNumber}-${Date.now()}`;
      const contract = await storage.createContract({
        quoteId: quoteId,
        contractNumber: contractNumber,
        clientName: signerData.name,
        contractType: 'service_agreement',
        status: 'sent',
        docusignEnvelopeId: envelopeSummary.envelopeId,
        supabaseFilePath: null,
        signedDate: null,
        expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      return { contract, envelopeId: envelopeSummary.envelopeId };
    } catch (error) {
      console.error('Error sending contract:', error);
      throw error;
    }
  }

  private createTextTab(tabLabel: string, value: string): docusign.Text {
    const textTab = new docusign.Text();
    textTab.tabLabel = tabLabel;
    textTab.value = value;
    textTab.locked = 'true';
    return textTab;
  }

  // Handle DocuSign webhooks
  async handleWebhook(envelopeId: string, status: string) {
    try {
      const contract = await storage.getContractByDocusignEnvelopeId(envelopeId);
      if (!contract) {
        console.warn(`Contract not found for envelope ID: ${envelopeId}`);
        return;
      }

      if (status === 'completed') {
        // Download signed document
        const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
        const documentStream = await envelopesApi.getDocument(
          this.accountId,
          envelopeId,
          'combined'
        );

        // Upload to Supabase
        const fileName = `contracts/${contract.contractNumber}_signed.pdf`;
        const { data, error } = await supabase.storage
          .from('contracts')
          .upload(fileName, documentStream, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (error) throw error;

        // Update contract status
        await storage.updateContract(contract.id, {
          status: 'signed',
          signedDate: new Date(),
          supabaseFilePath: fileName
        });

        // Update related quote status
        if (contract.quoteId) {
          await storage.updateQuote(contract.quoteId, {
            status: 'contracted'
          });
        }
      }
    } catch (error) {
      console.error('Error handling DocuSign webhook:', error);
    }
  }
}

export default new DocuSignService();
```

### 5.5 Update Storage Interface

Add these exact methods to `/home/hassan/projects/TsgFulfillmentRedesign/server/storage.ts` in the `IStorage` interface:

```typescript
// Employee methods
getEmployee(id: number): Promise<Employee | undefined>;
getEmployeeByUserId(userId: number): Promise<Employee | undefined>;
createEmployee(employee: InsertEmployee): Promise<Employee>;
updateEmployee(id: number, data: Partial<Employee>): Promise<Employee | undefined>;
getEmployeesByDepartment(department: string): Promise<Employee[]>;

// Quote methods
createQuote(quote: InsertQuote): Promise<Quote>;
getQuotes(filters?: { assignedTo?: number; status?: string; page?: number; limit?: number }): Promise<Quote[]>;
getQuote(id: number): Promise<Quote | undefined>;
updateQuote(id: number, data: Partial<Quote>): Promise<Quote | undefined>;
getQuoteByHubspotDealId(dealId: string): Promise<Quote | undefined>;
getQuoteCount(filters?: { assignedTo?: number; status?: string }): Promise<number>;

// Contract methods
createContract(contract: InsertContract): Promise<Contract>;
getContracts(filters?: { status?: string; page?: number; limit?: number }): Promise<Contract[]>;
getContract(id: number): Promise<Contract | undefined>;
updateContract(id: number, data: Partial<Contract>): Promise<Contract | undefined>;
getContractByDocusignEnvelopeId(envelopeId: string): Promise<Contract | undefined>;
getContractCount(filters?: { status?: string }): Promise<number>;

// Material and Vendor methods
createVendor(vendor: InsertVendor): Promise<Vendor>;
getVendors(activeOnly?: boolean): Promise<Vendor[]>;
getVendor(id: number): Promise<Vendor | undefined>;
updateVendor(id: number, data: Partial<Vendor>): Promise<Vendor | undefined>;

createMaterial(material: InsertMaterial): Promise<Material>;
getMaterials(filters?: { category?: string; lowStock?: boolean; page?: number; limit?: number }): Promise<Material[]>;
getMaterial(id: number): Promise<Material | undefined>;
updateMaterial(id: number, data: Partial<Material>): Promise<Material | undefined>;
getMaterialCount(filters?: { category?: string; lowStock?: boolean }): Promise<number>;

createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
getPurchaseOrders(filters?: { vendorId?: number; status?: string; page?: number; limit?: number }): Promise<PurchaseOrder[]>;
getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
updatePurchaseOrder(id: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined>;

// HubSpot sync methods
createHubspotSyncLog(log: InsertHubspotSyncLog): Promise<HubspotSyncLog>;
getHubspotSyncLogs(recordType?: string, recordId?: number): Promise<HubspotSyncLog[]>;

// Dashboard methods
getQuoteRequestCount(filters?: { status?: string; assignedTo?: number | null }): Promise<number>;
getRecentActivity(employeeId: number, limit: number): Promise<any[]>;
```

### 5.6 Employee Portal API Routes

Create `/home/hassan/projects/TsgFulfillmentRedesign/server/routes/employee.ts`:

```typescript
import type { Express } from "express";
import { verifyToken, requireRole, generateToken } from "../auth";
import { storage } from "../storage";
import bcrypt from 'bcryptjs';
import hubspotService from "../services/hubspot";
import docusignService from "../services/docusign";
import { 
  insertEmployeeSchema,
  insertQuoteSchema,
  insertContractSchema,
  insertVendorSchema,
  insertMaterialSchema,
  insertPurchaseOrderSchema
} from "@shared/schema";

const handleError = (res: any, error: any, message: string = 'An error occurred') => {
  console.error(`Error: ${message}`, error);
  res.status(400).json({
    message,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
};

export function registerEmployeeRoutes(app: Express) {
  
  // AUTHENTICATION ENDPOINTS
  
  // Employee login
  app.post('/api/employee/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user has employee record
      const employee = await storage.getEmployeeByUserId(user.id);
      if (!employee || !employee.isActive) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const token = generateToken(user);
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
          position: employee.position,
          permissions: employee.permissions
        }
      });
    } catch (error) {
      handleError(res, error, 'Login failed');
    }
  });

  // Get current employee profile
  app.get('/api/employee/profile', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const employee = await storage.getEmployeeByUserId(user.id);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }

      res.json({ data: employee });
    } catch (error) {
      handleError(res, error, 'Error fetching profile');
    }
  });

  // QUOTE REQUEST MANAGEMENT
  
  // Get all quote requests with filtering and assignment
  app.get('/api/employee/quote-requests', verifyToken, async (req, res) => {
    try {
      const { status, assignedTo, page = 1, limit = 20 } = req.query;
      
      const quoteRequests = await storage.getQuoteRequests({
        status: status as string,
        assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: quoteRequests });
    } catch (error) {
      handleError(res, error, 'Error fetching quote requests');
    }
  });

  // Assign quote request to employee
  app.patch('/api/employee/quote-requests/:id/assign', 
    verifyToken, 
    requireRole(['admin', 'sales_manager']),
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { assignedTo } = req.body;
        
        const updatedQuoteRequest = await storage.updateQuoteRequest(id, {
          assignedTo: assignedTo,
          status: 'assigned'
        });

        if (!updatedQuoteRequest) {
          return res.status(404).json({ message: 'Quote request not found' });
        }

        // Sync to HubSpot
        try {
          await hubspotService.syncQuoteRequestToDeal(id);
        } catch (syncError) {
          console.warn('HubSpot sync failed:', syncError);
        }

        res.json({ 
          message: 'Quote request assigned successfully',
          data: updatedQuoteRequest 
        });
      } catch (error) {
        handleError(res, error, 'Error assigning quote request');
      }
    }
  );

  // QUOTE MANAGEMENT
  
  // Create quote from quote request
  app.post('/api/employee/quotes', verifyToken, async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const user = (req as any).user;
      
      // Generate quote number
      const quoteNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const quote = await storage.createQuote({
        ...validatedData,
        quoteNumber,
        createdBy: user.id,
        status: 'draft'
      });

      res.status(201).json({
        message: 'Quote created successfully',
        data: quote
      });
    } catch (error) {
      handleError(res, error, 'Error creating quote');
    }
  });

  // Get all quotes with filtering
  app.get('/api/employee/quotes', verifyToken, async (req, res) => {
    try {
      const { assignedTo, status, page = 1, limit = 20 } = req.query;
      
      const quotes = await storage.getQuotes({
        assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: quotes });
    } catch (error) {
      handleError(res, error, 'Error fetching quotes');
    }
  });

  // Update quote
  app.patch('/api/employee/quotes/:id', verifyToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedQuote = await storage.updateQuote(id, req.body);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: 'Quote not found' });
      }

      res.json({
        message: 'Quote updated successfully',
        data: updatedQuote
      });
    } catch (error) {
      handleError(res, error, 'Error updating quote');
    }
  });

  // Send contract via DocuSign
  app.post('/api/employee/quotes/:id/send-contract', 
    verifyToken,
    requireRole(['admin', 'sales_manager', 'sales_rep']),
    async (req, res) => {
      try {
        const quoteId = parseInt(req.params.id);
        const { templateId, signerName, signerEmail, signerCompany } = req.body;
        
        const result = await docusignService.sendContractForSignature(quoteId, templateId, {
          name: signerName,
          email: signerEmail,
          company: signerCompany
        });

        res.json({
          message: 'Contract sent successfully',
          data: result
        });
      } catch (error) {
        handleError(res, error, 'Error sending contract');
      }
    }
  );

  // CONTRACT MANAGEMENT
  
  // Get all contracts
  app.get('/api/employee/contracts', verifyToken, async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      const contracts = await storage.getContracts({
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: contracts });
    } catch (error) {
      handleError(res, error, 'Error fetching contracts');
    }
  });

  // MATERIAL AND VENDOR MANAGEMENT
  
  // Create vendor
  app.post('/api/employee/vendors', 
    verifyToken, 
    requireRole(['admin', 'inventory_manager']),
    async (req, res) => {
      try {
        const validatedData = insertVendorSchema.parse(req.body);
        const vendor = await storage.createVendor(validatedData);
        
        res.status(201).json({
          message: 'Vendor created successfully',
          data: vendor
        });
      } catch (error) {
        handleError(res, error, 'Error creating vendor');
      }
    }
  );

  // Get all vendors
  app.get('/api/employee/vendors', verifyToken, async (req, res) => {
    try {
      const { activeOnly = true } = req.query;
      const vendors = await storage.getVendors(activeOnly === 'true');
      
      res.json({ data: vendors });
    } catch (error) {
      handleError(res, error, 'Error fetching vendors');
    }
  });

  // Create material
  app.post('/api/employee/materials', 
    verifyToken, 
    requireRole(['admin', 'inventory_manager']),
    async (req, res) => {
      try {
        const validatedData = insertMaterialSchema.parse(req.body);
        const material = await storage.createMaterial(validatedData);
        
        res.status(201).json({
          message: 'Material created successfully',
          data: material
        });
      } catch (error) {
        handleError(res, error, 'Error creating material');
      }
    }
  );

  // Get materials with low stock alerts
  app.get('/api/employee/materials', verifyToken, async (req, res) => {
    try {
      const { category, lowStock, page = 1, limit = 50 } = req.query;
      
      const materials = await storage.getMaterials({
        category: category as string,
        lowStock: lowStock === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ data: materials });
    } catch (error) {
      handleError(res, error, 'Error fetching materials');
    }
  });

  // Create purchase order
  app.post('/api/employee/purchase-orders', 
    verifyToken, 
    requireRole(['admin', 'inventory_manager']),
    async (req, res) => {
      try {
        const validatedData = insertPurchaseOrderSchema.parse(req.body);
        const user = (req as any).user;
        
        // Generate PO number
        const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        const purchaseOrder = await storage.createPurchaseOrder({
          ...validatedData,
          poNumber,
          createdBy: user.id,
          status: 'pending'
        });

        res.status(201).json({
          message: 'Purchase order created successfully',
          data: purchaseOrder
        });
      } catch (error) {
        handleError(res, error, 'Error creating purchase order');
      }
    }
  );

  // Get employees for assignment dropdown
  app.get('/api/employee/employees', verifyToken, async (req, res) => {
    try {
      const { department } = req.query;
      
      const employees = department 
        ? await storage.getEmployeesByDepartment(department as string)
        : await storage.getEmployees();

      res.json({ data: employees });
    } catch (error) {
      handleError(res, error, 'Error fetching employees');
    }
  });

  // DASHBOARD AND ANALYTICS
  
  // Get employee dashboard data
  app.get('/api/employee/dashboard', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const employee = await storage.getEmployeeByUserId(user.id);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Get dashboard metrics based on role
      const dashboardData = {
        employee: employee,
        metrics: {
          assignedQuotes: await storage.getQuoteCount({ assignedTo: employee.id }),
          activeContracts: await storage.getContractCount({ status: 'active' }),
          pendingQuoteRequests: await storage.getQuoteRequestCount({ 
            status: 'new', 
            assignedTo: null 
          }),
          lowStockItems: await storage.getMaterialCount({ lowStock: true })
        },
        recentActivity: await storage.getRecentActivity(employee.id, 10)
      };

      res.json({ data: dashboardData });
    } catch (error) {
      handleError(res, error, 'Error fetching dashboard data');
    }
  });

  // HUBSPOT WEBHOOK ENDPOINT
  app.post('/api/employee/webhooks/hubspot', async (req, res) => {
    try {
      const { subscriptionType, objectId, propertyName, propertyValue } = req.body;
      
      if (subscriptionType === 'deal.propertyChange') {
        await hubspotService.syncDealFromHubSpot(objectId);
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('HubSpot webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // DOCUSIGN WEBHOOK ENDPOINT
  app.post('/api/employee/webhooks/docusign', async (req, res) => {
    try {
      const { envelopeSummary } = req.body;
      
      if (envelopeSummary && envelopeSummary.status) {
        await docusignService.handleWebhook(
          envelopeSummary.envelopeId, 
          envelopeSummary.status
        );
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('DocuSign webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
}
```

---

## 6. FRONTEND IMPLEMENTATION

### 6.1 Authentication Hook

Create `/home/hassan/projects/TsgFulfillmentRedesign/client/src/hooks/use-employee-auth.ts`:

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  permissions: Record<string, any>;
}

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useEmployeeAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('employee_token')
  );
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/employee/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setEmployee(data.employee);
      setToken(data.token);
      localStorage.setItem('employee_token', data.token);
      
      // Set default authorization header
      queryClient.setDefaultOptions({
        queries: {
          meta: {
            headers: { Authorization: `Bearer ${data.token}` }
          }
        }
      });
    }
  });

  // Profile query
  const { data: profileData } = useQuery({
    queryKey: ['employee-profile'],
    queryFn: async () => {
      const response = await fetch('/api/employee/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (profileData?.data) {
      setEmployee(profileData.data);
    }
    setIsLoading(false);
  }, [profileData]);

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    setUser(null);
    setEmployee(null);
    setToken(null);
    localStorage.removeItem('employee_token');
    queryClient.clear();
  };

  const value: AuthContextType = {
    user,
    employee,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!employee,
    isLoading: isLoading || loginMutation.isPending
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 6.2 Employee Portal Layout

Create `/home/hassan/projects/TsgFulfillmentRedesign/client/src/components/employee/Layout.tsx`:

```typescript
import React from 'react';
import { Link, useLocation } from 'wouter';
import { useEmployeeAuth } from '@/hooks/use-employee-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const { employee, logout } = useEmployeeAuth();
  const [location] = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/employee',
      icon: LayoutDashboard,
      active: location === '/employee'
    },
    {
      name: 'Quote Requests',
      href: '/employee/quote-requests',
      icon: FileText,
      active: location.startsWith('/employee/quote-requests')
    },
    {
      name: 'Quotes & Contracts',
      href: '/employee/quotes',
      icon: Users,
      active: location.startsWith('/employee/quotes')
    },
    {
      name: 'Materials',
      href: '/employee/materials',
      icon: Package,
      active: location.startsWith('/employee/materials')
    },
    {
      name: 'Purchase Orders',
      href: '/employee/purchase-orders',
      icon: ShoppingCart,
      active: location.startsWith('/employee/purchase-orders')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/assets/tsg-logo.png" 
              alt="TSG Fulfillment" 
              className="h-8"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              Employee Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {employee?.firstName} {employee?.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {employee?.position}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 6.3 Employee Login Page

Create `/home/hassan/projects/TsgFulfillmentRedesign/client/src/pages/employee/Login.tsx`:

```typescript
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useEmployeeAuth } from '@/hooks/use-employee-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function EmployeeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, isAuthenticated } = useEmployeeAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation('/employee');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(username, password);
      toast({
        title: "Login successful",
        description: "Welcome to the Employee Portal"
      });
      setLocation('/employee');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/assets/tsg-logo.png" 
            alt="TSG Fulfillment" 
            className="h-12 mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Employee Portal</CardTitle>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.4 Employee Portal Dashboard

Create `/home/hassan/projects/TsgFulfillmentRedesign/client/src/pages/employee/Dashboard.tsx`:

```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEmployeeAuth } from '@/hooks/use-employee-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Package, AlertTriangle } from 'lucide-react';

export default function EmployeeDashboard() {
  const { token } = useEmployeeAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/employee/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.data?.metrics || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {dashboardData?.data?.employee?.firstName}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Quotes
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.assignedQuotes || 0}</div>
            <p className="text-xs text-gray-600">
              Active quotes requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeContracts || 0}</div>
            <p className="text-xs text-gray-600">
              Contracts in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingQuoteRequests || 0}</div>
            <p className="text-xs text-gray-600">
              New quote requests to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockItems || 0}</div>
            <p className="text-xs text-gray-600">
              Items requiring reorder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.data?.recentActivity?.length > 0 ? (
              dashboardData.data.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.5 Quote Requests Management Page

Create `/home/hassan/projects/TsgFulfillmentRedesign/client/src/pages/employee/QuoteRequests.tsx`:

```typescript
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEmployeeAuth } from '@/hooks/use-employee-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, UserPlus } from 'lucide-react';

export default function QuoteRequests() {
  const { token, employee } = useEmployeeAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Fetch quote requests
  const { data: quoteRequestsData, isLoading } = useQuery({
    queryKey: ['quote-requests', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/employee/quote-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch quote requests');
      return response.json();
    }
  });

  // Fetch employees for assignment
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/employee/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    }
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ quoteRequestId, assignedTo }: { quoteRequestId: number; assignedTo: number }) => {
      const response = await fetch(`/api/employee/quote-requests/${quoteRequestId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assignedTo })
      });

      if (!response.ok) throw new Error('Failed to assign quote request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      setAssignDialogOpen(false);
      toast({
        title: "Success",
        description: "Quote request assigned successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAssign = (assignedTo: number) => {
    if (selectedRequest) {
      assignMutation.mutate({
        quoteRequestId: selectedRequest.id,
        assignedTo
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-orange-100 text-orange-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = quoteRequestsData?.data?.filter((request: any) =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quote Requests</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request: any) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{request.name}</h3>
                    <Badge className={getStatusBadgeColor(request.status)}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Company:</span> {request.company}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {request.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {request.phone}
                    </div>
                    <div>
                      <span className="font-medium">Service:</span> {request.service}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Current Shipments:</span> {request.currentShipments}
                    </div>
                    <div>
                      <span className="font-medium">Expected Shipments:</span> {request.expectedShipments}
                    </div>
                  </div>

                  {request.message && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Message:</span>
                      <p className="text-gray-600 mt-1">{request.message}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Received: {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {request.status === 'new' && (
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAssignDialogOpen(true);
                      }}
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No quote requests found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Quote Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Request Details</Label>
                <p className="text-sm text-gray-600">
                  {selectedRequest.name} - {selectedRequest.company}
                </p>
              </div>

              <div>
                <Label htmlFor="assignee">Assign to Employee</Label>
                <Select onValueChange={(value) => handleAssign(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesData?.data?.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.firstName} {emp.lastName} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 7. DEPLOYMENT INSTRUCTIONS

### 7.1 Pre-Deployment Checklist

Execute these steps in exact order:

1. **Database Migration**
   ```bash
   # Connect to your PostgreSQL database and run the SQL commands from section 3.1
   psql -d your_database_name -f database_migration.sql
   ```

2. **Environment Variables**
   ```bash
   # Add all variables from section 4.1 to your .env file
   # Obtain actual API keys from HubSpot and DocuSign
   ```

3. **Install Dependencies**
   ```bash
   npm install passport passport-local express-session bcryptjs jsonwebtoken
   npm install @hubspot/api-client docusign-esign
   npm install @types/passport @types/passport-local @types/express-session @types/bcryptjs @types/jsonwebtoken --save-dev
   ```

4. **Create Required Directories**
   ```bash
   mkdir -p keys
   mkdir -p logs
   ```

5. **Build and Test**
   ```bash
   npm run build
   npm run test
   npm run lint
   ```

### 7.2 Production Deployment

1. **Update server/index.ts**
   
   Add these imports at the top:
   ```typescript
   import session from 'express-session';
   import passport from './auth';
   import { registerEmployeeRoutes } from './routes/employee';
   ```

   Add middleware configuration after existing middleware:
   ```typescript
   app.use(session({
     secret: process.env.EMPLOYEE_PORTAL_SECRET || 'fallback-secret',
     resave: false,
     saveUninitialized: false,
     cookie: { secure: process.env.NODE_ENV === 'production' }
   }));

   app.use(passport.initialize());
   app.use(passport.session());

   // Register employee routes
   registerEmployeeRoutes(app);
   ```

2. **Update client routing in App.tsx**
   ```typescript
   import { Route } from 'wouter';
   import EmployeeLogin from '@/pages/employee/Login';
   import EmployeeDashboard from '@/pages/employee/Dashboard';
   import QuoteRequests from '@/pages/employee/QuoteRequests';
   import EmployeeLayout from '@/components/employee/Layout';
   import { AuthProvider } from '@/hooks/use-employee-auth';

   // Add these routes
   <Route path="/employee/login" component={EmployeeLogin} />
   <Route path="/employee/*">
     <AuthProvider>
       <EmployeeLayout>
         <Route path="/employee" component={EmployeeDashboard} />
         <Route path="/employee/quote-requests" component={QuoteRequests} />
         {/* Add other employee routes */}
       </EmployeeLayout>
     </AuthProvider>
   </Route>
   ```

3. **Create Supabase Storage Bucket**
   ```sql
   -- Create contracts bucket in Supabase
   insert into storage.buckets (id, name, public)
   values ('contracts', 'contracts', false);

   -- Set up RLS policies
   create policy "Authenticated users can upload contracts" on storage.objects
   for insert with check (bucket_id = 'contracts' and auth.role() = 'authenticated');

   create policy "Authenticated users can view contracts" on storage.objects
   for select using (bucket_id = 'contracts' and auth.role() = 'authenticated');
   ```

### 7.3 DocuSign Setup

1. **Generate RSA Key Pair**
   ```bash
   # Generate private key
   openssl genrsa -out keys/docusign-private.key 2048
   
   # Generate public key
   openssl rsa -in keys/docusign-private.key -pubout -out keys/docusign-public.key
   ```

2. **DocuSign App Configuration**
   - Upload public key to DocuSign app
   - Set redirect URI to your domain
   - Grant consent for application

### 7.4 HubSpot Setup

1. **Create Private App**
   - Go to HubSpot Developer Account
   - Create new private app
   - Set scopes: contacts, deals, companies
   - Generate access token

2. **Webhook Configuration**
   ```json
   {
     "subscriptionDetails": {
       "subscriptionType": "deal.propertyChange",
       "propertyName": "dealstage"
     },
     "webhookUrl": "https://your-domain.com/api/employee/webhooks/hubspot"
   }
   ```

---

## 8. TESTING PROCEDURES

### 8.1 Create Test Data

1. **Create Test Employee Account**
   ```sql
   -- Insert test user
   INSERT INTO users (username, password, role) 
   VALUES ('test.employee', '$2a$10$your_bcrypt_hash_here', 'sales_rep');

   -- Insert test employee
   INSERT INTO employees (user_id, employee_id, first_name, last_name, email, department, position, hire_date)
   VALUES (1, 'EMP001', 'Test', 'Employee', 'test@tsgfulfillment.com', 'Sales', 'Sales Representative', '2025-01-01');
   ```

2. **Create Test Quote Request**
   ```sql
   INSERT INTO quote_requests (name, email, phone, company, service, current_shipments, expected_shipments, consent)
   VALUES ('John Doe', 'john@example.com', '555-1234', 'Test Company', 'Order Fulfillment', '1-50', '101-250', true);
   ```

### 8.2 API Testing

1. **Test Authentication**
   ```bash
   curl -X POST http://localhost:5000/api/employee/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test.employee","password":"your_test_password"}'
   ```

2. **Test Quote Request Assignment**
   ```bash
   # Use the token from login response
   curl -X PATCH http://localhost:5000/api/employee/quote-requests/1/assign \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"assignedTo":1}'
   ```

3. **Test Dashboard Endpoint**
   ```bash
   curl -X GET http://localhost:5000/api/employee/dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### 8.3 Frontend Testing

1. **Login Flow**
   - Navigate to `/employee/login`
   - Enter test credentials
   - Verify redirect to dashboard

2. **Quote Request Management**
   - Navigate to `/employee/quote-requests`
   - Verify list displays
   - Test assignment functionality

3. **Authentication Persistence**
   - Login and refresh page
   - Verify user remains logged in
   - Test logout functionality

### 8.4 Integration Testing

1. **HubSpot Integration**
   ```bash
   # Test webhook endpoint
   curl -X POST http://localhost:5000/api/employee/webhooks/hubspot \
     -H "Content-Type: application/json" \
     -d '{"subscriptionType":"deal.propertyChange","objectId":"123","propertyName":"dealstage"}'
   ```

2. **DocuSign Integration**
   ```bash
   # Test webhook endpoint
   curl -X POST http://localhost:5000/api/employee/webhooks/docusign \
     -H "Content-Type: application/json" \
     -d '{"envelopeSummary":{"envelopeId":"test-123","status":"completed"}}'
   ```

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Access Control Matrix

| Role | Quote Requests | Quotes | Contracts | Materials | Purchase Orders |
|------|----------------|--------|-----------|-----------|-----------------|
| Sales Rep | View Assigned | CRUD Own | View Own | Read Only | None |
| Sales Manager | CRUD All | CRUD All | CRUD All | Read Only | None |
| Inventory Manager | Read Only | Read Only | None | CRUD All | CRUD All |
| Admin | CRUD All | CRUD All | CRUD All | CRUD All | CRUD All |

### 9.2 Data Protection

1. **Encryption at Rest**
   - All sensitive data encrypted in database
   - Document storage encrypted in Supabase
   - Environment variables secured

2. **API Security**
   - JWT tokens expire after 8 hours
   - Rate limiting on all endpoints
   - Input validation on all forms
   - CORS configuration for production

3. **Authentication Security**
   - Bcrypt password hashing
   - Session management
   - Logout token invalidation

### 9.3 Audit Trail

1. **Database Triggers**
   ```sql
   -- Create audit log table
   CREATE TABLE audit_log (
     id SERIAL PRIMARY KEY,
     table_name VARCHAR(50) NOT NULL,
     record_id INTEGER NOT NULL,
     action VARCHAR(20) NOT NULL,
     old_values JSONB,
     new_values JSONB,
     user_id INTEGER REFERENCES users(id),
     timestamp TIMESTAMP DEFAULT NOW()
   );

   -- Create audit trigger function
   CREATE OR REPLACE FUNCTION audit_trigger_function()
   RETURNS TRIGGER AS $$
   BEGIN
     IF TG_OP = 'INSERT' THEN
       INSERT INTO audit_log (table_name, record_id, action, new_values, user_id)
       VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), NEW.updated_by);
       RETURN NEW;
     ELSIF TG_OP = 'UPDATE' THEN
       INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
       VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.updated_by);
       RETURN NEW;
     ELSIF TG_OP = 'DELETE' THEN
       INSERT INTO audit_log (table_name, record_id, action, old_values, user_id)
       VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), OLD.updated_by);
       RETURN OLD;
     END IF;
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql;
   ```

---

## 10. MAINTENANCE AND MONITORING

### 10.1 Required Monitoring

1. **Log Files to Monitor**
   ```bash
   # Application logs
   tail -f logs/employee-portal.log
   
   # Authentication logs
   tail -f logs/auth.log
   
   # Integration logs
   tail -f logs/hubspot-sync.log
   tail -f logs/docusign-webhook.log
   ```

2. **Database Health Checks**
   ```sql
   -- Check sync log for errors
   SELECT * FROM hubspot_sync_log WHERE sync_status = 'error' ORDER BY synced_at DESC LIMIT 10;

   -- Check for unassigned quote requests
   SELECT COUNT(*) FROM quote_requests WHERE assigned_to IS NULL AND status = 'new';

   -- Check for low stock items
   SELECT * FROM materials WHERE current_stock <= reorder_point AND is_active = true;

   -- Check active employee sessions
   SELECT COUNT(*) FROM users u 
   JOIN employees e ON u.id = e.user_id 
   WHERE e.is_active = true AND u.last_login > NOW() - INTERVAL '24 hours';
   ```

3. **Performance Metrics**
   ```sql
   -- Average response times
   SELECT 
     endpoint,
     AVG(response_time) as avg_response_time,
     COUNT(*) as request_count
   FROM api_metrics 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY endpoint;

   -- Error rates
   SELECT 
     DATE(created_at) as date,
     COUNT(*) FILTER (WHERE status_code >= 400) as errors,
     COUNT(*) as total_requests,
     ROUND(COUNT(*) FILTER (WHERE status_code >= 400) * 100.0 / COUNT(*), 2) as error_rate
   FROM api_metrics 
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY DATE(created_at);
   ```

### 10.2 Backup Procedures

1. **Daily Database Backup**
   ```bash
   # Add to cron job (0 2 * * *)
   #!/bin/bash
   DB_NAME="your_database_name"
   BACKUP_DIR="/backups/employee_portal"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   pg_dump $DB_NAME > $BACKUP_DIR/employee_portal_$DATE.sql
   
   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "employee_portal_*.sql" -mtime +7 -delete
   ```

2. **Document Storage Backup**
   ```bash
   # Backup Supabase contracts bucket
   # Use Supabase CLI to sync contracts
   supabase storage download --recursive contracts ./backups/contracts/
   ```

### 10.3 Maintenance Tasks

1. **Weekly Tasks**
   ```sql
   -- Clean up old sync logs (keep 30 days)
   DELETE FROM hubspot_sync_log WHERE synced_at < NOW() - INTERVAL '30 days';

   -- Update material stock levels
   UPDATE materials SET current_stock = current_stock - consumed_quantity
   FROM (
     SELECT material_id, SUM(quantity) as consumed_quantity
     FROM purchase_order_items poi
     JOIN purchase_orders po ON poi.purchase_order_id = po.id
     WHERE po.status = 'completed' AND po.actual_delivery_date > NOW() - INTERVAL '7 days'
     GROUP BY material_id
   ) consumed ON materials.id = consumed.material_id;
   ```

2. **Monthly Tasks**
   ```sql
   -- Archive old quote requests (completed > 90 days ago)
   INSERT INTO quote_requests_archive 
   SELECT * FROM quote_requests 
   WHERE status = 'completed' AND updated_at < NOW() - INTERVAL '90 days';

   DELETE FROM quote_requests 
   WHERE status = 'completed' AND updated_at < NOW() - INTERVAL '90 days';

   -- Generate monthly reports
   SELECT 
     e.first_name, e.last_name,
     COUNT(q.id) as quotes_created,
     COUNT(c.id) as contracts_signed,
     AVG(q.total_amount) as avg_quote_value
   FROM employees e
   LEFT JOIN quotes q ON e.id = q.created_by AND q.created_at > DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
   LEFT JOIN contracts c ON q.id = c.quote_id AND c.status = 'signed'
   WHERE e.department = 'Sales' AND e.is_active = true
   GROUP BY e.id, e.first_name, e.last_name;
   ```

### 10.4 Troubleshooting Guide

1. **Common Issues**

   **Login Failures**
   ```bash
   # Check user exists and is active
   SELECT u.username, u.role, e.is_active 
   FROM users u 
   LEFT JOIN employees e ON u.id = e.user_id 
   WHERE u.username = 'problematic_username';
   
   # Check password hash
   SELECT password FROM users WHERE username = 'problematic_username';
   ```

   **HubSpot Sync Failures**
   ```bash
   # Check recent sync errors
   SELECT * FROM hubspot_sync_log 
   WHERE sync_status = 'error' 
   ORDER BY synced_at DESC LIMIT 5;
   
   # Test HubSpot API connectivity
   curl -H "Authorization: Bearer YOUR_HUBSPOT_TOKEN" \
        "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
   ```

   **DocuSign Integration Issues**
   ```bash
   # Check DocuSign webhook logs
   grep "DocuSign webhook" logs/employee-portal.log | tail -10
   
   # Verify DocuSign configuration
   echo $DOCUSIGN_INTEGRATION_KEY
   echo $DOCUSIGN_ACCOUNT_ID
   ```

2. **Performance Issues**
   ```sql
   -- Check for slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   WHERE mean_time > 1000 
   ORDER BY mean_time DESC;

   -- Check database connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check table sizes
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

---

This implementation guide provides complete, step-by-step instructions for building the Employee Portal. Each section must be completed in the exact order specified, with no steps skipped or assumed. The development team should follow these instructions precisely to ensure successful implementation.

**Next Steps After Implementation:**
1. Complete database migration
2. Set up API integrations (HubSpot, DocuSign)
3. Deploy backend services
4. Deploy frontend components
5. Configure monitoring and logging
6. Train employees on new system
7. Establish maintenance procedures

The Employee Portal will provide TSG Fulfillment with a comprehensive internal management system that streamlines quote management, automates contract processing, and provides robust inventory tracking capabilities.