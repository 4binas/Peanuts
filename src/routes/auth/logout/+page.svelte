<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/client/auth-client';
	import { get_user } from '../../user.remote';

	const logout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					console.log('logged out');
					await get_user().refresh();
					goto(resolve('/'));
				}
			}
		});
	};

	$effect(() => {
		logout();
	});
</script>

<h1>Logging out...</h1>
