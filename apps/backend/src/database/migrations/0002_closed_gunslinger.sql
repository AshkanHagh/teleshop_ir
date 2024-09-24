DO $$ BEGIN
 CREATE TYPE "public"."paymentMethod" AS ENUM('IRR', 'TON');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" "paymentMethod" NOT NULL;