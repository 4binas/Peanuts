import { form, getRequestEvent } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { receipt } from '$lib/server/db/schema';
import * as v from 'valibot';

export const createExpense = form(
	v.object({
		boughtAt: v.pipe(v.string(), v.nonEmpty()),
		totalPrice: v.pipe(v.number(), v.minValue(0))
	}),
	async (data) => {
		const event = getRequestEvent();
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (!session) {
			throw new Error('Unauthorized');
		}

		try {
			const newReceipt = await db
				.insert(receipt)
				.values({
					userId: session.user.id,
					totalPrice: data.totalPrice
				})
				.returning()
				.then(([r]) => r);
			return { receipt: newReceipt };
		} catch (error) {
			throw new Error('Failed to create receipt: ' + error, { cause: error });
		}
	}
);
