import { getRequestEvent, query } from '$app/server';
import { getAuth } from '$lib/server/auth';

export const get_user = query(async () => {
	const event = getRequestEvent();
	const session = await getAuth().api.getSession({
		headers: event.request.headers
	});
	return session?.user;
});
