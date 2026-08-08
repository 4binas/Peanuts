<script>
	import { resolve } from '$app/paths';
	import { LogOut } from '@lucide/svelte';
	import { get_user } from '../../user.remote';
	import { goto } from '$app/navigation';

	const user = $derived(await get_user());
</script>

{#if user?.id}
	<div class="card mb-4 grid grid-cols-[auto_1fr] gap-4 rounded-box bg-base-300 p-4 shadow-md">
		<div class="avatar">
			<div class="w-20 rounded-xl">
				<img src={user.image} alt={user.name} />
			</div>
		</div>
		<div class="grid content-end justify-self-start">
			<h1 class="text-xl font-semibold">{user.name}</h1>
			<p class="text-sm">{user.email}</p>
		</div>
	</div>

	<ul class="list rounded-box bg-base-100 shadow-md">
		<li class="list-row grid grid-cols-[1fr_auto] content-center gap-4">
			<button onclick={() => goto(resolve('/auth/logout'))} class="btn-white btn btn-outline">
				<LogOut />
				Logout
			</button>
		</li>
		<li class="p-4 pb-2 text-xs tracking-wide opacity-60">Settings</li>

		<li class="list-row grid grid-cols-[1fr_auto] gap-4"></li>
	</ul>
{/if}
