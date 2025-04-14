import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quote request endpoint
  app.post('/api/quote', async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      
      // Store the quote request in the storage
      await storage.createQuoteRequest(validatedData);
      
      // Return success response
      res.status(200).json({ message: 'Quote request received successfully' });
    } catch (error) {
      console.error('Error processing quote request:', error);
      res.status(400).json({ 
        message: 'Invalid quote request data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
