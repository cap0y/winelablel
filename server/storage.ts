import { type User, type InsertUser, type WineDesign, type InsertWineDesign, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createWineDesign(design: InsertWineDesign): Promise<WineDesign>;
  getWineDesign(id: string): Promise<WineDesign | undefined>;
  updateWineDesign(id: string, design: Partial<WineDesign>): Promise<WineDesign | undefined>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, paymentIntentId?: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private wineDesigns: Map<string, WineDesign>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.wineDesigns = new Map();
    this.orders = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createWineDesign(insertDesign: InsertWineDesign): Promise<WineDesign> {
    const id = randomUUID();
    const design: WineDesign = { 
      ...insertDesign,
      userId: insertDesign.userId || null,
      icons: insertDesign.icons ? [...insertDesign.icons] : null,
      id,
      createdAt: new Date().toISOString(),
    };
    this.wineDesigns.set(id, design);
    return design;
  }

  async getWineDesign(id: string): Promise<WineDesign | undefined> {
    return this.wineDesigns.get(id);
  }

  async updateWineDesign(id: string, updates: Partial<WineDesign>): Promise<WineDesign | undefined> {
    const design = this.wineDesigns.get(id);
    if (!design) return undefined;
    
    const updatedDesign = { ...design, ...updates };
    this.wineDesigns.set(id, updatedDesign);
    return updatedDesign;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder,
      status: insertOrder.status || "pending",
      portonePaymentId: insertOrder.portonePaymentId || null,
      quantity: insertOrder.quantity || 1,
      id,
      createdAt: new Date().toISOString(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: string, status: string, paymentIntentId?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      ...(paymentIntentId && { portonePaymentId: paymentIntentId })
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
