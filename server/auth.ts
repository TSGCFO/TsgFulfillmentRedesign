import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "tsg-fulfillment-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.isActive || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        
        // Update last login
        await storage.updateUser(user.id, { lastLogin: new Date() });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  }

  // Middleware to check user role permissions
  function requireRole(roles: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      next();
    };
  }

  // Middleware to check if user can manage other users
  function canManageUsers(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const userRole = req.user.role;
    if (userRole !== "SuperAdmin" && userRole !== "Admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    next();
  }

  // Register endpoint
  app.post("/api/register", canManageUsers, async (req, res, next) => {
    try {
      const { fullName, username, email, password, role } = req.body;
      
      // Validate input
      if (!fullName || !username || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Admins cannot create SuperAdmin users
      if (req.user.role === "Admin" && role === "SuperAdmin") {
        return res.status(403).json({ error: "Cannot create SuperAdmin users" });
      }
      
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        fullName,
        username,
        email,
        password: hashedPassword,
        role,
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", requireAuth, (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Get all users (SuperAdmin and Admin only)
  app.get("/api/users", canManageUsers, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      
      // Filter out SuperAdmin users if the requester is an Admin
      let filteredUsers = users;
      if (req.user.role === "Admin") {
        filteredUsers = users.filter(user => user.role !== "SuperAdmin");
      }
      
      // Remove passwords from response
      const usersWithoutPasswords = filteredUsers.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });

  // Update user (SuperAdmin and Admin only, with restrictions)
  app.put("/api/users/:id", canManageUsers, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const { fullName, username, email, role, isActive } = req.body;
      
      // Get the user being updated
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Admins cannot modify SuperAdmin users
      if (req.user.role === "Admin" && targetUser.role === "SuperAdmin") {
        return res.status(403).json({ error: "Cannot modify SuperAdmin users" });
      }
      
      // Admins cannot create SuperAdmin users
      if (req.user.role === "Admin" && role === "SuperAdmin") {
        return res.status(403).json({ error: "Cannot assign SuperAdmin role" });
      }
      
      // Users cannot modify themselves (to prevent lockout)
      if (req.user.id === userId) {
        return res.status(403).json({ error: "Cannot modify your own account" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        username,
        email,
        role,
        isActive,
        updatedAt: new Date(),
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // Delete user (SuperAdmin only)
  app.delete("/api/users/:id", requireRole(["SuperAdmin"]), async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users cannot delete themselves
      if (req.user.id === userId) {
        return res.status(403).json({ error: "Cannot delete your own account" });
      }
      
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Export middleware functions for use in other routes
  app.locals.requireAuth = requireAuth;
  app.locals.requireRole = requireRole;
  app.locals.canManageUsers = canManageUsers;
}