import type { LayoutServerLoad } from './$types';
import { getGroups } from '../group.remote';

export const load: LayoutServerLoad = async () => {
	const groups = await getGroups();

	return {
		groups
	};
};
