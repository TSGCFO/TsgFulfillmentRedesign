import { db } from "../db";
import {
  salesTeamMembers,
  quoteInquiries,
  materials,
  vendors,
  materialInventory,
  materialPrices
} from "@shared/schema/employee-portal";

async function seedEmployeePortal() {
  console.log("Seeding employee portal data...");

  try {
    // ============================================
    // SEED SALES TEAM MEMBERS
    // ============================================
    const salesTeam = await db.insert(salesTeamMembers).values([
      {
        fullName: "John Smith",
        email: "john.smith@tsgfulfillment.com",
        hubspotOwnerId: "12345",
        isActive: true
      },
      {
        fullName: "Jane Doe",
        email: "jane.doe@tsgfulfillment.com",
        hubspotOwnerId: "12346",
        isActive: true
      },
      {
        fullName: "Mike Johnson",
        email: "mike.johnson@tsgfulfillment.com",
        hubspotOwnerId: "12347",
        isActive: true
      },
      {
        fullName: "Sarah Williams",
        email: "sarah.williams@tsgfulfillment.com",
        hubspotOwnerId: "12348",
        isActive: true
      }
    ]).returning();

    console.log(`Created ${salesTeam.length} sales team members`);

    // ============================================
    // SEED VENDORS
    // ============================================
    const vendorList = await db.insert(vendors).values([
      {
        name: "ABC Packaging Supplies",
        contactName: "Sarah Thompson",
        email: "sarah@abcpackaging.com",
        phone: "555-0101",
        address: "123 Industrial Way, Houston, TX 77001",
        paymentTerms: "Net 30",
        isActive: true
      },
      {
        name: "XYZ Materials Co",
        contactName: "Robert Brown",
        email: "robert@xyzmaterials.com",
        phone: "555-0102",
        address: "456 Commerce St, Dallas, TX 75201",
        paymentTerms: "Net 45",
        isActive: true
      },
      {
        name: "Global Shipping Supplies",
        contactName: "Lisa Chen",
        email: "lisa@globalshipping.com",
        phone: "555-0103",
        address: "789 Logistics Blvd, Austin, TX 78701",
        paymentTerms: "Net 30",
        isActive: true
      },
      {
        name: "Premier Packaging Solutions",
        contactName: "James Wilson",
        email: "james@premierpkg.com",
        phone: "555-0104",
        address: "321 Warehouse Dr, San Antonio, TX 78201",
        paymentTerms: "Net 60",
        isActive: true
      }
    ]).returning();

    console.log(`Created ${vendorList.length} vendors`);

    // ============================================
    // SEED MATERIALS
    // ============================================
    const materialList = await db.insert(materials).values([
      // Packaging Supplies
      {
        sku: "PKG-TAPE-001",
        name: "Packaging Tape - Clear",
        description: "Heavy duty clear packaging tape, 2 inches wide",
        category: "Packaging Supplies",
        unitOfMeasure: "Roll",
        reorderPoint: 50,
        reorderQuantity: 200,
        isActive: true
      },
      {
        sku: "PKG-TAPE-002",
        name: "Packaging Tape - Brown",
        description: "Heavy duty brown packaging tape, 2 inches wide",
        category: "Packaging Supplies",
        unitOfMeasure: "Roll",
        reorderPoint: 50,
        reorderQuantity: 200,
        isActive: true
      },
      // Boxes
      {
        sku: "BOX-SMALL-001",
        name: "Small Shipping Box",
        description: "12x9x6 inch corrugated shipping box",
        category: "Boxes",
        unitOfMeasure: "Each",
        reorderPoint: 100,
        reorderQuantity: 500,
        isActive: true
      },
      {
        sku: "BOX-MED-001",
        name: "Medium Shipping Box",
        description: "18x14x12 inch corrugated shipping box",
        category: "Boxes",
        unitOfMeasure: "Each",
        reorderPoint: 75,
        reorderQuantity: 300,
        isActive: true
      },
      {
        sku: "BOX-LARGE-001",
        name: "Large Shipping Box",
        description: "24x18x18 inch corrugated shipping box",
        category: "Boxes",
        unitOfMeasure: "Each",
        reorderPoint: 50,
        reorderQuantity: 200,
        isActive: true
      },
      // Protective Materials
      {
        sku: "BUBBLE-WRAP-001",
        name: "Bubble Wrap",
        description: "12 inch wide bubble wrap roll",
        category: "Protective Materials",
        unitOfMeasure: "Roll",
        reorderPoint: 25,
        reorderQuantity: 100,
        isActive: true
      },
      {
        sku: "PACKING-PEANUTS-001",
        name: "Packing Peanuts",
        description: "Biodegradable packing peanuts",
        category: "Protective Materials",
        unitOfMeasure: "Bag",
        reorderPoint: 20,
        reorderQuantity: 50,
        isActive: true
      },
      {
        sku: "AIR-PILLOW-001",
        name: "Air Pillows",
        description: "Inflatable air cushions for packaging",
        category: "Protective Materials",
        unitOfMeasure: "Box",
        reorderPoint: 30,
        reorderQuantity: 100,
        isActive: true
      },
      // Labels and Stickers
      {
        sku: "LABEL-SHIP-001",
        name: "Shipping Labels",
        description: "4x6 inch thermal shipping labels",
        category: "Labels",
        unitOfMeasure: "Roll",
        reorderPoint: 10,
        reorderQuantity: 50,
        isActive: true
      },
      {
        sku: "LABEL-FRAGILE-001",
        name: "Fragile Stickers",
        description: "3x2 inch fragile warning stickers",
        category: "Labels",
        unitOfMeasure: "Roll",
        reorderPoint: 20,
        reorderQuantity: 100,
        isActive: true
      }
    ]).returning();

    console.log(`Created ${materialList.length} materials`);

    // ============================================
    // SEED INVENTORY RECORDS
    // ============================================
    for (const material of materialList) {
      await db.insert(materialInventory).values({
        materialId: material.id,
        currentQuantity: Math.floor(Math.random() * 200) + 50,
        reservedQuantity: 0,
        location: `Warehouse A - Section ${Math.floor(Math.random() * 10) + 1}`,
        lastCountedAt: new Date()
      });
    }

    console.log("Created inventory records for all materials");

    // ============================================
    // SEED MATERIAL PRICES
    // ============================================
    let priceCount = 0;
    for (const material of materialList) {
      // Create 2-3 price entries per material from different vendors
      const vendorCount = Math.floor(Math.random() * 2) + 2;
      const selectedVendors = vendorList.sort(() => 0.5 - Math.random()).slice(0, vendorCount);
      
      for (const vendor of selectedVendors) {
        const basePrice = Math.random() * 50 + 10;
        await db.insert(materialPrices).values({
          materialId: material.id,
          vendorId: vendor.id,
          price: basePrice.toFixed(2),
          minimumOrderQuantity: Math.floor(Math.random() * 50) + 10,
          leadTimeDays: Math.floor(Math.random() * 7) + 3,
          isCurrent: true,
          effectiveDate: new Date().toISOString().split('T')[0]
        });
        priceCount++;
      }
    }

    console.log(`Created ${priceCount} material price entries`);

    // ============================================
    // CREATE SAMPLE QUOTE INQUIRIES
    // ============================================
    // Note: This assumes quote_requests table already has some data
    // If not, you'll need to create some quote requests first
    
    // Check if we have any quote requests to create inquiries from
    const existingQuoteRequests = await db.select().from(quoteRequests).limit(5);
    
    if (existingQuoteRequests.length > 0) {
      const sampleInquiries = [];
      const statuses = ['new', 'contacted', 'quoted', 'negotiating', 'won', 'lost'];
      const priorities = ['low', 'medium', 'high'];
      
      for (let i = 0; i < Math.min(existingQuoteRequests.length, 3); i++) {
        const quoteRequest = existingQuoteRequests[i];
        const randomSalesPerson = salesTeam[Math.floor(Math.random() * salesTeam.length)];
        
        sampleInquiries.push({
          quoteRequestId: quoteRequest.id,
          assignedTo: i === 0 ? null : randomSalesPerson.id, // First one unassigned
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          notes: `Sample inquiry for ${quoteRequest.companyName || 'Unknown Company'}`,
          hubspotDealId: `demo-deal-${Date.now()}-${i}`,
          syncStatus: 'synced'
        });
      }
      
      const createdInquiries = await db.insert(quoteInquiries).values(sampleInquiries).returning();
      console.log(`Created ${createdInquiries.length} sample quote inquiries`);
    } else {
      console.log("No quote requests found - skipping quote inquiry seeding");
    }
    
    console.log("\nEmployee portal data seeded successfully!");
    console.log("\nSummary:");
    console.log(`- Sales Team Members: ${salesTeam.length}`);
    console.log(`- Vendors: ${vendorList.length}`);
    console.log(`- Materials: ${materialList.length}`);
    console.log(`- Material Prices: ${priceCount}`);
    
  } catch (error) {
    console.error("Error seeding employee portal data:", error);
    process.exit(1);
  }
}

// Run the seed function
seedEmployeePortal().then(() => {
  console.log("\nSeeding complete!");
  process.exit(0);
}).catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});