import express from "express";
import { QuoteInquiryService } from "../../services/employee-portal/quoteInquiryService";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const createInquirySchema = z.object({
  quoteRequestId: z.number(),
  assignedTo: z.number().optional(),
});

const updateInquirySchema = z.object({
  assignedTo: z.number().optional(),
  status: z.enum(["new", "contacted", "quoted", "negotiating", "won", "lost"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  notes: z.string().optional(),
  hubspotDealId: z.string().optional(),
  hubspotContactId: z.string().optional(),
});

const filterSchema = z.object({
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// GET /api/employee-portal/quote-inquiries
router.get("/", async (req, res) => {
  try {
    const filters = filterSchema.parse(req.query);
    
    // Convert string IDs to numbers
    const processedFilters = {
      ...filters,
      assignedTo: filters.assignedTo ? parseInt(filters.assignedTo) : undefined,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };

    const inquiries = await QuoteInquiryService.getAll(processedFilters);
    res.json({ success: true, data: inquiries });
  } catch (error) {
    console.error("Error fetching quote inquiries:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch quote inquiries" 
    });
  }
});

// GET /api/employee-portal/quote-inquiries/unassigned
router.get("/unassigned", async (req, res) => {
  try {
    const inquiries = await QuoteInquiryService.getUnassigned();
    res.json({ success: true, data: inquiries });
  } catch (error) {
    console.error("Error fetching unassigned inquiries:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch unassigned inquiries" 
    });
  }
});

// GET /api/employee-portal/quote-inquiries/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid inquiry ID" });
    }

    const inquiry = await QuoteInquiryService.getById(id);
    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Error fetching quote inquiry:", error);
    if (error instanceof Error && error.message === "Quote inquiry not found") {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch quote inquiry" 
      });
    }
  }
});

// POST /api/employee-portal/quote-inquiries
router.post("/", async (req, res) => {
  try {
    const data = createInquirySchema.parse(req.body);
    const inquiry = await QuoteInquiryService.createFromQuoteRequest(
      data.quoteRequestId,
      data.assignedTo
    );
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Error creating quote inquiry:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create quote inquiry" 
      });
    }
  }
});

// PUT /api/employee-portal/quote-inquiries/:id
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid inquiry ID" });
    }

    const data = updateInquirySchema.parse(req.body);
    const inquiry = await QuoteInquiryService.update(id, data);
    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Error updating quote inquiry:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid request data", details: error.errors });
    } else if (error instanceof Error && error.message === "Quote inquiry not found") {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update quote inquiry" 
      });
    }
  }
});

// PUT /api/employee-portal/quote-inquiries/:id/assign
router.put("/:id/assign", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid inquiry ID" });
    }

    const { salesPersonId } = req.body;
    if (!salesPersonId || typeof salesPersonId !== "number") {
      return res.status(400).json({ success: false, error: "Invalid sales person ID" });
    }

    const inquiry = await QuoteInquiryService.assignToSalesPerson(id, salesPersonId);
    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Error assigning quote inquiry:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to assign quote inquiry" 
    });
  }
});

// PUT /api/employee-portal/quote-inquiries/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid inquiry ID" });
    }

    const { status } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const inquiry = await QuoteInquiryService.updateStatus(id, status);
    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Error updating quote inquiry status:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update status" 
    });
  }
});

// POST /api/employee-portal/quote-inquiries/:id/sync-hubspot
router.post("/:id/sync-hubspot", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid inquiry ID" });
    }

    const result = await QuoteInquiryService.syncWithHubSpot(id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error syncing with HubSpot:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to sync with HubSpot" 
    });
  }
});

// GET /api/employee-portal/quote-inquiries/:id/sync-history
router.get("/:id/sync-history", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid inquiry ID" });
    }

    const history = await QuoteInquiryService.getSyncHistory(id);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching sync history:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch sync history" 
    });
  }
});

export default router;