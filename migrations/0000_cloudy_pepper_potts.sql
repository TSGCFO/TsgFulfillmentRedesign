CREATE TABLE "client_kpis" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"month" date NOT NULL,
	"shipping_accuracy" real,
	"inventory_accuracy" real,
	"on_time_delivery" real,
	"return_rate" real,
	"average_order_value" real,
	"total_orders" integer,
	"customer_satisfaction" real
);
--> statement-breakpoint
CREATE TABLE "dashboard_settings" (
	"user_id" integer NOT NULL,
	"widget_id" text NOT NULL,
	"position" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_settings_user_id_widget_id_pk" PRIMARY KEY("user_id","widget_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"warehouse_location" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"minimum_level" integer DEFAULT 0,
	"maximum_level" integer
);
--> statement-breakpoint
CREATE TABLE "order_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"date" date NOT NULL,
	"orders_received" integer DEFAULT 0,
	"orders_processed" integer DEFAULT 0,
	"orders_fulfilled" integer DEFAULT 0,
	"average_processing_time" real,
	"total_value" real DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"company" text NOT NULL,
	"service" text NOT NULL,
	"current_shipments" text,
	"expected_shipments" text,
	"services" text,
	"message" text,
	"consent" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_to" integer,
	"converted_to_client" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"tracking_number" text,
	"carrier" text NOT NULL,
	"ship_date" timestamp DEFAULT now() NOT NULL,
	"delivery_date" timestamp,
	"status" text DEFAULT 'processing' NOT NULL,
	"weight" real,
	"cost" real,
	"destination" text NOT NULL,
	"service_level" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_inquiry_id" integer,
	"docusign_envelope_id" text NOT NULL,
	"supabase_file_path" text,
	"supabase_file_url" text,
	"client_name" text,
	"client_email" text,
	"contract_type" text,
	"status" text DEFAULT 'pending',
	"signed_at" timestamp,
	"expires_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hubspot_sync_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"request_data" jsonb,
	"response_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "material_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer,
	"current_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"location" text,
	"last_counted_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "material_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer,
	"vendor_id" integer,
	"price" real NOT NULL,
	"minimum_order_quantity" integer DEFAULT 1,
	"lead_time_days" integer,
	"is_current" boolean DEFAULT true,
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "material_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer,
	"quantity_used" integer NOT NULL,
	"used_for" text,
	"used_by" integer,
	"usage_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"unit_of_measure" text,
	"reorder_point" integer,
	"reorder_quantity" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer,
	"material_id" integer,
	"quantity" integer NOT NULL,
	"unit_price" real NOT NULL,
	"total_price" real NOT NULL,
	"received_quantity" integer DEFAULT 0,
	"received_date" date
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer,
	"po_number" text NOT NULL,
	"status" text DEFAULT 'draft',
	"order_date" date,
	"expected_delivery_date" date,
	"total_amount" real,
	"created_by" integer,
	"approved_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_request_id" integer,
	"assigned_to" integer,
	"hubspot_deal_id" text,
	"hubspot_contact_id" text,
	"status" text DEFAULT 'new',
	"priority" text DEFAULT 'medium',
	"last_synced_at" timestamp,
	"sync_status" text DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_inquiry_id" integer,
	"version_number" integer NOT NULL,
	"pricing_data" jsonb NOT NULL,
	"services" jsonb NOT NULL,
	"terms" text,
	"valid_until" date,
	"created_by" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"hubspot_owner_id" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"payment_terms" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "dashboard_settings" ADD CONSTRAINT "dashboard_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_quote_inquiry_id_quote_inquiries_id_fk" FOREIGN KEY ("quote_inquiry_id") REFERENCES "public"."quote_inquiries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_inventory" ADD CONSTRAINT "material_inventory_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_prices" ADD CONSTRAINT "material_prices_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_prices" ADD CONSTRAINT "material_prices_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage" ADD CONSTRAINT "material_usage_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_usage" ADD CONSTRAINT "material_usage_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_inquiries" ADD CONSTRAINT "quote_inquiries_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_inquiries" ADD CONSTRAINT "quote_inquiries_assigned_to_sales_team_members_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."sales_team_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_quote_inquiry_id_quote_inquiries_id_fk" FOREIGN KEY ("quote_inquiry_id") REFERENCES "public"."quote_inquiries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_created_by_sales_team_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."sales_team_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_team_members" ADD CONSTRAINT "sales_team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;