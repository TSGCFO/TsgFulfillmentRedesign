import express from "express";
import { MaterialService } from "../../services/employee-portal/materialService";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const createMaterialSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
  reorderQuantity: z.number().int().positive().optional(),
});

const updateMaterialSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
  reorderQuantity: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

const inventoryUpdateSchema = z.object({
  quantity: z.number().int().nonnegative(),
  location: z.string().optional(),
});

const recordUsageSchema = z.object({
  materialId: z.number(),
  quantityUsed: z.number().int().positive(),
  usedFor: z.string().optional(),
  usedBy: z.number(),
  notes: z.string().optional(),
});

const addPriceSchema = z.object({
  vendorId: z.number(),
  price: z.number().positive(),
  minimumOrderQuantity: z.number().int().positive().optional(),
  leadTimeDays: z.number().int().nonnegative().optional(),
});

// GET /api/employee-portal/materials
router.get("/", async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const materials = await MaterialService.getAll(includeInactive);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch materials" 
    });
  }
});

// GET /api/employee-portal/materials/low-stock
router.get("/low-stock", async (req, res) => {
  try {
    const materials = await MaterialService.getLowStock();
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error("Error fetching low stock materials:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch low stock materials" 
    });
  }
});

// GET /api/employee-portal/materials/category/:category
router.get("/category/:category", async (req, res) => {
  try {
    const materials = await MaterialService.getByCategory(req.params.category);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error("Error fetching materials by category:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch materials" 
    });
  }
});

// GET /api/employee-portal/materials/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const material = await MaterialService.getById(id);
    res.json({ success: true, data: material });
  } catch (error) {
    console.error("Error fetching material:", error);
    if (error instanceof Error && error.message === "Material not found") {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch material" 
      });
    }
  }
});

// POST /api/employee-portal/materials
router.post("/", async (req, res) => {
  try {
    const data = createMaterialSchema.parse(req.body);
    const material = await MaterialService.create(data);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    console.error("Error creating material:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else if (error instanceof Error && error.message.includes("already exists")) {
      res.status(409).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create material" 
      });
    }
  }
});

// PUT /api/employee-portal/materials/:id
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const data = updateMaterialSchema.parse(req.body);
    const material = await MaterialService.update(id, data);
    res.json({ success: true, data: material });
  } catch (error) {
    console.error("Error updating material:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else if (error instanceof Error && error.message === "Material not found") {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update material" 
      });
    }
  }
});

// PUT /api/employee-portal/materials/:id/inventory
router.put("/:id/inventory", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const data = inventoryUpdateSchema.parse(req.body);
    const inventory = await MaterialService.updateInventory(id, data);
    res.json({ success: true, data: inventory });
  } catch (error) {
    console.error("Error updating inventory:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update inventory" 
      });
    }
  }
});

// POST /api/employee-portal/materials/usage
router.post("/usage", async (req, res) => {
  try {
    const data = recordUsageSchema.parse(req.body);
    const usage = await MaterialService.recordUsage(data);
    res.status(201).json({ success: true, data: usage });
  } catch (error) {
    console.error("Error recording material usage:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else if (error instanceof Error && error.message.includes("Insufficient inventory")) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to record usage" 
      });
    }
  }
});

// GET /api/employee-portal/materials/:id/usage
router.get("/:id/usage", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const usage = await MaterialService.getUsageHistory(id, days);
    res.json({ success: true, data: usage });
  } catch (error) {
    console.error("Error fetching usage history:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch usage history" 
    });
  }
});

// POST /api/employee-portal/materials/:id/prices
router.post("/:id/prices", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const data = addPriceSchema.parse(req.body);
    const price = await MaterialService.addPrice(
      id,
      data.vendorId,
      data.price,
      data.minimumOrderQuantity,
      data.leadTimeDays
    );
    res.status(201).json({ success: true, data: price });
  } catch (error) {
    console.error("Error adding material price:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else if (error instanceof Error && (error.message.includes("not found"))) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add price" 
      });
    }
  }
});

// GET /api/employee-portal/materials/:id/prices
router.get("/:id/prices", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const currentOnly = req.query.currentOnly !== "false";
    const prices = await MaterialService.getPrices(id, currentOnly);
    res.json({ success: true, data: prices });
  } catch (error) {
    console.error("Error fetching material prices:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch prices" 
    });
  }
});

// POST /api/employee-portal/materials/:id/reserve
router.post("/:id/reserve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const { quantity } = req.body;
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ success: false, error: "Invalid quantity" });
    }

    const inventory = await MaterialService.reserveInventory(id, quantity);
    res.json({ success: true, data: inventory });
  } catch (error) {
    console.error("Error reserving inventory:", error);
    if (error instanceof Error && error.message.includes("Insufficient inventory")) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to reserve inventory" 
      });
    }
  }
});

// POST /api/employee-portal/materials/:id/release-reserve
router.post("/:id/release-reserve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid material ID" });
    }

    const { quantity } = req.body;
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ success: false, error: "Invalid quantity" });
    }

    const inventory = await MaterialService.releaseReservedInventory(id, quantity);
    res.json({ success: true, data: inventory });
  } catch (error) {
    console.error("Error releasing reserved inventory:", error);
    if (error instanceof Error && error.message.includes("Cannot release more than reserved")) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to release inventory" 
      });
    }
  }
});

export default router;