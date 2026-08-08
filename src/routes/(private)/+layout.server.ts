import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const { user } = locals;
	if (!user?.id) {
		throw redirect(302, '/auth/login');
	}
};
