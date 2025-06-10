import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateToken, authenticate } from "../../middleware/employee-portal/auth";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
});

// POST /api/employee-portal/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        success: false, 
        error: "Invalid request data", 
        details: error.errors 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: "Failed to login" 
      });
    }
  }
});

// GET /api/employee-portal/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch user data" 
    });
  }
});

// POST /api/employee-portal/auth/change-password
router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        success: false, 
        error: "Invalid request data", 
        details: error.errors 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: "Failed to change password" 
      });
    }
  }
});

// POST /api/employee-portal/auth/logout
router.post("/logout", authenticate, (req, res) => {
  // In a stateless JWT setup, logout is handled client-side by removing the token
  // Here we can log the logout action or invalidate the token if using a blacklist
  
  console.log(`User ${req.user?.username} logged out`);
  
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// POST /api/employee-portal/auth/refresh
router.post("/refresh", authenticate, async (req, res) => {
  try {
    // Verify user still exists and is active
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Generate new token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to refresh token" 
    });
  }
});

export default router;