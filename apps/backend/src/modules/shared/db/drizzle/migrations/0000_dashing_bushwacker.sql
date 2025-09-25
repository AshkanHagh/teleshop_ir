CREATE TYPE "public"."order_status" AS ENUM('pending', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('premium', 'star');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"ton" bigint NOT NULL,
	"irr" bigint NOT NULL,
	"transaction_id" integer NOT NULL,
	"service_id" uuid NOT NULL,
	"order_placed" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordered_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" "type" NOT NULL,
	"premium_id" uuid,
	"star_id" uuid
);
--> statement-breakpoint
CREATE TABLE "premiums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration" varchar(255) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ton" bigint NOT NULL,
	"irr" bigint NOT NULL,
	"icon" varchar(15) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"route" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stars" integer NOT NULL,
	"ton" bigint NOT NULL,
	"irr" bigint NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" bigint NOT NULL,
	"fullname" varchar(140) NOT NULL,
	"username" varchar(70) NOT NULL,
	"roles" jsonb DEFAULT '["customer"]'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_ordered_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."ordered_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordered_services" ADD CONSTRAINT "ordered_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordered_services" ADD CONSTRAINT "ordered_services_premium_id_premiums_id_fk" FOREIGN KEY ("premium_id") REFERENCES "public"."premiums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordered_services" ADD CONSTRAINT "ordered_services_star_id_stars_id_fk" FOREIGN KEY ("star_id") REFERENCES "public"."stars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_places_idx" ON "orders" USING btree ("order_placed");--> statement-breakpoint
CREATE INDEX "order_status_order_placed_idx" ON "orders" USING btree ("status","order_placed" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_id_idx" ON "users" USING btree ("telegram_id");