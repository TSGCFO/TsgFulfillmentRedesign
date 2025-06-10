import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { 
  users, 
  employees, 
  quoteRequests, 
  quotes, 
  contracts, 
  vendors, 
  materials, 
  purchaseOrders, 
  purchaseOrderItems,
  hubspotSyncLog 
} from '../../shared/schema';

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/tsg_test';

describe('Database Integration Tests', () => {
  let testDb: ReturnType<typeof drizzle>;
  let testClient: postgres.Sql;

  beforeAll(async () => {
    // Set up test database connection
    testClient = postgres(TEST_DATABASE_URL);
    testDb = drizzle(testClient);

    // Run migrations on test database
    await migrate(testDb, { migrationsFolder: './drizzle/migrations' });
  });

  afterAll(async () => {
    // Clean up test database connection
    await testClient.end();
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await testDb.delete(hubspotSyncLog);
    await testDb.delete(purchaseOrderItems);
    await testDb.delete(purchaseOrders);
    await testDb.delete(materials);
    await testDb.delete(vendors);
    await testDb.delete(contracts);
    await testDb.delete(quotes);
    await testDb.delete(quoteRequests);
    await testDb.delete(employees);
    await testDb.delete(users);
  });

  describe('User and Employee Operations', () => {
    it('should create user and employee with proper relationships', async () => {
      // Create a user
      const [user] = await testDb.insert(users).values({
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        email: 'test@example.com',
        role: 'sales_rep'
      }).returning();

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('sales_rep');

      // Create associated employee
      const [employee] = await testDb.insert(employees).values({
        userId: user.id,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Sales',
        position: 'Sales Representative',
        email: 'john.doe@tsg.com',
        isActive: true,
        permissions: {}
      }).returning();

      expect(employee).toBeDefined();
      expect(employee.userId).toBe(user.id);
      expect(employee.firstName).toBe('John');
      expect(employee.isActive).toBe(true);

      // Test relationship query
      const userWithEmployee = await storage.getEmployeeByUserId(user.id);
      expect(userWithEmployee).toBeDefined();
      expect(userWithEmployee!.firstName).toBe('John');
    });

    it('should enforce unique constraints', async () => {
      // Create first user
      await testDb.insert(users).values({
        username: 'unique_user',
        password: 'hash',
        email: 'unique@example.com',
        role: 'admin'
      });

      // Attempt to create user with same username should fail
      await expect(async () => {
        await testDb.insert(users).values({
          username: 'unique_user',
          password: 'hash2',
          email: 'different@example.com',
          role: 'user'
        });
      }).rejects.toThrow();
    });

    it('should handle user authentication flow', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [user] = await testDb.insert(users).values({
        username: 'authtest',
        password: hashedPassword,
        email: 'auth@test.com',
        role: 'sales_rep'
      }).returning();

      // Create employee
      await testDb.insert(employees).values({
        userId: user.id,
        employeeId: 'EMP002',
        firstName: 'Auth',
        lastName: 'Test',
        department: 'Sales',
        position: 'Representative',
        email: 'auth.test@tsg.com',
        isActive: true,
        permissions: {}
      });

      // Test storage methods
      const foundUser = await storage.getUserByUsername('authtest');
      expect(foundUser).toBeDefined();
      expect(foundUser!.username).toBe('authtest');

      const foundEmployee = await storage.getEmployeeByUserId(user.id);
      expect(foundEmployee).toBeDefined();
      expect(foundEmployee!.firstName).toBe('Auth');

      // Test password verification
      const isValid = await bcrypt.compare(password, foundUser!.password);
      expect(isValid).toBe(true);
    });
  });

  describe('Quote Request Operations', () => {
    let testUser: any;
    let testEmployee: any;

    beforeEach(async () => {
      // Create test user and employee
      [testUser] = await testDb.insert(users).values({
        username: 'quotetest',
        password: 'hash',
        email: 'quote@test.com',
        role: 'sales_rep'
      }).returning();

      [testEmployee] = await testDb.insert(employees).values({
        userId: testUser.id,
        employeeId: 'EMP003',
        firstName: 'Quote',
        lastName: 'Tester',
        department: 'Sales',
        position: 'Representative',
        email: 'quote.tester@tsg.com',
        isActive: true,
        permissions: {}
      }).returning();
    });

    it('should create and manage quote requests', async () => {
      // Create quote request
      const [quoteRequest] = await testDb.insert(quoteRequests).values({
        name: 'John Smith',
        email: 'john.smith@client.com',
        company: 'Client Corp',
        phone: '555-0123',
        message: 'Need fulfillment services',
        servicesRequested: { fulfillment: true, warehousing: false },
        urgency: 'medium',
        status: 'new'
      }).returning();

      expect(quoteRequest).toBeDefined();
      expect(quoteRequest.name).toBe('John Smith');
      expect(quoteRequest.status).toBe('new');

      // Test fetching quote requests
      const requests = await storage.getQuoteRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].name).toBe('John Smith');

      // Test assignment
      const updatedRequest = await storage.updateQuoteRequest(quoteRequest.id, {
        assignedTo: testEmployee.id,
        status: 'assigned'
      });

      expect(updatedRequest).toBeDefined();
      expect(updatedRequest!.assignedTo).toBe(testEmployee.id);
      expect(updatedRequest!.status).toBe('assigned');
    });

    it('should filter quote requests by status and assignment', async () => {
      // Create multiple quote requests
      await testDb.insert(quoteRequests).values([
        {
          name: 'Client A',
          email: 'a@client.com',
          company: 'Company A',
          status: 'new',
          urgency: 'high'
        },
        {
          name: 'Client B', 
          email: 'b@client.com',
          company: 'Company B',
          status: 'assigned',
          assignedTo: testEmployee.id,
          urgency: 'medium'
        },
        {
          name: 'Client C',
          email: 'c@client.com', 
          company: 'Company C',
          status: 'quoted',
          assignedTo: testEmployee.id,
          urgency: 'low'
        }
      ]);

      // Test filtering by status
      const newRequests = await storage.getQuoteRequests({ status: 'new' });
      expect(newRequests).toHaveLength(1);
      expect(newRequests[0].name).toBe('Client A');

      // Test filtering by assignment
      const assignedRequests = await storage.getQuoteRequests({ assignedTo: testEmployee.id });
      expect(assignedRequests).toHaveLength(2);

      // Test combined filtering
      const assignedAndQuoted = await storage.getQuoteRequests({ 
        status: 'quoted', 
        assignedTo: testEmployee.id 
      });
      expect(assignedAndQuoted).toHaveLength(1);
      expect(assignedAndQuoted[0].name).toBe('Client C');
    });
  });

  describe('Quote and Contract Operations', () => {
    let testUser: any;
    let testEmployee: any;
    let testQuoteRequest: any;

    beforeEach(async () => {
      [testUser] = await testDb.insert(users).values({
        username: 'contracttest',
        password: 'hash',
        email: 'contract@test.com',
        role: 'sales_rep'
      }).returning();

      [testEmployee] = await testDb.insert(employees).values({
        userId: testUser.id,
        employeeId: 'EMP004',
        firstName: 'Contract',
        lastName: 'Tester',
        department: 'Sales',
        position: 'Representative',
        email: 'contract.tester@tsg.com',
        isActive: true,
        permissions: {}
      }).returning();

      [testQuoteRequest] = await testDb.insert(quoteRequests).values({
        name: 'Quote Client',
        email: 'quote@client.com',
        company: 'Quote Corp',
        status: 'assigned',
        assignedTo: testEmployee.id,
        urgency: 'medium'
      }).returning();
    });

    it('should create quotes from quote requests', async () => {
      const quoteData = {
        quoteRequestId: testQuoteRequest.id,
        quoteNumber: 'QUO-2025-TEST1',
        clientName: 'Quote Client',
        clientEmail: 'quote@client.com',
        clientCompany: 'Quote Corp',
        servicesQuoted: { fulfillment: true, warehousing: true },
        pricingData: { 
          basePrice: 1000, 
          additionalServices: 500, 
          total: 1500 
        },
        createdBy: testUser.id,
        status: 'draft'
      };

      const quote = await storage.createQuote(quoteData);
      expect(quote).toBeDefined();
      expect(quote.quoteNumber).toBe('QUO-2025-TEST1');
      expect(quote.clientName).toBe('Quote Client');
      expect(quote.status).toBe('draft');

      // Test quote retrieval
      const quotes = await storage.getQuotes({ assignedTo: testEmployee.id });
      expect(quotes).toHaveLength(1);
      expect(quotes[0].quoteNumber).toBe('QUO-2025-TEST1');

      // Test quote update
      const updatedQuote = await storage.updateQuote(quote.id, {
        status: 'sent',
        totalAmount: 1500
      });

      expect(updatedQuote).toBeDefined();
      expect(updatedQuote!.status).toBe('sent');
      expect(updatedQuote!.totalAmount).toBe(1500);
    });

    it('should handle quote lifecycle', async () => {
      // Create quote
      const quote = await storage.createQuote({
        quoteRequestId: testQuoteRequest.id,
        quoteNumber: 'QUO-2025-LIFECYCLE',
        clientName: 'Lifecycle Client',
        clientEmail: 'lifecycle@client.com',
        clientCompany: 'Lifecycle Corp',
        servicesQuoted: { fulfillment: true },
        pricingData: { basePrice: 2000, total: 2000 },
        createdBy: testUser.id,
        status: 'draft'
      });

      // Progress through statuses
      await storage.updateQuote(quote.id, { status: 'sent' });
      let updatedQuote = await storage.getQuoteById(quote.id);
      expect(updatedQuote!.status).toBe('sent');

      await storage.updateQuote(quote.id, { status: 'accepted' });
      updatedQuote = await storage.getQuoteById(quote.id);
      expect(updatedQuote!.status).toBe('accepted');

      // Create contract when quote is accepted
      const contractData = {
        quoteId: quote.id,
        contractNumber: 'CON-2025-001',
        clientName: 'Lifecycle Client',
        clientEmail: 'lifecycle@client.com',
        clientCompany: 'Lifecycle Corp',
        docusignEnvelopeId: 'envelope-test-123',
        contractValue: 2000,
        status: 'sent'
      };

      const contract = await storage.createContract(contractData);
      expect(contract).toBeDefined();
      expect(contract.contractNumber).toBe('CON-2025-001');
      expect(contract.quoteId).toBe(quote.id);

      // Test contract retrieval
      const contracts = await storage.getContracts({ status: 'sent' });
      expect(contracts).toHaveLength(1);
      expect(contracts[0].contractNumber).toBe('CON-2025-001');
    });
  });

  describe('Vendor and Material Operations', () => {
    let testUser: any;

    beforeEach(async () => {
      [testUser] = await testDb.insert(users).values({
        username: 'materialtest',
        password: 'hash',
        email: 'material@test.com',
        role: 'inventory_manager'
      }).returning();
    });

    it('should manage vendors and materials', async () => {
      // Create vendor
      const vendorData = {
        vendorName: 'Test Vendor Inc',
        vendorCode: 'TV001',
        contactPerson: 'Jane Vendor',
        email: 'jane@testvendor.com',
        phone: '555-VENDOR',
        address: '123 Vendor St, Vendor City, VC 12345',
        isActive: true
      };

      const vendor = await storage.createVendor(vendorData);
      expect(vendor).toBeDefined();
      expect(vendor.vendorName).toBe('Test Vendor Inc');
      expect(vendor.vendorCode).toBe('TV001');

      // Create materials for vendor
      const materialData = {
        materialName: 'Test Material',
        materialCode: 'TM001',
        description: 'A test material for testing',
        vendorId: vendor.id,
        unitPrice: 25.50,
        unitOfMeasure: 'pieces',
        reorderLevel: 100,
        reorderQuantity: 500,
        currentStock: 150
      };

      const material = await storage.createMaterial(materialData);
      expect(material).toBeDefined();
      expect(material.materialName).toBe('Test Material');
      expect(material.vendorId).toBe(vendor.id);
      expect(material.currentStock).toBe(150);

      // Test vendor retrieval
      const vendors = await storage.getVendors(true);
      expect(vendors).toHaveLength(1);
      expect(vendors[0].vendorName).toBe('Test Vendor Inc');

      // Test material retrieval
      const materials = await storage.getMaterials();
      expect(materials).toHaveLength(1);
      expect(materials[0].materialName).toBe('Test Material');

      // Test low stock detection
      await storage.updateMaterial(material.id, { currentStock: 50 });
      const lowStockMaterials = await storage.getLowStockMaterials();
      expect(lowStockMaterials).toHaveLength(1);
      expect(lowStockMaterials[0].materialName).toBe('Test Material');
    });

    it('should handle purchase orders workflow', async () => {
      // Create vendor and material
      const vendor = await storage.createVendor({
        vendorName: 'Purchase Vendor',
        vendorCode: 'PV001',
        contactPerson: 'Purchase Contact',
        email: 'purchase@vendor.com',
        isActive: true
      });

      const material = await storage.createMaterial({
        materialName: 'Purchase Material',
        materialCode: 'PM001',
        vendorId: vendor.id,
        unitPrice: 15.00,
        unitOfMeasure: 'units',
        reorderLevel: 50,
        reorderQuantity: 200,
        currentStock: 25
      });

      // Create purchase order
      const poData = {
        poNumber: 'PO-2025-001',
        vendorId: vendor.id,
        requestedBy: testUser.id,
        totalAmount: 3000,
        status: 'pending',
        orderDate: new Date()
      };

      const purchaseOrder = await storage.createPurchaseOrder(poData);
      expect(purchaseOrder).toBeDefined();
      expect(purchaseOrder.poNumber).toBe('PO-2025-001');

      // Add items to purchase order
      const poItemData = {
        purchaseOrderId: purchaseOrder.id,
        materialId: material.id,
        quantity: 200,
        unitPrice: 15.00,
        totalPrice: 3000
      };

      const poItem = await storage.createPurchaseOrderItem(poItemData);
      expect(poItem).toBeDefined();
      expect(poItem.quantity).toBe(200);
      expect(poItem.totalPrice).toBe(3000);

      // Test purchase order retrieval with items
      const purchaseOrders = await storage.getPurchaseOrders();
      expect(purchaseOrders).toHaveLength(1);
      expect(purchaseOrders[0].poNumber).toBe('PO-2025-001');

      // Test status updates
      await storage.updatePurchaseOrder(purchaseOrder.id, { status: 'approved' });
      const updatedPO = await storage.getPurchaseOrderById(purchaseOrder.id);
      expect(updatedPO!.status).toBe('approved');
    });
  });

  describe('HubSpot Sync Logging', () => {
    it('should log HubSpot sync operations', async () => {
      const syncData = {
        operation: 'deal_sync' as const,
        hubspotId: 'deal-12345',
        localId: 1,
        direction: 'to_hubspot' as const,
        status: 'success' as const,
        syncData: { dealName: 'Test Deal', dealValue: 5000 },
        responseData: { id: 'deal-12345', properties: {} }
      };

      const [syncLog] = await testDb.insert(hubspotSyncLog).values(syncData).returning();
      expect(syncLog).toBeDefined();
      expect(syncLog.operation).toBe('deal_sync');
      expect(syncLog.hubspotId).toBe('deal-12345');
      expect(syncLog.status).toBe('success');

      // Test retrieval
      const logs = await testDb.select().from(hubspotSyncLog).where(
        hubspotSyncLog.operation.eq('deal_sync')
      );
      expect(logs).toHaveLength(1);
      expect(logs[0].hubspotId).toBe('deal-12345');
    });

    it('should log sync failures', async () => {
      const failureData = {
        operation: 'contact_sync' as const,
        hubspotId: 'contact-456',
        localId: 2,
        direction: 'from_hubspot' as const,
        status: 'failed' as const,
        syncData: { firstName: 'Test', lastName: 'Contact' },
        errorMessage: 'API rate limit exceeded'
      };

      const [syncLog] = await testDb.insert(hubspotSyncLog).values(failureData).returning();
      expect(syncLog).toBeDefined();
      expect(syncLog.status).toBe('failed');
      expect(syncLog.errorMessage).toBe('API rate limit exceeded');
    });
  });

  describe('Data Integrity and Constraints', () => {
    it('should maintain referential integrity', async () => {
      // Create user and employee
      const [user] = await testDb.insert(users).values({
        username: 'integrity_test',
        password: 'hash',
        email: 'integrity@test.com',
        role: 'admin'
      }).returning();

      const [employee] = await testDb.insert(employees).values({
        userId: user.id,
        employeeId: 'INT001',
        firstName: 'Integrity',
        lastName: 'Test',
        department: 'Admin',
        position: 'Administrator',
        email: 'integrity.test@tsg.com',
        isActive: true,
        permissions: {}
      }).returning();

      // Attempt to delete user while employee exists should fail due to foreign key constraint
      await expect(async () => {
        await testDb.delete(users).where(users.id.eq(user.id));
      }).rejects.toThrow();

      // Delete employee first, then user should succeed
      await testDb.delete(employees).where(employees.id.eq(employee.id));
      await testDb.delete(users).where(users.id.eq(user.id));

      // Verify deletion
      const remainingUsers = await testDb.select().from(users).where(users.id.eq(user.id));
      expect(remainingUsers).toHaveLength(0);
    });

    it('should handle cascading deletes properly', async () => {
      // Create vendor
      const [vendor] = await testDb.insert(vendors).values({
        vendorName: 'Cascade Test Vendor',
        vendorCode: 'CTV001',
        contactPerson: 'Cascade Contact',
        email: 'cascade@vendor.com',
        isActive: true
      }).returning();

      // Create material linked to vendor
      const [material] = await testDb.insert(materials).values({
        materialName: 'Cascade Material',
        materialCode: 'CM001',
        vendorId: vendor.id,
        unitPrice: 10.00,
        unitOfMeasure: 'pieces',
        reorderLevel: 50,
        reorderQuantity: 100,
        currentStock: 75
      }).returning();

      // Verify material exists
      let existingMaterials = await testDb.select().from(materials).where(materials.vendorId.eq(vendor.id));
      expect(existingMaterials).toHaveLength(1);

      // Delete vendor (should cascade to materials if properly configured)
      await testDb.delete(vendors).where(vendors.id.eq(vendor.id));

      // Verify materials are also deleted (or handle foreign key constraint)
      existingMaterials = await testDb.select().from(materials).where(materials.vendorId.eq(vendor.id));
      expect(existingMaterials).toHaveLength(0);
    });
  });

  describe('Performance and Pagination', () => {
    beforeEach(async () => {
      // Create test user for batch operations
      const [user] = await testDb.insert(users).values({
        username: 'batch_test',
        password: 'hash',
        email: 'batch@test.com',
        role: 'admin'
      }).returning();

      // Create multiple quote requests for pagination testing
      const batchData = Array.from({ length: 25 }, (_, i) => ({
        name: `Client ${i + 1}`,
        email: `client${i + 1}@test.com`,
        company: `Company ${i + 1}`,
        status: i % 3 === 0 ? 'new' : i % 3 === 1 ? 'assigned' : 'quoted',
        urgency: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low'
      }));

      await testDb.insert(quoteRequests).values(batchData);
    });

    it('should handle pagination correctly', async () => {
      // Test first page
      const page1 = await storage.getQuoteRequests({ page: 1, limit: 10 });
      expect(page1).toHaveLength(10);

      // Test second page
      const page2 = await storage.getQuoteRequests({ page: 2, limit: 10 });
      expect(page2).toHaveLength(10);

      // Test third page (should have 5 items)
      const page3 = await storage.getQuoteRequests({ page: 3, limit: 10 });
      expect(page3).toHaveLength(5);

      // Test that pages don't overlap
      const page1Ids = page1.map(item => item.id);
      const page2Ids = page2.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('should handle large batch operations efficiently', async () => {
      const startTime = Date.now();
      
      // Query all records
      const allRequests = await storage.getQuoteRequests({ limit: 100 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(allRequests).toHaveLength(25);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null and undefined values gracefully', async () => {
      // Test with minimal required data
      const [quoteRequest] = await testDb.insert(quoteRequests).values({
        name: 'Minimal Client',
        email: 'minimal@client.com',
        company: 'Minimal Corp',
        status: 'new',
        urgency: 'medium'
      }).returning();

      expect(quoteRequest).toBeDefined();
      expect(quoteRequest.phone).toBeNull();
      expect(quoteRequest.message).toBeNull();
      expect(quoteRequest.assignedTo).toBeNull();
    });

    it('should validate required fields', async () => {
      // Attempt to create user without required fields
      await expect(async () => {
        await testDb.insert(users).values({
          // Missing username, password, email
          role: 'user'
        } as any);
      }).rejects.toThrow();
    });

    it('should handle database connection errors gracefully', async () => {
      // Mock a database error by using invalid table name
      try {
        await testClient`SELECT * FROM non_existent_table`;
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('relation "non_existent_table" does not exist');
      }
    });
  });
});