import { getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';

export const get_user = query(async () => {
	const event = getRequestEvent();
	const session = await auth.api.getSession({
		headers: event.request.headers
	});
	return session?.user;
});
