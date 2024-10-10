DO $$ BEGIN
 CREATE TYPE "public"."star" AS ENUM('50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', '10000', '25000', '35000', '50000');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."duration" AS ENUM('سه ماهه', 'شش ماهه', 'یک ساله');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."paymentMethod" AS ENUM('IRR', 'TON');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"telegram_id" integer NOT NULL,
	"last_name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"roles" jsonb DEFAULT '["customer"]'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "premiums" (
	"id" text PRIMARY KEY NOT NULL,
	"duration" "duration" NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"ton" real NOT NULL,
	"irr" double precision NOT NULL,
	"icon" varchar(15) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stars" (
	"id" text PRIMARY KEY NOT NULL,
	"stars" "star" NOT NULL,
	"ton" real NOT NULL,
	"irr" double precision NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "paymentMethod" NOT NULL,
	"irr_price" double precision NOT NULL,
	"ton_quantity" double precision NOT NULL,
	"transaction_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"premium_id" text,
	"star_id" text,
	"order_placed" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_premium_id_premiums_id_fk" FOREIGN KEY ("premium_id") REFERENCES "public"."premiums"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_star_id_stars_id_fk" FOREIGN KEY ("star_id") REFERENCES "public"."stars"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_user_id_status_idx" ON "orders" USING btree ("user_id","status");