import { form, getRequestEvent } from '$app/server';
import { getAuth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { receipt } from '$lib/server/db/schema';
import * as v from 'valibot';

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
					totalPrice: data.totalPrice,
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
