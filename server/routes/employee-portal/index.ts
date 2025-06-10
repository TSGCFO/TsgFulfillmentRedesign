import express from "express";
import authRouter from "./auth";
import quoteInquiriesRouter from "./quoteInquiries";
import materialsRouter from "./materials";
import { authenticate, rateLimit } from "../../middleware/employee-portal/auth";
// Import other routers as they are created
// import contractsRouter from "./contracts";
// import salesTeamRouter from "./salesTeam";
// import vendorsRouter from "./vendors";
// import purchaseOrdersRouter from "./purchaseOrders";

const router = express.Router();

// Apply rate limiting to all routes
router.use(rateLimit(200, 60000)); // 200 requests per minute

// Auth routes (no authentication required)
router.use("/auth", authRouter);

// Apply authentication to all other employee portal routes
router.use(authenticate);

// Mount protected sub-routers
router.use("/quote-inquiries", quoteInquiriesRouter);
router.use("/materials", materialsRouter);
// router.use("/contracts", contractsRouter);
// router.use("/sales-team", salesTeamRouter);
// router.use("/vendors", vendorsRouter);
// router.use("/purchase-orders", purchaseOrdersRouter);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Employee Portal API is running",
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user.id, username: req.user.username, role: req.user.role } : null
  });
});

// Dashboard statistics endpoint
router.get("/dashboard/stats", async (req, res) => {
  try {
    // This will be implemented to aggregate stats from various services
    const stats = {
      quoteInquiries: {
        total: 0,
        new: 0,
        inProgress: 0,
        completed: 0
      },
      contracts: {
        total: 0,
        pending: 0,
        completed: 0,
        expiringSoon: 0
      },
      inventory: {
        totalMaterials: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      },
      purchaseOrders: {
        total: 0,
        pending: 0,
        approved: 0,
        totalValue: 0
      },
      user: {
        id: req.user?.id,
        username: req.user?.username,
        role: req.user?.role
      }
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch dashboard statistics" 
    });
  }
});

export default router;