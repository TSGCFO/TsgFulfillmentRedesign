import { db } from "../../db";
import { 
  materials, 
  materialInventory, 
  materialPrices, 
  materialUsage,
  vendors
} from "../../../shared/schema/employee-portal";
import { eq, desc, and, lt, lte, sql } from "drizzle-orm";

// Type definitions
export interface MaterialCreate {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface MaterialUpdate {
  name?: string;
  description?: string;
  category?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
  isActive?: boolean;
}

export interface InventoryUpdate {
  quantity: number;
  location?: string;
}

export interface MaterialUsageRecord {
  materialId: number;
  quantityUsed: number;
  usedFor?: string;
  usedBy: number;
  notes?: string;
}

export class MaterialService {
  // Create a new material
  static async create(data: MaterialCreate) {
    // Check if SKU already exists
    const existing = await db
      .select()
      .from(materials)
      .where(eq(materials.sku, data.sku))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Material with this SKU already exists");
    }

    // Create material
    const [material] = await db
      .insert(materials)
      .values({
        ...data,
        isActive: true,
      })
      .returning();

    // Create initial inventory record
    await db.insert(materialInventory).values({
      materialId: material.id,
      currentQuantity: 0,
      reservedQuantity: 0,
      location: "Main Warehouse",
    });

    return material;
  }

  // Get all materials
  static async getAll(includeInactive = false) {
    const query = db
      .select({
        material: materials,
        inventory: materialInventory,
      })
      .from(materials)
      .leftJoin(materialInventory, eq(materials.id, materialInventory.materialId));

    if (!includeInactive) {
      query.where(eq(materials.isActive, true));
    }

    const results = await query.orderBy(materials.name);

    return results.map((row: any) => ({
      ...row.material,
      inventory: row.inventory,
    }));
  }

  // Get material by ID
  static async getById(id: number) {
    const [result] = await db
      .select({
        material: materials,
        inventory: materialInventory,
      })
      .from(materials)
      .leftJoin(materialInventory, eq(materials.id, materialInventory.materialId))
      .where(eq(materials.id, id));

    if (!result) {
      throw new Error("Material not found");
    }

    // Get current price
    const [currentPrice] = await db
      .select()
      .from(materialPrices)
      .where(
        and(
          eq(materialPrices.materialId, id),
          eq(materialPrices.isCurrent, true)
        )
      )
      .limit(1);

    return {
      ...result.material,
      inventory: result.inventory,
      currentPrice,
    };
  }

  // Update material
  static async update(id: number, data: MaterialUpdate) {
    const [updated] = await db
      .update(materials)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(materials.id, id))
      .returning();

    if (!updated) {
      throw new Error("Material not found");
    }

