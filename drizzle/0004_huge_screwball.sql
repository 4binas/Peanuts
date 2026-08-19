ALTER TABLE "receipt_split" RENAME COLUMN "receipt_itemId" TO "receipt_item_id";--> statement-breakpoint
ALTER TABLE "receipt_split" DROP CONSTRAINT "receipt_split_receipt_itemId_receipt_item_id_fk";
--> statement-breakpoint
ALTER TABLE "receipt_split" ADD CONSTRAINT "receipt_split_receipt_item_id_receipt_item_id_fk" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."receipt_item"("id") ON DELETE no action ON UPDATE no action;