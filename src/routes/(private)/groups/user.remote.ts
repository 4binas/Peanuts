import { getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const getUsers = query(async () => {
	const event = getRequestEvent();
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session?.user.id) error(401, 'Unauthorized');

	const users = await db.query.user.findMany();
	return users;
});
