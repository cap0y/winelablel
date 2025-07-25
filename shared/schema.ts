import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wineDesigns = pgTable("wine_designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  bottleType: text("bottle_type").notNull(),
  labelDesign: text("label_design").notNull(),
  icons: json("icons").$type<string[]>().default([]),
  textElements: json("text_elements").$type<{
    name: string;
    vintage: string;
    type: string;
    positions: {
      name: { x: number; y: number };
      vintage: { x: number; y: number };
      type: { x: number; y: number };
    };
    fonts: {
      name: string;
      vintage: string;
      type: string;
    };
  }>().notNull(),
  createdAt: text("created_at").default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  designId: varchar("design_id").references(() => wineDesigns.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: integer("total_amount").notNull(), // in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"), // pending, paid, shipped
  createdAt: text("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWineDesignSchema = createInsertSchema(wineDesigns).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WineDesign = typeof wineDesigns.$inferSelect;
export type InsertWineDesign = z.infer<typeof insertWineDesignSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
