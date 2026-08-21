import { command, form, getRequestEvent, query } from '$app/server';
import { getAuth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { group, payment } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { eq } from 'drizzle-orm';

export const createPayment = form(
	v.object({
		paymentId: v.pipe(v.string()),
		fromUserId: v.pipe(v.string(), v.nonEmpty()),
		toUserId: v.pipe(v.string(), v.nonEmpty()),
		groupId: v.pipe(v.string(), v.nonEmpty()),
		currency: v.pipe(v.string(), v.length(3), v.nonEmpty()),
		amount: v.pipe(v.number()),
		description: v.pipe(v.string())
	}),
	async ({ fromUserId, toUserId, currency, amount, description, groupId, paymentId }) => {
		const event = getRequestEvent();
		// Check the user is logged in
		const session = await getAuth().api.getSession({
			headers: event.request.headers
		});
		if (!session?.user.id) error(401, 'Unauthorized');

		const { user } = session;
		const gp = await db.query.group.findFirst({
			where: eq(group.id, groupId),
			with: {
				members: true
			}
		});
		if (!gp) error(404, 'Group not found');
		console.log(gp);
		console.log(user);
		if (gp.members.find((m) => m.userId === user.id) === undefined)
			error(403, 'Forbidden User not in group');

		if (paymentId) {
			await db
				.update(payment)
				.set({
					groupId: groupId,
					amount: parseInt((amount * 100).toFixed(0)),
					currency: currency,
					description: description,
					fromUserId: fromUserId,
					toUserId: toUserId
				})
				.where(eq(payment.id, paymentId));
			return;
		}

		await db.insert(payment).values({
			groupId: groupId,
			amount: parseInt((amount * 100).toFixed(0)),
			currency: currency,
			description: description,
			fromUserId: fromUserId,
			toUserId: toUserId
		});
	}
);

export const listPayments = query(
	v.object({
		groupId: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ groupId }) => {
		const payments = await db.query.payment.findMany({
			where: eq(payment.groupId, groupId)
		});
		return payments;
	}
);

export const deletePayment = command(
	v.object({
		paymentId: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		const event = getRequestEvent();
		// Check the user is logged in
		const session = await getAuth().api.getSession({
			headers: event.request.headers
		});
		if (!session?.user.id) error(401, 'Unauthorized');

		await db.delete(payment).where(eq(payment.id, data.paymentId));
	}
);

export const getPayment = query(
	v.object({
		paymentId: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		const event = getRequestEvent();
		// Check the user is logged in
		const session = await getAuth().api.getSession({
			headers: event.request.headers
		});
		if (!session?.user.id) error(401, 'Unauthorized');

		return await db.query.payment.findFirst({
			where: eq(payment.id, data.paymentId)
		});
	}
);
