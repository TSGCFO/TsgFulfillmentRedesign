import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { Employee as SelectEmployee } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectEmployee {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Handle bcrypt passwords (from migrated users table)
  if (stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
    const bcrypt = await import("bcrypt");
    return bcrypt.compare(supplied, stored);
  }
  
  // Handle scrypt passwords (new format)
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Export middleware functions first
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export function canManageUsers(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // SuperAdmin has full access, Admin can manage but not SuperAdmins or themselves
  const userRole = req.user?.role;
  if (!["SuperAdmin", "Admin"].includes(userRole)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user?.role !== "SuperAdmin") {
    return res.status(403).json({ error: "SuperAdmin access required" });
  }
  next();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const employee = await storage.getEmployeeByUsername(username);
      if (!employee || !(await comparePasswords(password, employee.password))) {
        return done(null, false);
      } else {
        await storage.updateEmployee(employee.id, { lastLogin: new Date() });
        return done(null, employee);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const employee = await storage.getEmployee(id);
    done(null, employee);
  });

  // Role-based middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  }

  function requireRole(roles: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      next();
    };
  }

  function canManageUsers(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    // SuperAdmin has full access, Admin can manage but not SuperAdmins or themselves
    const userRole = req.user?.role;
    if (!["SuperAdmin", "Admin"].includes(userRole)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  }

  function requireSuperAdmin(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user?.role !== "SuperAdmin") {
      return res.status(403).json({ error: "SuperAdmin access required" });
    }
    next();
  }

  app.post("/api/register", async (req, res, next) => {
    const existingEmployee = await storage.getEmployeeByUsername(req.body.username);
    if (existingEmployee) {
      return res.status(400).send("Username already exists");
    }

    const employee = await storage.createEmployee({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(employee, (err) => {
      if (err) return next(err);
      res.status(201).json(employee);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Employee management routes (admin only)
  app.get("/api/employees", requireRole(["admin"]), async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const sanitizedEmployees = employees.map(({ password, ...employee }) => employee);
      res.json(sanitizedEmployees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const employee = await storage.getEmployee(employeeId);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Users can only view their own profile unless they're admin
      if (req.user?.role !== "admin" && req.user?.id !== employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { password, ...sanitizedEmployee } = employee;
      res.json(sanitizedEmployee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.put("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      
      // Users can only update their own profile unless they're admin
      if (req.user?.role !== "admin" && req.user?.id !== employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData = { ...req.body };
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      const updatedEmployee = await storage.updateEmployee(employeeId, updateData);
      if (!updatedEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const { password, ...sanitizedEmployee } = updatedEmployee;
      res.json(sanitizedEmployee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", canManageUsers, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      
      // Prevent deleting own account
      if (req.user?.id === employeeId) {
        return res.status(400).json({ error: "Cannot delete own account" });
      }

      const deleted = await storage.deleteEmployee(employeeId);
      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Export middleware functions for use in routes
  return { requireAuth, requireRole, canManageUsers };
}