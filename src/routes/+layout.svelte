<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { get_user } from './user.remote';

	let { children } = $props();

	const user = $derived(await get_user());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav>
	<div class="navbar bg-base-100 shadow-sm">
		<div class="flex-1">
			<a href={resolve('/')} class="btn btn-ghost text-xl">Cooins</a>
		</div>
		<a href={resolve('/receipt')}>receipt</a>
		<div class="flex gap-2">
			{#if user?.id}
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn avatar btn-circle btn-ghost">
						<div class="w-10 rounded-full">
							<img
								alt="Tailwind CSS Navbar component"
								src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
							/>
						</div>
					</div>
					<ul
						tabindex="-1"
						class="menu dropdown-content z-1 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
					>
						<li><a href={resolve('/auth/logout')}>Logout</a></li>
					</ul>
				</div>
			{:else}
				<a href={resolve('/auth/login')}>Login</a>
			{/if}
		</div>
	</div>
</nav>
{@render children()}
