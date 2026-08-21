CREATE TABLE "receipt_split" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"split_percentage" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "receipt_item" RENAME COLUMN "total_price" TO "price";--> statement-breakpoint
ALTER TABLE "receipt" ADD COLUMN "group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "receipt_split" ADD CONSTRAINT "receipt_split_receipt_id_receipt_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_split" ADD CONSTRAINT "receipt_split_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_item" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "receipt_item" DROP COLUMN "unit_price";--> statement-breakpoint
ALTER TABLE "receipt_item" DROP COLUMN "discount";