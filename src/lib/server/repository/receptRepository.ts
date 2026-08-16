import { db } from '../db';
import { receipt, receipt_item, receipt_split } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const ReceiptItemSplitSchema = z.object({
	userId: z.string(),
	splitPercentage: z.number()
});

export const ReceiptItemSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	price: z.number(),
	currency: z.string(),
	receiptSplit: z.array(ReceiptItemSplitSchema)
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;

export const ReceiptSchema = z.object({
	id: z.number(),
	boughtById: z.string(),
	groupId: z.string(),
	storeName: z.string(),
	boughtAt: z.iso.datetime(),
	items: z.array(ReceiptItemSchema),
	totalPrice: z.number()
});

export type Receipt = z.infer<typeof ReceiptSchema>;

class ReceiptRepository {
	async getReceipts(groupId: string) {
		const receipts = await db.select().from(receipt).where(eq(receipt.groupId, groupId));
		return receipts;
	}

	async createReceipt(uploadReceipt: Receipt) {
		const tx = await db.transaction(async () => {
			const newReceipt = await db
				.insert(receipt)
				.values({
					boughtById: uploadReceipt.boughtById,
					groupId: uploadReceipt.groupId,
					storeName: uploadReceipt.storeName,
					boughtAt: new Date(uploadReceipt.boughtAt),
					totalPrice: Number.parseInt((uploadReceipt.totalPrice * 100).toFixed(0), 10)
				})
				.returning()
				.then((res) => res[0]);
			const items = [];
			const itemSplits = [];
			if (uploadReceipt.items) {
				for (const i of uploadReceipt.items) {
					if (!i.receiptSplit) {
						throw new Error('receiptSplit must be split with users can be split with one');
					}
					const totalSplit = i.receiptSplit.reduce((acc, split) => acc + split.splitPercentage, 0);
					if (totalSplit !== 1) {
						throw new Error('receiptSplit must sum to 1');
					}
					itemSplits.push(
						...i.receiptSplit.map((split) => ({
							...split,
							receiptId: newReceipt.id
						}))
					);

					items.push({
						...i,
						receiptId: newReceipt.id,
						totalPrice: Number.parseInt((i.price * 100).toFixed(0), 10)
					});
				}
				if (items.length > 0) {
					await db.insert(receipt_split).values(itemSplits);
					await db.insert(receipt_item).values(items);
				}
			}
			return newReceipt;
		});
		return tx;
	}
}

export const receiptRepository = new ReceiptRepository();
