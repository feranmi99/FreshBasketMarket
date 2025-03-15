import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertLandmarkSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Products endpoints
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const product = insertProductSchema.parse(req.body);
    const newProduct = await storage.createProduct(product);
    res.status(201).json(newProduct);
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const updates = req.body;
    const product = await storage.updateProduct(id, updates);
    res.json(product);
  });

  // Landmarks endpoints
  app.get("/api/landmarks", async (_req, res) => {
    const landmarks = await storage.getLandmarks();
    res.json(landmarks);
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orderData = insertOrderSchema.parse({
      ...req.body,
      userId: req.user.id,
      status: "pending"
    });

    const order = await storage.createOrder(orderData);

    // Create order items
    for (const item of req.body.items) {
      const orderItem = insertOrderItemSchema.parse({
        ...item,
        orderId: order.id
      });
      await storage.createOrderItem(orderItem);
    }

    res.status(201).json(order);
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orderId = parseInt(req.params.id);
    const items = await storage.getOrderItems(orderId);
    res.json(items);
  });

  const httpServer = createServer(app);
  return httpServer;
}
