<script lang="ts">
	import { goto } from '$app/navigation';
	import { Banknote, HandCoins, PanelsTopLeft, Plus } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setGroup } from './groupContext';

	let { children, data } = $props();
	let group = $derived(data.groups.find((g) => g.id === page.params.id));
	setGroup(() => group);
	let pageName = $derived(page.url.toString());
</script>

<div class="grid h-full grid-rows-[auto_1fr]">
	<div>
		<div class="mb-4 grid grid-cols-[1fr_auto] items-center gap-4">
			<select class="select-outline select w-full border-black text-xl">
				{#each data.groups as group (group.id)}
					<option
						class="text-base"
						onclick={() => goto(resolve(`/groups/${group.id}`))}
						selected={group.id === page.params.id}>{group.name}</option
					>
				{/each}
			</select>

			<button class="btn btn-square btn-outline" onclick={() => goto(resolve('/groups/add'))}>
				<Plus />
			</button>
		</div>

		{#if group}
			<div role="tablist" class="tabs tabs-border mb-4 grid grid-cols-3">
				<a
					role="tab"
					class={'tab' +
						(!pageName?.includes('expenses') && !pageName?.includes('payment')
							? ' tab-active'
							: '')}
					href={resolve(`/groups/${group.id}/`)}
				>
					<PanelsTopLeft size={16} class="mr-2" />
					Overview
				</a>
				<a
					role="tab"
					class={'tab' + (pageName?.includes('expenses') ? ' tab-active' : '')}
					href={resolve(`/groups/${group.id}/expenses`)}
				>
					<HandCoins size={16} class="mr-2" />
					Expenses</a
				>
				<a
					role="tab"
					class={'tab' + (pageName?.includes('payment') ? ' tab-active' : '')}
					href={resolve(`/groups/${group.id}/payment`)}
				>
					<Banknote size={16} class="mr-2" />
					Payment</a
				>
			</div>
		{/if}
	</div>
	<div class="overflow-y-auto">
		{@render children()}
	</div>
</div>
