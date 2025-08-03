import { pgTable, foreignKey, text, integer, jsonb, timestamp, boolean, unique, serial, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const orders = pgTable("orders", {
	id: text().primaryKey().notNull(),
	customerName: text("customer_name").notNull(),
	customerEmail: text("customer_email").notNull(),
	customerPhone: text("customer_phone"),
	customerAddress: text("customer_address"),
	customerZipCode: text("customer_zip_code"),
	bottleId: text("bottle_id").notNull(),
	bottleName: text("bottle_name").notNull(),
	quantity: integer().default(1).notNull(),
	amount: integer().notNull(),
	status: text().default('pending'),
	paymentId: text("payment_id"),
	labelDesign: jsonb("label_design").notNull(),
	labelImage: text("label_image"),
	deliveryMethod: text("delivery_method").default('standard'),
	deliveryFee: integer("delivery_fee").default(3000),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	publishToGallery: boolean("publish_to_gallery").default(false),
	title: text(),
	shippingNotifiedAt: timestamp("shipping_notified_at", { mode: 'string' }),
	trackingNumber: text("tracking_number"),
	shippingCompany: text("shipping_company"),
	shippingNotified: boolean("shipping_notified").default(false),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	displayName: text("display_name"),
	photoUrl: text("photo_url"),
	phone: text(),
	userType: text("user_type").default('user'),
	isApproved: boolean("is_approved").default(false),
	isSuperUser: boolean("is_super_user").default(false),
	franchiseInfo: jsonb("franchise_info"),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	partnerId: text("partner_id"),
	partnerStatus: text("partner_status").default('pending'),
	bankInfo: jsonb("bank_info"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
]);

// 라벨 배경 카테고리 테이블
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

export const labelLikes = pgTable("label_likes", {
	id: serial().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const labelRatings = pgTable("label_ratings", {
	id: serial().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	userId: text("user_id").notNull(),
	rating: numeric().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const labelComments = pgTable("label_comments", {
	id: serial().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	userId: text("user_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});
