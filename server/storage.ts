import { users, wineDesigns, orders, type User, type InsertUser, type WineDesign, type InsertWineDesign, type Order, type InsertOrder } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createWineDesign(insertDesign: InsertWineDesign): Promise<WineDesign> {
    const [design] = await db
      .insert(wineDesigns)
      .values(insertDesign)
      .returning();
    return design;
  }

  async getWineDesign(id: string): Promise<WineDesign | undefined> {
    const [design] = await db.select().from(wineDesigns).where(eq(wineDesigns.id, id));
    return design || undefined;
  }

  async updateWineDesign(id: string, updates: Partial<WineDesign>): Promise<WineDesign | undefined> {
    const [design] = await db
      .update(wineDesigns)
      .set(updates)
      .where(eq(wineDesigns.id, id))
      .returning();
    return design || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async updateOrderStatus(id: string, status: string, paymentIntentId?: string): Promise<Order | undefined> {
    const updates: Partial<Order> = { status };
    if (paymentIntentId) {
      updates.portonePaymentId = paymentIntentId;
    }
    
    const [order] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }
}

export const storage = new DatabaseStorage();
