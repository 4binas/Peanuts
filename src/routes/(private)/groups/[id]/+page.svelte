<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Plus } from '@lucide/svelte';

	let { data } = $props();
	let group = $derived(data.groups.find((g) => g.id === page.params.id));
</script>

<!-- name of each tab group should be unique -->

<div class="grid">
	<button
		class="btn btn-outline"
		onclick={() => goto(resolve(`/groups/${page.params.id}/members`))}
	>
		<Plus /> Add Member
	</button>
	{#if group}
		<h1 class="text-2xl">Members</h1>
		<ul>
			{#each group.members as member (member.id)}
				<li>{member.user.name}</li>
			{/each}
		</ul>
	{/if}
</div>
