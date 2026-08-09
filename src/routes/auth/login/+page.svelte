<script>
	import { authClient } from '$lib/client/auth-client';
	import { env } from '$env/dynamic/public';
	import { LogIn } from '@lucide/svelte';
	const login = async () => {
		await authClient.signIn.social({
			provider: env.PUBLIC_OIDC_PROVIDER_ID
		});
	};
</script>

<h1 class="text-2xl">Login</h1>
<button class="btn btn-primary" onclick={login}>
	<LogIn />
	Login using {env.PUBLIC_OIDC_PROVIDER_ID}</button
>
