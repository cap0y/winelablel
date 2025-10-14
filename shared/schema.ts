import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  phone: text("phone"),
  userType: text("user_type").default('user'),
  isApproved: boolean("is_approved").default(false),
  isSuperUser: boolean("is_super_user").default(false),
  franchiseInfo: jsonb("franchise_info"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  partnerId: text("partner_id"), // 포트원 파트너 ID
  partnerStatus: text("partner_status").default('pending'), // 'pending', 'active', 'rejected'
  bankInfo: jsonb("bank_info"), // 파트너 정산용 은행 정보
  createdAt: timestamp("created_at").defaultNow(),
});

// 와인 주문 테이블 정의
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // ORDER-XXXXXXXX 형식의 주문번호
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerZipCode: text("customer_zip_code"),
  bottleId: text("bottle_id").notNull(),
  bottleName: text("bottle_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  amount: integer("amount").notNull(),
  status: text("status").default('pending'), // 'pending', 'processed', 'completed', 'cancelled'
  paymentId: text("payment_id"), // 결제 식별자
  labelDesign: jsonb("label_design").notNull(), // 라벨 디자인 데이터
  labelImage: text("label_image"), // base64로 인코딩된 라벨 이미지 데이터
  deliveryMethod: text("delivery_method").default('standard'), // 'standard', 'express', 'same-day'
  deliveryFee: integer("delivery_fee").default(3000),
  trackingNumber: text("tracking_number"), // 운송장 번호
  shippingCompany: text("shipping_company"), // 배송 회사 (cj, lotte 등)
  shippingNotified: boolean("shipping_notified").default(false), // 배송 알림 전송 여부
  shippingNotifiedAt: timestamp("shipping_notified_at"), // 배송 알림 전송 시간
  userId: integer("user_id").references(() => users.id), // 회원 주문인 경우 사용자 ID
  publishToGallery: boolean("publish_to_gallery").default(false), // 갤러리에 공개 여부
  title: text("title"), // 갤러리에 표시될 라벨 제목
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 라벨 댓글 테이블
export const labelComments = pgTable("label_comments", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 라벨 별점 테이블
export const labelRatings = pgTable("label_ratings", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(), // 0.5 ~ 5.0
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 라벨 좋아요 테이블
export const labelLikes = pgTable("label_likes", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 라벨 배경 카테고리 테이블 추가
export const labelCategories = pgTable("label_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 배경 이미지와 카테고리 관계 테이블
export const labelBackgroundCategories = pgTable("label_background_categories", {
  id: serial("id").primaryKey(),
  backgroundId: text("background_id").notNull(),
  categoryId: integer("category_id").references(() => labelCategories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storageLocations = pgTable("storage_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  features: jsonb("features").default([]),
  images: jsonb("images").default([]),
  isActive: boolean("is_active").default(true),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storageUnits = pgTable("storage_units", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => storageLocations.id),
  size: text("size").notNull(), // 'SB', 'M', 'L', etc.
  dimensions: text("dimensions").notNull(), // "100x100x100"
  dailyPrice: decimal("daily_price", { precision: 10, scale: 2 }),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }),
  quarterlyPrice: decimal("quarterly_price", { precision: 10, scale: 2 }),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }),
  unitNumber: text("unit_number"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  storageUnitId: integer("storage_unit_id").references(() => storageUnits.id),
  subscriptionType: text("subscription_type").notNull(), // 'daily', 'monthly', 'quarterly', 'yearly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  status: text("status").default('pending'), // 'pending', 'active', 'cancelled', 'expired'
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 와인병 테이블 정의
export const wineBottles = pgTable("wine_bottles", {
  id: text("id").primaryKey(), // bordeaux-red, burgundy-white 등
  name: text("name").notNull(),
  image: text("image").notNull(),
  type: text("type").notNull(), // red, white, rose
  bottleType: text("bottle_type").notNull(), // bordeaux, burgundy
  dimensions: text("dimensions").notNull(),
  capacity: text("capacity").notNull(),
  price: integer("price").notNull(),
  labelWidth: decimal("label_width", { precision: 10, scale: 2 }).notNull(),
  labelHeight: decimal("label_height", { precision: 10, scale: 2 }).notNull(),
  labelPositionTop: integer("label_position_top").notNull(),
  labelPositionLeft: integer("label_position_left").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 알림 테이블 추가
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`), // UUID 자동 생성
  customerEmail: text("customer_email").notNull(), // 알림 받을 고객 이메일
  type: text("type").notNull(), // 'shipping', 'order', 'system'
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: text("order_id").references(() => orders.id), // 관련 주문 ID (선택사항)
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 예약 링크 테이블
export const reservationLinks = pgTable("reservation_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 소품(액세서리) 테이블
export const accessories = pgTable("accessories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull().default(0),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  stock: integer("stock").default(0),
  maxQty: integer("max_qty").default(99),
  displayOrder: integer("display_order").default(0),
  bundleEligible: boolean("bundle_eligible").default(false),
  bundleSize: integer("bundle_size").default(0),
  bundlePrice: integer("bundle_price").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 주문 테이블 스키마 추가
export const insertOrderSchema = createInsertSchema(orders).pick({
  id: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  customerAddress: true,
  customerZipCode: true,
  bottleId: true,
  bottleName: true,
  quantity: true,
  amount: true,
  status: true,
  paymentId: true,
  labelDesign: true,
  labelImage: true,
  deliveryMethod: true,
  deliveryFee: true,
  trackingNumber: true,
  shippingCompany: true,
  shippingNotified: true,
  shippingNotifiedAt: true,
  userId: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  photoURL: true,
  phone: true,
  userType: true,
  isApproved: true,
  isSuperUser: true,
  franchiseInfo: true,
  partnerId: true,
  partnerStatus: true,
  bankInfo: true,
});

export const insertStorageLocationSchema = createInsertSchema(storageLocations).pick({
  name: true,
  address: true,
  city: true,
  district: true,
  latitude: true,
  longitude: true,
  features: true,
  images: true,
  ownerId: true,
});

export const insertStorageUnitSchema = createInsertSchema(storageUnits).pick({
  locationId: true,
  size: true,
  dimensions: true,
  dailyPrice: true,
  monthlyPrice: true,
  quarterlyPrice: true,
  yearlyPrice: true,
  unitNumber: true,
});

// 기존 자동 생성 스키마 대신 수동으로 정의
export const insertReservationSchema = z.object({
  userId: z.number().int(),
  storageUnitId: z.number().int(),
  subscriptionType: z.string(),
  startDate: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]),
  endDate: z.union([
    z.string().transform(str => new Date(str)),
    z.date()
  ]),
  totalAmount: z.union([
    z.number().transform(num => String(num)),
    z.string()
  ]),
  paymentIntentId: z.string().optional(),
});

export const insertLabelCommentSchema = createInsertSchema(labelComments).pick({
  orderId: true,
  userId: true,
  content: true,
});

export const insertLabelRatingSchema = createInsertSchema(labelRatings).pick({
  orderId: true,
  userId: true,
  rating: true,
});

export const insertLabelLikeSchema = createInsertSchema(labelLikes).pick({
  orderId: true,
  userId: true,
});

export const insertLabelCategorySchema = createInsertSchema(labelCategories).pick({
  name: true,
  slug: true,
  description: true,
  isActive: true,
  displayOrder: true,
});

export const insertLabelBackgroundCategorySchema = createInsertSchema(labelBackgroundCategories).pick({
  backgroundId: true,
  categoryId: true,
});

export const insertWineBottleSchema = createInsertSchema(wineBottles);
export const insertAccessorySchema = createInsertSchema(accessories).pick({
  name: true,
  price: true,
  image: true,
  isActive: true,
  stock: true,
  maxQty: true,
  displayOrder: true,
  bundleEligible: true,
  bundleSize: true,
  bundlePrice: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStorageLocation = z.infer<typeof insertStorageLocationSchema>;
export type StorageLocation = typeof storageLocations.$inferSelect;

export type InsertStorageUnit = z.infer<typeof insertStorageUnitSchema>;
export type StorageUnit = typeof storageUnits.$inferSelect;

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;

export type InsertLabelComment = z.infer<typeof insertLabelCommentSchema>;
export type LabelComment = typeof labelComments.$inferSelect;

export type InsertLabelRating = z.infer<typeof insertLabelRatingSchema>;
export type LabelRating = typeof labelRatings.$inferSelect;

export type InsertLabelLike = z.infer<typeof insertLabelLikeSchema>;
export type LabelLike = typeof labelLikes.$inferSelect;

export type InsertLabelCategory = z.infer<typeof insertLabelCategorySchema>;
export type LabelCategory = typeof labelCategories.$inferSelect;

export type InsertLabelBackgroundCategory = z.infer<typeof insertLabelBackgroundCategorySchema>;
export type LabelBackgroundCategory = typeof labelBackgroundCategories.$inferSelect;
export type Accessory = typeof accessories.$inferSelect;
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;
