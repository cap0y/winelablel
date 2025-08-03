-- Add shipping related fields to orders table
ALTER TABLE "orders" ADD COLUMN "tracking_number" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipping_company" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipping_notified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "orders" ADD COLUMN "shipping_notified_at" TIMESTAMP; 