    return updated;
  }

  // Update inventory levels
  static async updateInventory(materialId: number, update: InventoryUpdate) {
    const [inventory] = await db
      .select()
      .from(materialInventory)
      .where(eq(materialInventory.materialId, materialId));

    if (!inventory) {
      // Create inventory record if it doesn't exist
      const [newInventory] = await db
        .insert(materialInventory)
        .values({
          materialId,
          currentQuantity: update.quantity,
          reservedQuantity: 0,
          location: update.location || "Main Warehouse",
        })
        .returning();
      return newInventory;
    }

    // Update existing inventory
    const [updated] = await db
      .update(materialInventory)
      .set({
        currentQuantity: update.quantity,
        location: update.location || inventory.location,
        updatedAt: new Date(),
      })
      .where(eq(materialInventory.id, inventory.id))
      .returning();

    return updated;
  }

  // Record material usage
  static async recordUsage(usage: MaterialUsageRecord) {
    // Check if material exists and has enough inventory
    const material = await this.getById(usage.materialId);
    if (!material.inventory) {
      throw new Error("No inventory record found for this material");
    }

    const availableQuantity = material.inventory.currentQuantity - material.inventory.reservedQuantity;
    if (availableQuantity < usage.quantityUsed) {
      throw new Error(`Insufficient inventory. Available: ${availableQuantity}, Requested: ${usage.quantityUsed}`);
    }

    // Record usage
    const [usageRecord] = await db
      .insert(materialUsage)
      .values({
        ...usage,
        usageDate: new Date().toISOString().split('T')[0],
      })
      .returning();

    // Update inventory
    await db
      .update(materialInventory)
      .set({
        currentQuantity: material.inventory.currentQuantity - usage.quantityUsed,
        updatedAt: new Date(),
      })
      .where(eq(materialInventory.materialId, usage.materialId));

    return usageRecord;
  }

  // Get low stock materials
  static async getLowStock() {
    const results = await db
      .select({
        material: materials,
        inventory: materialInventory,
      })
      .from(materials)
      .innerJoin(materialInventory, eq(materials.id, materialInventory.materialId))
      .where(
        and(
          eq(materials.isActive, true),
          sql`${materialInventory.currentQuantity} <= ${materials.reorderPoint}`
        )
      )
      .orderBy(materials.name);

    return results.map((row: any) => ({
      ...row.material,
      inventory: row.inventory,
      needsReorder: true,
    }));
  }

  // Get materials by category
  static async getByCategory(category: string) {
    const results = await db
      .select({
        material: materials,
        inventory: materialInventory,
      })
      .from(materials)
      .leftJoin(materialInventory, eq(materials.id, materialInventory.materialId))
      .where(
        and(
          eq(materials.category, category),
          eq(materials.isActive, true)
        )
      )
      .orderBy(materials.name);

    return results.map((row: any) => ({
      ...row.material,
      inventory: row.inventory,
    }));
  }

  // Add material price
  static async addPrice(materialId: number, vendorId: number, price: number, minimumOrderQuantity = 1, leadTimeDays?: number) {
    // Verify material and vendor exist
    const [material] = await db.select().from(materials).where(eq(materials.id, materialId));
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId));

    if (!material) throw new Error("Material not found");
    if (!vendor) throw new Error("Vendor not found");

    // Mark previous prices as not current
    await db
      .update(materialPrices)
      .set({ isCurrent: false })
      .where(
        and(
          eq(materialPrices.materialId, materialId),
          eq(materialPrices.vendorId, vendorId)
        )
      );

    // Add new price
    const [newPrice] = await db
      .insert(materialPrices)
      .values({
        materialId,
        vendorId,
        price,
        minimumOrderQuantity,
        leadTimeDays,
        isCurrent: true,
        effectiveDate: new Date().toISOString().split('T')[0],
      })
      .returning();

    return newPrice;
  }

  // Get material prices
  static async getPrices(materialId: number, currentOnly = true) {
    const query = db
      .select({
        price: materialPrices,
        vendor: vendors,
      })
      .from(materialPrices)
      .innerJoin(vendors, eq(materialPrices.vendorId, vendors.id))
      .where(eq(materialPrices.materialId, materialId));

    if (currentOnly) {
      query.where(
        and(
          eq(materialPrices.materialId, materialId),
          eq(materialPrices.isCurrent, true)
        )
      );
    }

    const results = await query.orderBy(desc(materialPrices.effectiveDate));

    return results.map((row: any) => ({
      ...row.price,
      vendor: row.vendor,
    }));
  }

  // Get usage history
  static async getUsageHistory(materialId: number, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db
      .select()
      .from(materialUsage)
      .where(
        and(
          eq(materialUsage.materialId, materialId),
          sql`${materialUsage.usageDate} >= ${startDate.toISOString().split('T')[0]}`
        )
      )
      .orderBy(desc(materialUsage.usageDate));
  }

  // Reserve inventory
  static async reserveInventory(materialId: number, quantity: number) {
    const material = await this.getById(materialId);
    if (!material.inventory) {
      throw new Error("No inventory record found");
    }

    const availableQuantity = material.inventory.currentQuantity - material.inventory.reservedQuantity;
    if (availableQuantity < quantity) {
      throw new Error(`Insufficient inventory to reserve. Available: ${availableQuantity}`);
    }

    const [updated] = await db
      .update(materialInventory)
      .set({
        reservedQuantity: material.inventory.reservedQuantity + quantity,
        updatedAt: new Date(),
      })
      .where(eq(materialInventory.materialId, materialId))
      .returning();

    return updated;
  }

  // Release reserved inventory
  static async releaseReservedInventory(materialId: number, quantity: number) {
    const material = await this.getById(materialId);
    if (!material.inventory) {
      throw new Error("No inventory record found");
    }

    if (material.inventory.reservedQuantity < quantity) {
      throw new Error(`Cannot release more than reserved. Reserved: ${material.inventory.reservedQuantity}`);
    }

    const [updated] = await db
      .update(materialInventory)
      .set({
        reservedQuantity: material.inventory.reservedQuantity - quantity,
        updatedAt: new Date(),
      })
      .where(eq(materialInventory.materialId, materialId))
      .returning();

    return updated;
  }
}