DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('shopper', 'customer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('inProgress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."star_prices" AS ENUM('0.1328', '0.1993', '0.2657', '0.3986', '0.6643', '0.9300', '1.3286', '1.9930', '2.6573', '3.9860', '6.6434', '13.2869', '26.5738', '66.4345', '93.0084', '132.8691');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."star_quantities" AS ENUM('50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', '10000', '25000', '35000', '50000');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_duration" AS ENUM('سه ماهه', 'شش ماهه', 'یک ساله');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_ton_price" AS ENUM('2.22', '2.96', '5.37');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" integer NOT NULL,
	"last_name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"status" "order_status" DEFAULT 'inProgress' NOT NULL,
	"user_id" uuid NOT NULL,
	"premium_id" uuid,
	"star_id" uuid,
	"order_placed" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "premiums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_duration" "subscription_duration" NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"ton" "subscription_ton_price" NOT NULL,
	"rial" varchar(30) NOT NULL,
	"icon" varchar(15) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stars" "star_quantities" NOT NULL,
	"ton" "star_prices" NOT NULL,
	"rial" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_premium_id_premiums_id_fk" FOREIGN KEY ("premium_id") REFERENCES "public"."premiums"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_star_id_stars_id_fk" FOREIGN KEY ("star_id") REFERENCES "public"."stars"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_unique_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_telegramId_idx" ON "users" USING btree ("telegram_id","username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_status_idx" ON "orders" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_idx" ON "orders" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "duration_ton_price_idx" ON "premiums" USING btree ("subscription_duration","ton");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "premium_rial_price_idx" ON "premiums" USING btree ("rial");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stars_ton_price_idx" ON "stars" USING btree ("stars","ton");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "star_rial_price_idx" ON "stars" USING btree ("rial");