<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { addMember } from '../../group.remote';
	import { getUsers } from '../../user.remote';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const users = $derived(await getUsers());
</script>

<div class="grid">
	<form
		{...addMember}
		enctype="multipart/form-data"
		class="form grid gap-4"
		onsubmit={() => goto(resolve(`/groups/${page.params.id}`))}
	>
		<input type="hidden" {...addMember.fields.groupId.as('text')} value={page.params.id} />

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Select a member</legend>
			<select class="select w-full" {...addMember.fields.userId.as('text')}>
				{#each users as user (user.id)}
					<option value={user.id}>{user.name}</option>
				{/each}
			</select>
		</fieldset>
		<button class="btn btn-outline" type="submit"> <Plus /> Add Member</button>
	</form>
</div>
