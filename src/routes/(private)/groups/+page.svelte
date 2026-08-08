<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getGroups } from './group.remote';

	onMount(async () => {
		let groupId = localStorage.getItem('groupid');

		if (groupId) {
			goto(resolve(`/groups/${groupId}`));
			return;
		}

		const groups = await getGroups();

		if (groups.length === 0) {
			goto(resolve('/groups/add'));
		}

		goto(resolve(`/groups/${groups[0].id}`));
	});
</script>
