import { db } from '../db';
import { receipt, receipt_item } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const ReceiptItemSchema = z.object({
	name: z.string(),
	description: z.string(),
	quantity: z.number(),
	unitPrice: z.number(),
	discount: z.number(),
	totalPrice: z.number(),
	currency: z.string()
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;

export const ReceiptSchema = z.object({
	id: z.number(),
	userId: z.string(),
	storeName: z.string(),
	boughtAt: z.iso.datetime(),
	items: z.array(ReceiptItemSchema),
	totalPrice: z.number()
});

export type Receipt = z.infer<typeof ReceiptSchema>;

class ReceiptRepository {
	async getReceipts(userId: string) {
		const receipts = await db.select().from(receipt).where(eq(receipt.userId, userId));
		return receipts;
	}

	async createReceipt(
		userId: string,
		storeName: string,
		totalPrice: number,
		items?: ReceiptItem[],
		boughtAt: Date = new Date()
	) {
		const newReceipt = await db
			.insert(receipt)
			.values({
				userId,
				storeName,
				totalPrice: Number.parseInt((totalPrice * 100).toFixed(0), 10)
			})
			.returning()
			.then((res) => res[0]);
		if (items) {
			await db.insert(receipt_item).values(
				items.map((item) => ({
					...item,
					receiptId: newReceipt.id,
					unitPrice: Number.parseInt((item.unitPrice * 100).toFixed(0), 10),
					discount: Number.parseInt((item.discount * 100).toFixed(0), 10),
					totalPrice: Number.parseInt((item.totalPrice * 100).toFixed(0), 10),
					boughtAt: boughtAt
				}))
			);
		}
		return newReceipt;
	}
}

export const receiptRepository = new ReceiptRepository();
