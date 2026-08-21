ALTER TABLE "receipt_item" DROP CONSTRAINT "receipt_item_receipt_id_receipt_id_fk";
--> statement-breakpoint
ALTER TABLE "receipt_split" DROP CONSTRAINT "receipt_split_receipt_item_id_receipt_item_id_fk";
--> statement-breakpoint
ALTER TABLE "receipt_item" ADD CONSTRAINT "receipt_item_receipt_id_receipt_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_split" ADD CONSTRAINT "receipt_split_receipt_item_id_receipt_item_id_fk" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."receipt_item"("id") ON DELETE cascade ON UPDATE no action;