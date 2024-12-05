CREATE TYPE "public"."order_status" AS ENUM('pending', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('premium', 'star');--> statement-breakpoint
CREATE TYPE "public"."star" AS ENUM('50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', '10000', '25000', '35000', '50000');--> statement-breakpoint
CREATE TYPE "public"."duration" AS ENUM('سه ماهه', 'شش ماهه', 'یک ساله');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"ton_quantity" integer NOT NULL,
	"irr_price" integer NOT NULL,
	"transaction_id" integer NOT NULL,
	"service_id" uuid NOT NULL,
	"order_placed" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ordered_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" "type" NOT NULL,
	"premium_id" uuid,
	"star_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "premiums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration" "duration" NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ton_quantity" integer NOT NULL,
	"irr_price" integer NOT NULL,
	"icon" varchar(15) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stars" "star" NOT NULL,
	"ton_quantity" integer NOT NULL,
	"irr_price" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" integer NOT NULL,
	"fullname" varchar NOT NULL,
	"username" varchar NOT NULL,
	"roles" jsonb DEFAULT '["customer"]'::jsonb NOT NULL,
	"last_login" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_ordered_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."ordered_services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordered_services" ADD CONSTRAINT "ordered_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordered_services" ADD CONSTRAINT "ordered_services_premium_id_premiums_id_fk" FOREIGN KEY ("premium_id") REFERENCES "public"."premiums"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ordered_services" ADD CONSTRAINT "ordered_services_star_id_stars_id_fk" FOREIGN KEY ("star_id") REFERENCES "public"."stars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_places_idx" ON "orders" USING btree ("order_placed");