import { command, form, getRequestEvent, query } from '$app/server';
import { getAuth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { groupMembers, receipt, receipt_item, receipt_split } from '$lib/server/db/schema';
import * as v from 'valibot';
import { eq, and, sum, sql } from 'drizzle-orm';

export const createExpense = form(
	v.object({
		groupId: v.pipe(v.string(), v.nonEmpty()),
		boughtById: v.pipe(v.string(), v.nonEmpty()),
		boughtAt: v.pipe(v.string(), v.nonEmpty()),
		totalPrice: v.pipe(v.number(), v.minValue(0)),
		storeName: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		const event = getRequestEvent();
		const session = await getAuth().api.getSession({
			headers: event.request.headers
		});

		if (!session) {
			throw new Error('Unauthorized');
		}

		try {
			const newReceipt = await db
				.insert(receipt)
				.values({
					groupId: data.groupId,
					boughtById: data.boughtById,
					storeName: data.storeName
				})
				.returning()
				.then(([r]) => r);
			return { receipt: newReceipt };
		} catch (error) {
			throw new Error('Failed to create receipt: ' + error, { cause: error });
		}
	}
);

export const getExpenses = query(
	v.object({
		groupId: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		const event = getRequestEvent();
		const session = await getAuth().api.getSession({
			headers: event.request.headers
		});

		if (!session) {
			throw new Error('Unauthorized');
		}
		const t = await db
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, data.groupId), eq(groupMembers.userId, session.user.id)))
			.then((r) => r);

		if (!t) {
			throw new Error('Unauthorized');
		}

		try {
			const expenses = await db.query.receipt.findMany({
				where: eq(receipt.groupId, data.groupId),
				with: {
					items: {
						with: {
							receipt_splits: true
						}
					}
				}
			});
			return expenses;
		} catch (error) {
			throw new Error('Failed to get expenses: ' + error, { cause: error });
		}
	}
);

type OwedEntry = {
	receiptId: string;
	buyerId: string;
	debtorId: string;
	amountOwedCents: number;
};

/** Returns rows of (debtorId owes buyerId amountOwedCents) across a group. */
async function getAmountsOwed(groupId: string): Promise<OwedEntry[]> {
	const rows = await db
		.select({
			receiptId: receipt.id,
			buyerId: receipt.boughtById,
			debtorId: receipt_split.userId,
			// SUM of (price * splitPercentage / 100), kept in cents as a float
			amountOwedCents: sum(sql`${receipt_item.price} * ${receipt_split.splitPercentage} / 100.0`)
		})
		.from(receipt)
		.innerJoin(receipt_item, eq(receipt_item.receiptId, receipt.id))
		.innerJoin(receipt_split, eq(receipt_split.receipt_item_id, receipt_item.id))
		.where(eq(receipt.groupId, groupId))
		.groupBy(receipt.id, receipt.boughtById, receipt_split.userId);

	return rows.map((r) => ({
		receiptId: r.receiptId,
		buyerId: r.buyerId,
		debtorId: r.debtorId,
		amountOwedCents: Number(r.amountOwedCents ?? 0)
	}));
}

type Balance = { userId: string; balanceCents: number };

function netBalances(owed: OwedEntry[]): Balance[] {
	const map = new Map<string, number>();

	for (const row of owed) {
		if (row.debtorId === row.buyerId) continue; // skip buyer's own share
		// debtor owes -> negative; buyer is owed -> positive
		map.set(row.debtorId, (map.get(row.debtorId) ?? 0) - row.amountOwedCents);
		map.set(row.buyerId, (map.get(row.buyerId) ?? 0) + row.amountOwedCents);
	}

	return [...map.entries()].map(([userId, balanceCents]) => ({
		userId,
		balanceCents
	}));
}

export const getBalaceSheet = query(
	v.object({
		groupId: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		const owed = (await getAmountsOwed(data.groupId)).filter((row) => row.debtorId !== row.buyerId);
		return netBalances(owed);
	}
);
