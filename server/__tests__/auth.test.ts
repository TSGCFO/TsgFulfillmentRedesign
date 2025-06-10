import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { generateToken, verifyToken, requireRole } from '../auth';
import { storage } from '../storage';

// Mock dependencies
vi.mock('jsonwebtoken');
vi.mock('bcryptjs');
vi.mock('../storage');

describe('Authentication Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'sales_rep'
      };

      const mockToken = 'mock.jwt.token';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      const result = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          username: 'testuser',
          role: 'sales_rep'
        },
        expect.any(String),
        { expiresIn: '8h' }
      );
      expect(result).toBe(mockToken);
    });

    it('should use environment secret when available', () => {
      process.env.EMPLOYEE_PORTAL_SECRET = 'test-secret';
      const mockUser = { id: 1, username: 'test', role: 'admin' };

      generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'test-secret',
        expect.any(Object)
      );

      delete process.env.EMPLOYEE_PORTAL_SECRET;
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token and set user in request', () => {
      const mockDecodedToken = {
        id: 1,
        username: 'testuser',
        role: 'sales_rep'
      };

      req.headers = {
        authorization: 'Bearer valid.jwt.token'
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecodedToken as any);

      verifyToken(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', expect.any(String));
      expect((req as any).user).toEqual(mockDecodedToken);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when no token provided', () => {
      req.headers = {};

      verifyToken(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      req.headers = {
        authorization: 'Bearer invalid.token'
      };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      verifyToken(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid access token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle Bearer token format correctly', () => {
      const mockDecodedToken = { id: 1, username: 'test', role: 'admin' };
      req.headers = {
        authorization: 'Bearer test.token.here'
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecodedToken as any);

      verifyToken(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith('test.token.here', expect.any(String));
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      (req as any).user = {
        id: 1,
        username: 'testuser',
        role: 'sales_rep'
      };
    });

    it('should allow access when user has required role', () => {
      const middleware = requireRole(['sales_rep', 'admin']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access when user does not have required role', () => {
      const middleware = requireRole(['admin']);

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when no user in request', () => {
      delete (req as any).user;
      const middleware = requireRole(['sales_rep']);

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with multiple allowed roles', () => {
      (req as any).user.role = 'inventory_manager';
      const middleware = requireRole(['sales_rep', 'inventory_manager', 'admin']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should be case sensitive for roles', () => {
      (req as any).user.role = 'Sales_Rep';
      const middleware = requireRole(['sales_rep']);

      middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases and security', () => {
    it('should handle malformed authorization header', () => {
      req.headers = {
        authorization: 'InvalidFormat token'
      };

      verifyToken(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith('InvalidFormat token', expect.any(String));
    });

    it('should handle empty authorization header', () => {
      req.headers = {
        authorization: ''
      };

      verifyToken(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should not expose sensitive information in error messages', () => {
      req.headers = {
        authorization: 'Bearer invalid.token'
      };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Sensitive internal error with secrets');
      });

      verifyToken(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid access token'
      });
    });
  });
});