import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { group, groupMembers } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import z from 'zod';

export const getGroups = query(async () => {
	const event = getRequestEvent();
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session?.user.id) error(401, 'Unauthorized');

	// const groups = await db.select().from(group).where(eq(group.ownerId, session.user.id));$
	const groups = await db.query.group.findMany({
		where: eq(group.ownerId, session.user.id),
		with: {
			members: {
				with: {
					user: true
				}
			}
		}
	});
	return groups;
});

export const getGroupById = query(v.string(), async (id: string) => {
	const idResult = z.uuid().safeParse(id);

	if (!idResult.success) {
		throw error(400, 'Invalid group ID');
	}
	const event = getRequestEvent();
	const session = await auth.api.getSession({
		headers: event.request.headers
	});
	if (!session?.user.id) error(401, 'Unauthorized');

	if (!id) error(400, 'Group ID is required');
	const groupResult = await db.query.group.findFirst({
		where: and(eq(group.id, id), eq(group.ownerId, session.user.id)),
		with: {
			members: true
		}
	});

	if (!groupResult) error(404, 'Group not found');

	return groupResult;
});

export const createGroup = form(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		currency: v.pipe(v.string(), v.length(3), v.nonEmpty())
	}),
	async ({ name, currency }) => {
		const event = getRequestEvent();
		// Check the user is logged in
		const session = await auth.api.getSession({
			headers: event.request.headers
		});
		if (!session?.user.id) error(401, 'Unauthorized');

		// Insert into the database
		const new_group = await db.transaction(async (tx) => {
			const new_group = await tx
				.insert(group)
				.values({
					name,
					currency,
					ownerId: session.user.id
				})
				.returning()
				.then((res) => res[0]);

			const membersToInsert = [{ groupId: new_group.id, userId: session.user.id }];

			if (membersToInsert.length > 0) {
				await tx.insert(groupMembers).values(membersToInsert);
			}
			return new_group;
		});

		// Redirect to the newly created page
		redirect(303, `/groups/${new_group.id}`);
	}
);

export const addMember = form(
	v.object({
		groupId: v.string(),
		userId: v.string()
	}),
	async ({ groupId, userId }) => {
		const event = getRequestEvent();
		// Check the user is logged in
		const session = await auth.api.getSession({
			headers: event.request.headers
		});
		if (!session?.user.id) error(401, 'Unauthorized');

		// Insert into the database
		await db.transaction(async (tx) => {
			await tx.insert(groupMembers).values({ groupId, userId });
		});
	}
);
