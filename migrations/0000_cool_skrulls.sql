CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"storage_unit_id" integer,
	"subscription_type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_amount" numeric(10, 2),
	"status" text DEFAULT 'pending',
	"payment_intent_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storage_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"features" jsonb DEFAULT '[]'::jsonb,
	"images" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storage_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer,
	"size" text NOT NULL,
	"dimensions" text NOT NULL,
	"daily_price" numeric(10, 2),
	"monthly_price" numeric(10, 2),
	"quarterly_price" numeric(10, 2),
	"yearly_price" numeric(10, 2),
	"unit_number" text,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"phone" text,
	"user_type" text DEFAULT 'user',
	"is_approved" boolean DEFAULT false,
	"is_super_user" boolean DEFAULT false,
	"franchise_info" jsonb,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"partner_id" text,
	"partner_status" text DEFAULT 'pending',
	"bank_info" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_storage_unit_id_storage_units_id_fk" FOREIGN KEY ("storage_unit_id") REFERENCES "public"."storage_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_units" ADD CONSTRAINT "storage_units_location_id_storage_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id") ON DELETE no action ON UPDATE no action;