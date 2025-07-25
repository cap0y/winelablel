import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWineDesignSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Wine design routes
  app.post("/api/wine-designs", async (req, res) => {
    try {
      const designData = insertWineDesignSchema.parse(req.body);
      const design = await storage.createWineDesign(designData);
      res.json(design);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/wine-designs/:id", async (req, res) => {
    try {
      const design = await storage.getWineDesign(req.params.id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/wine-designs/:id", async (req, res) => {
    try {
      const updates = req.body;
      const design = await storage.updateWineDesign(req.params.id, updates);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Portone payment route
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { amount, designId, quantity } = req.body;
      
      // Create order first
      const order = await storage.createOrder({
        designId,
        quantity: quantity || 1,
        totalAmount: amount, // Keep in KRW
        status: "pending"
      });

      // Return payment information for Portone
      const paymentData = {
        merchant_uid: `order_${order.id}`, // 상점에서 관리하는 주문 번호
        name: "커스텀 와인라벨", // 상품명
        amount: amount, // 결제금액
        buyer_name: "고객", // 구매자 이름
        buyer_tel: "", // 구매자 전화번호
        buyer_email: "", // 구매자 이메일
        buyer_addr: "", // 구매자 주소
        buyer_postcode: "", // 구매자 우편번호
        orderId: order.id
      };

      res.json(paymentData);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment: " + error.message });
    }
  });

  // Webhook to handle payment verification
  app.post("/api/portone-webhook", async (req, res) => {
    try {
      const { merchant_uid, imp_uid, status } = req.body;
      
      // Extract order ID from merchant_uid
      const orderId = merchant_uid.replace('order_', '');
      
      if (status === 'paid') {
        await storage.updateOrderStatus(orderId, "paid", imp_uid);
      } else if (status === 'failed') {
        await storage.updateOrderStatus(orderId, "failed", imp_uid);
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
