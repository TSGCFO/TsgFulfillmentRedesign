#!/usr/bin/env node

/**
 * Development Environment Seed Script
 * Seeds the development database with sample data for testing the Employee Portal
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
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
} from '../shared/schema.ts';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('🌱 Starting development data seeding...');

async function seedDevelopmentData() {
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log('🔄 Clearing existing data...');
    
    // Clear tables in correct order (respecting foreign key constraints)
    await db.delete(hubspotSyncLog);
    await db.delete(purchaseOrderItems);
    await db.delete(purchaseOrders);
    await db.delete(materials);
    await db.delete(vendors);
    await db.delete(contracts);
    await db.delete(quotes);
    await db.delete(quoteRequests);
    await db.delete(employees);
    await db.delete(users);

    console.log('✅ Existing data cleared');

    // Seed Users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const seedUsers = await db.insert(users).values([
      {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@tsgfulfillment.com',
        role: 'admin'
      },
      {
        username: 'sales_manager',
        password: hashedPassword,
        email: 'sales.manager@tsgfulfillment.com',
        role: 'sales_manager'
      },
      {
        username: 'sales_rep1',
        password: hashedPassword,
        email: 'sales.rep1@tsgfulfillment.com',
        role: 'sales_rep'
      },
      {
        username: 'sales_rep2',
        password: hashedPassword,
        email: 'sales.rep2@tsgfulfillment.com',
        role: 'sales_rep'
      },
      {
        username: 'inventory_manager',
        password: hashedPassword,
        email: 'inventory@tsgfulfillment.com',
        role: 'inventory_manager'
      }
    ]).returning();

    console.log(`✅ Created ${seedUsers.length} users`);

    // Seed Employees
    console.log('🧑‍💼 Seeding employees...');
    const seedEmployees = await db.insert(employees).values([
      {
        userId: seedUsers[0].id,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Admin',
        department: 'Management',
        position: 'System Administrator',
        email: 'john.admin@tsgfulfillment.com',
        hireDate: '2024-01-15',
        isActive: true,
        permissions: { 
          canManageUsers: true, 
          canViewReports: true, 
          canManageInventory: true,
          canAssignQuotes: true,
          canCreateContracts: true
        }
      },
      {
        userId: seedUsers[1].id,
        employeeId: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        department: 'Sales',
        position: 'Sales Manager',
        email: 'sarah.johnson@tsgfulfillment.com',
        hireDate: '2024-02-01',
        isActive: true,
        permissions: { 
          canAssignQuotes: true, 
          canCreateContracts: true, 
          canViewReports: true 
        }
      },
      {
        userId: seedUsers[2].id,
        employeeId: 'EMP003',
        firstName: 'Mike',
        lastName: 'Wilson',
        department: 'Sales',
        position: 'Sales Representative',
        email: 'mike.wilson@tsgfulfillment.com',
        hireDate: '2024-03-15',
        isActive: true,
        permissions: { 
          canCreateQuotes: true, 
          canUpdateQuotes: true 
        }
      },
      {
        userId: seedUsers[3].id,
        employeeId: 'EMP004',
        firstName: 'Lisa',
        lastName: 'Chen',
        department: 'Sales',
        position: 'Sales Representative',
        email: 'lisa.chen@tsgfulfillment.com',
        hireDate: '2024-04-01',
        isActive: true,
        permissions: { 
          canCreateQuotes: true, 
          canUpdateQuotes: true 
        }
      },
      {
        userId: seedUsers[4].id,
        employeeId: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        department: 'Operations',
        position: 'Inventory Manager',
        email: 'david.brown@tsgfulfillment.com',
        hireDate: '2024-05-01',
        isActive: true,
        permissions: { 
          canManageInventory: true, 
          canCreatePurchaseOrders: true 
        }
      }
    ]).returning();

    console.log(`✅ Created ${seedEmployees.length} employees`);

    // Seed Vendors
    console.log('🏢 Seeding vendors...');
    const seedVendors = await db.insert(vendors).values([
      {
        vendorName: 'Packaging Solutions Inc',
        vendorCode: 'PSI001',
        contactPerson: 'Jennifer Smith',
        email: 'jennifer@packagingsolutions.com',
        phone: '555-PACK1',
        address: '123 Package Street, Box City, BC 12345',
        isActive: true
      },
      {
        vendorName: 'Material Suppliers LLC',
        vendorCode: 'MSL002',
        contactPerson: 'Robert Johnson',
        email: 'robert@materialsuppliers.com',
        phone: '555-MTRL2',
        address: '456 Supply Avenue, Material Town, MT 67890',
        isActive: true
      },
      {
        vendorName: 'Shipping Supplies Co',
        vendorCode: 'SSC003',
        contactPerson: 'Mary Davis',
        email: 'mary@shippingsupplies.com',
        phone: '555-SHIP3',
        address: '789 Shipping Boulevard, Ship City, SC 11111',
        isActive: true
      }
    ]).returning();

    console.log(`✅ Created ${seedVendors.length} vendors`);

    // Seed Materials
    console.log('📦 Seeding materials...');
    const seedMaterials = await db.insert(materials).values([
      {
        materialName: 'Bubble Wrap',
        materialCode: 'BW001',
        category: 'Packaging',
        description: 'Protective bubble wrap for packaging',
        preferredVendorId: seedVendors[0].id,
        standardCost: 12.50,
        unitOfMeasure: 'rolls',
        reorderPoint: 50,
        currentStock: 75
      },
      {
        materialName: 'Cardboard Boxes - Small',
        materialCode: 'CBS002',
        category: 'Packaging',
        description: 'Small cardboard shipping boxes (12x8x6)',
        preferredVendorId: seedVendors[0].id,
        standardCost: 1.25,
        unitOfMeasure: 'pieces',
        reorderPoint: 200,
        currentStock: 150
      },
      {
        materialName: 'Cardboard Boxes - Medium',
        materialCode: 'CBM003',
        category: 'Packaging',
        description: 'Medium cardboard shipping boxes (16x12x8)',
        preferredVendorId: seedVendors[0].id,
        standardCost: 2.25,
        unitOfMeasure: 'pieces',
        reorderPoint: 150,
        currentStock: 85 // Below reorder level
      },
      {
        materialName: 'Packing Tape',
        materialCode: 'PT004',
        category: 'Packaging',
        description: 'Heavy-duty packing tape',
        preferredVendorId: seedVendors[1].id,
        standardCost: 8.75,
        unitOfMeasure: 'rolls',
        reorderPoint: 25,
        currentStock: 15 // Below reorder level
      },
      {
        materialName: 'Shipping Labels',
        materialCode: 'SL005',
        category: 'Supplies',
        description: 'Adhesive shipping labels',
        preferredVendorId: seedVendors[2].id,
        standardCost: 0.05,
        unitOfMeasure: 'pieces',
        reorderPoint: 1000,
        currentStock: 800 // Below reorder level
      },
      {
        materialName: 'Foam Padding',
        materialCode: 'FP006',
        category: 'Packaging',
        description: 'Foam padding for fragile items',
        preferredVendorId: seedVendors[1].id,
        standardCost: 15.00,
        unitOfMeasure: 'sheets',
        reorderPoint: 100,
        currentStock: 250
      }
    ]).returning();

    console.log(`✅ Created ${seedMaterials.length} materials`);

    // Seed Quote Requests
    console.log('📝 Seeding quote requests...');
    const seedQuoteRequests = await db.insert(quoteRequests).values([
      {
        name: 'John Smith',
        email: 'john.smith@techstartup.com',
        company: 'Tech Startup Inc',
        phone: '555-CLIENT1',
        service: 'fulfillment',
        currentShipments: '50-100',
        expectedShipments: '100-200',
        services: 'fulfillment,warehousing',
        message: 'We need fulfillment services for our new e-commerce platform. Expecting 100-200 orders per day.',
        consent: true,
        status: 'new'
      },
      {
        name: 'Jennifer Davis',
        email: 'jennifer@fashionbrand.com',
        company: 'Fashion Brand Co',
        phone: '555-CLIENT2',
        service: 'warehousing',
        currentShipments: '200-500',
        expectedShipments: '500-1000',
        services: 'fulfillment,warehousing,custom_packaging',
        message: 'Looking for warehousing and custom packaging solutions for our clothing line.',
        consent: true,
        status: 'assigned',
        assignedTo: seedUsers[2].id
      },
      {
        name: 'Robert Wilson',
        email: 'robert@healthsupplements.com',
        company: 'Health Supplements LLC',
        phone: '555-CLIENT3',
        service: 'fulfillment',
        currentShipments: '100-200',
        expectedShipments: '300-500',
        services: 'fulfillment,warehousing,custom_packaging',
        message: 'Need complete fulfillment package for health supplement products.',
        consent: true,
        status: 'quoted',
        assignedTo: seedUsers[3].id
      },
      {
        name: 'Mary Johnson',
        email: 'mary@artisancrafts.com',
        company: 'Artisan Crafts',
        phone: '555-CLIENT4',
        service: 'fulfillment',
        currentShipments: '10-50',
        expectedShipments: '50-100',
        services: 'fulfillment',
        message: 'Small business looking for basic fulfillment services.',
        consent: true,
        status: 'new'
      },
      {
        name: 'David Chen',
        email: 'david@electronicsstore.com',
        company: 'Electronics Store',
        phone: '555-CLIENT5',
        service: 'warehousing',
        currentShipments: '300-500',
        expectedShipments: '500-1000',
        services: 'fulfillment,warehousing',
        message: 'Need secure warehousing for electronics and fast fulfillment.',
        consent: true,
        status: 'assigned',
        assignedTo: seedUsers[2].id
      }
    ]).returning();

    console.log(`✅ Created ${seedQuoteRequests.length} quote requests`);

    // Seed Quotes
    console.log('💰 Seeding quotes...');
    const seedQuotes = await db.insert(quotes).values([
      {
        quoteRequestId: seedQuoteRequests[1].id,
        quoteNumber: 'QUO-2025-001',
        clientName: 'Jennifer Davis',
        clientEmail: 'jennifer@fashionbrand.com',
        clientCompany: 'Fashion Brand Co',
        servicesQuoted: { fulfillment: true, warehousing: true, customPackaging: true },
        pricingData: {
          basePrice: 1200,
          fulfillmentFee: 800,
          warehousingFee: 400,
          customPackagingFee: 600,
          total: 3000
        },
        totalAmount: 3000,
        createdBy: seedEmployees[2].id,
        assignedTo: seedEmployees[2].id,
        status: 'sent',
        validUntil: '2025-07-10'
      },
      {
        quoteRequestId: seedQuoteRequests[2].id,
        quoteNumber: 'QUO-2025-002',
        clientName: 'Robert Wilson',
        clientEmail: 'robert@healthsupplements.com',
        clientCompany: 'Health Supplements LLC',
        servicesQuoted: { fulfillment: true, warehousing: true, customPackaging: true },
        pricingData: {
          basePrice: 1500,
          fulfillmentFee: 1000,
          warehousingFee: 600,
          customPackagingFee: 400,
          total: 3500
        },
        totalAmount: 3500,
        createdBy: seedEmployees[3].id,
        assignedTo: seedEmployees[3].id,
        status: 'accepted',
        validUntil: '2025-07-05'
      }
    ]).returning();

    console.log(`✅ Created ${seedQuotes.length} quotes`);

    // Seed Contracts
    console.log('📋 Seeding contracts...');
    const seedContracts = await db.insert(contracts).values([
      {
        quoteId: seedQuotes[1].id,
        contractNumber: 'CON-2025-001',
        clientName: 'Robert Wilson',
        contractType: 'fulfillment_services',
        status: 'sent',
        docusignEnvelopeId: 'dev-envelope-12345'
      }
    ]).returning();

    console.log(`✅ Created ${seedContracts.length} contracts`);

    // Seed Purchase Orders
    console.log('🛍️ Seeding purchase orders...');
    const seedPurchaseOrders = await db.insert(purchaseOrders).values([
      {
        poNumber: 'PO-2025-001',
        vendorId: seedVendors[0].id,
        createdBy: seedEmployees[4].id,
        totalAmount: 2250.00,
        status: 'pending',
        orderDate: '2025-06-10',
        expectedDeliveryDate: '2025-06-17',
        notes: 'Reorder for low stock items - cardboard boxes'
      },
      {
        poNumber: 'PO-2025-002',
        vendorId: seedVendors[1].id,
        createdBy: seedEmployees[4].id,
        totalAmount: 875.00,
        status: 'approved',
        orderDate: '2025-06-09',
        expectedDeliveryDate: '2025-06-15',
        notes: 'Emergency reorder for packing tape'
      }
    ]).returning();

    console.log(`✅ Created ${seedPurchaseOrders.length} purchase orders`);

    // Seed Purchase Order Items
    console.log('📋 Seeding purchase order items...');
    const seedPOItems = await db.insert(purchaseOrderItems).values([
      {
        purchaseOrderId: seedPurchaseOrders[0].id,
        materialId: seedMaterials[2].id, // Medium cardboard boxes
        quantity: 1000,
        unitCost: 2.25,
        totalCost: 2250.00
      },
      {
        purchaseOrderId: seedPurchaseOrders[1].id,
        materialId: seedMaterials[3].id, // Packing tape
        quantity: 100,
        unitCost: 8.75,
        totalCost: 875.00
      }
    ]).returning();

    console.log(`✅ Created ${seedPOItems.length} purchase order items`);

    // Seed HubSpot Sync Log
    console.log('🔄 Seeding HubSpot sync log...');
    const seedSyncLog = await db.insert(hubspotSyncLog).values([
      {
        recordType: 'deal',
        recordId: seedQuotes[0].id,
        hubspotId: 'dev-deal-12345',
        syncAction: 'create',
        syncStatus: 'success'
      },
      {
        recordType: 'contact',
        recordId: seedQuoteRequests[0].id,
        hubspotId: 'dev-contact-67890',
        syncAction: 'create',
        syncStatus: 'success'
      }
    ]).returning();

    console.log(`✅ Created ${seedSyncLog.length} sync log entries`);

    console.log('');
    console.log('🎉 Development data seeding completed successfully!');
    console.log('');
    console.log('📊 Seeded Data Summary:');
    console.log(`  Users: ${seedUsers.length}`);
    console.log(`  Employees: ${seedEmployees.length}`);
    console.log(`  Vendors: ${seedVendors.length}`);
    console.log(`  Materials: ${seedMaterials.length}`);
    console.log(`  Quote Requests: ${seedQuoteRequests.length}`);
    console.log(`  Quotes: ${seedQuotes.length}`);
    console.log(`  Contracts: ${seedContracts.length}`);
    console.log(`  Purchase Orders: ${seedPurchaseOrders.length}`);
    console.log(`  PO Items: ${seedPOItems.length}`);
    console.log(`  Sync Log Entries: ${seedSyncLog.length}`);
    console.log('');
    console.log('👥 Test Users Created:');
    console.log('  Username: admin | Password: password123 | Role: admin');
    console.log('  Username: sales_manager | Password: password123 | Role: sales_manager');
    console.log('  Username: sales_rep1 | Password: password123 | Role: sales_rep');
    console.log('  Username: sales_rep2 | Password: password123 | Role: sales_rep');
    console.log('  Username: inventory_manager | Password: password123 | Role: inventory_manager');
    console.log('');
    console.log('🔗 You can now login to the Employee Portal at:');
    console.log('  http://localhost:3000/employee/login');

  } catch (error) {
    console.error('❌ Error seeding development data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
seedDevelopmentData()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });