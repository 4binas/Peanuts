<script>
	import { authClient } from '$lib/client/auth-client';
	import { PUBLIC_OIDC_PROVIDER_ID } from '$env/static/public';
	import { LogIn } from '@lucide/svelte';
	const login = async () => {
		await authClient.signIn.social({
			provider: PUBLIC_OIDC_PROVIDER_ID
		});
	};
</script>

<h1 class="text-2xl">Login</h1>
<button class="btn btn-primary" onclick={login}>
	<LogIn />
	Login using {PUBLIC_OIDC_PROVIDER_ID}</button
>
