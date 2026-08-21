<script>
	import { page } from '$app/state';

	import Payment from '../paymentForm/Payment.svelte';

	const paymentId = $derived(page.params.paymentId);
</script>

<div class="p-4">
	<h1 class="text-2xl">Update Payment</h1>
	<Payment {paymentId} userId={undefined} />
</div>
