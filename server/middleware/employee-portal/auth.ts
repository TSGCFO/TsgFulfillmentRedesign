import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}

// JWT secret - should be in environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Role definitions
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  VIEWER: "viewer"
} as const;

// Permission levels
export const PERMISSIONS = {
  // Quote Inquiry permissions
  VIEW_QUOTES: ["admin", "manager", "employee", "viewer"],
  CREATE_QUOTES: ["admin", "manager", "employee"],
  UPDATE_QUOTES: ["admin", "manager", "employee"],
  DELETE_QUOTES: ["admin", "manager"],
  ASSIGN_QUOTES: ["admin", "manager"],
  
  // Contract permissions
  VIEW_CONTRACTS: ["admin", "manager", "employee", "viewer"],
  CREATE_CONTRACTS: ["admin", "manager"],
  UPDATE_CONTRACTS: ["admin", "manager"],
  DELETE_CONTRACTS: ["admin"],
  
  // Inventory permissions
  VIEW_INVENTORY: ["admin", "manager", "employee", "viewer"],
  UPDATE_INVENTORY: ["admin", "manager", "employee"],
  CREATE_MATERIALS: ["admin", "manager"],
  DELETE_MATERIALS: ["admin"],
  
  // Purchase Order permissions
  VIEW_PURCHASE_ORDERS: ["admin", "manager", "employee", "viewer"],
  CREATE_PURCHASE_ORDERS: ["admin", "manager"],
  APPROVE_PURCHASE_ORDERS: ["admin"],
  
  // Admin permissions
  MANAGE_USERS: ["admin"],
  MANAGE_SALES_TEAM: ["admin", "manager"],
  VIEW_ALL_DATA: ["admin", "manager"],
  EXPORT_DATA: ["admin", "manager"],
} as const;

// Verify JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Generate JWT token
export function generateToken(user: { id: number; username: string; role: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

// Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: "Authentication required" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: "Invalid or expired token" 
    });
  }
}

// Authorization middleware factory
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: "Insufficient permissions" 
      });
    }

    next();
  };
}

// Check specific permission
export function hasPermission(permission: keyof typeof PERMISSIONS) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required" 
      });
    }

    const allowedRoles = PERMISSIONS[permission] as readonly string[];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Permission denied: ${permission}` 
      });
    }

    next();
  };
}

// Optional authentication - doesn't fail if no token, but adds user if present
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };
    } catch (error) {
      // Invalid token, but continue without user
    }
  }

  next();
}

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    const now = Date.now();
    
    const userLimit = requestCounts.get(key);
    
    if (!userLimit || now > userLimit.resetTime) {
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({ 
        success: false, 
        error: "Too many requests",
        retryAfter 
      });
    }
    
    userLimit.count++;
    next();
  };
}

// API key authentication for external integrations
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      error: "API key required" 
    });
  }

  // TODO: Implement API key validation against database
  // For now, check against environment variable
  if (apiKey !== process.env.EMPLOYEE_PORTAL_API_KEY) {
    return res.status(401).json({ 
      success: false, 
      error: "Invalid API key" 
    });
  }

  next();
}

// Audit logging middleware
export function auditLog(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function(data: any) {
      res.send = originalSend;
      
      // Log the action
      console.log({
        action,
        user: req.user?.username || "anonymous",
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.headers["user-agent"]
      });

      return res.send(data);
    };

    next();
  };
}