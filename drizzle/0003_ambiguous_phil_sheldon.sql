ALTER TABLE "receipt_split" RENAME COLUMN "receipt_id" TO "receipt_itemId";--> statement-breakpoint
ALTER TABLE "receipt_split" DROP CONSTRAINT "receipt_split_receipt_id_receipt_id_fk";
--> statement-breakpoint
ALTER TABLE "receipt_split" ADD CONSTRAINT "receipt_split_receipt_itemId_receipt_item_id_fk" FOREIGN KEY ("receipt_itemId") REFERENCES "public"."receipt_item"("id") ON DELETE no action ON UPDATE no action;