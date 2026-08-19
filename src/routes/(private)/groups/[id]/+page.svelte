<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Plus } from '@lucide/svelte';
	import { getGroup } from './groupContext';
	import { getBalaceSheet } from './expenses/expenses.remote';

	const getGroupFn = getGroup();
	const group = $derived(getGroupFn());

	const balanceSheet = $derived(await (group?.id ? getBalaceSheet({ groupId: group.id }) : null));
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
	{#if balanceSheet && group}
		<h1 class="text-2xl">Balance Sheet</h1>
		<ul>
			{#each balanceSheet as sheet (sheet.userId)}
				<li>
					<div class="flex justify-between">
						<div>
							{group.members.find((m) => m.userId === sheet.userId)?.user.name}
						</div>
						<div>
							{sheet.balanceCents / 100}
							{group.currency}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
