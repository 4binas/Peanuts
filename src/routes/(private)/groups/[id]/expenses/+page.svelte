<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Plus } from '@lucide/svelte';
	import { getGroup } from '../groupContext';
	import { getExpenses } from './expenses.remote';

	const getGroupFn = getGroup();
	const group = $derived(getGroupFn());
	const expenses = $derived(await (group?.id ? getExpenses({ groupId: group.id }) : null));
</script>

<div class="grid gap-4">
	<button
		class="btn btn-outline"
		onclick={() => goto(resolve(`/groups/${page.params.id}/expenses/add`))}
	>
		<Plus />
		Add Expense
	</button>

	<h1 class="text-2xl">Expenses</h1>
	{#if expenses && group}
		<ul class="grid gap-4">
			{#each expenses as expense (expense.id)}
				<li>
					<button
						class="grid w-full grid-cols-[1fr_1fr_1fr] border p-2 shadow-md"
						onclick={() => goto(resolve(`/groups/${page.params.id}/expenses/${expense.id}`))}
					>
						<div class="text-start">
							{new Date(expense.boughtAt).toLocaleDateString()}
						</div>
						<div class="text-center">
							{expense.storeName}
						</div>
						<div class="text-end">
							{expense.items.reduce((acc, item) => acc + item.price, 0) / 100}
							{expense.items[0]?.currency}
						</div>
						<div class="col-span-3">
							By {group.members.find((m) => m.userId === expense.boughtById)?.user.name}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
