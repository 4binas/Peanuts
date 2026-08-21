<script>
	import { page } from '$app/state';
	import Payment from '../paymentForm/Payment.svelte';
	const user = $derived(page.data.user);
</script>

<div class="p-4">
	<h1 class="text-2xl">Add Payment</h1>
	<Payment paymentId={undefined} userId={user.id} />
</div>
