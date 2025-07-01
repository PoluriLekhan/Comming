import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertAdminSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Subscriber routes
  app.post("/api/subscribers", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getSubscriberByEmail(validatedData.email);
      if (existing) {
        return res.status(409).json({ 
          error: "Email already subscribed", 
          code: "23505" 
        });
      }

      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.get("/api/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ error: "Failed to get subscribers" });
    }
  });

  app.get("/api/subscribers/count", async (req, res) => {
    try {
      const count = await storage.getSubscriberCount();
      res.json({ count });
    } catch (error) {
      console.error("Get subscriber count error:", error);
      res.status(500).json({ error: "Failed to get subscriber count" });
    }
  });

  app.delete("/api/subscribers/:id", async (req, res) => {
    try {
      await storage.deleteSubscriber(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete subscriber error:", error);
      res.status(500).json({ error: "Failed to delete subscriber" });
    }
  });

  // Admin session routes
  app.post("/api/admin-sessions", async (req, res) => {
    try {
      const { username, password, session_token, expires_at } = req.body;
      
      // Simple hardcoded authentication
      if (username !== 'Lekhan' || password !== 'L2009@khan!') {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionData = {
        session_token,
        username,
        expires_at: new Date(expires_at)
      };

      const session = await storage.createAdminSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Create admin session error:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/admin-sessions/:token", async (req, res) => {
    try {
      const session = await storage.getAdminSession(req.params.token);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Check if session is expired
      if (session.expires_at <= new Date()) {
        await storage.deleteAdminSession(req.params.token);
        return res.status(404).json({ error: "Session expired" });
      }

      res.json(session);
    } catch (error) {
      console.error("Get admin session error:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.delete("/api/admin-sessions/:token", async (req, res) => {
    try {
      await storage.deleteAdminSession(req.params.token);
      res.status(204).send();
    } catch (error) {
      console.error("Delete admin session error:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
