<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Plus } from '@lucide/svelte';
</script>

<div class="grid">
	<button
		class="btn btn-outline"
		onclick={() => goto(resolve(`/groups/${page.params.id}/expenses/add`))}
	>
		<Plus />
		Add Expense
	</button>
</div>
