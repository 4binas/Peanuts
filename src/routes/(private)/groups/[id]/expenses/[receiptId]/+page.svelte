<script lang="ts">
	import { page } from '$app/state';
	import Receipt from '../receipt/Receipt.svelte';
	const receiptId = $derived(page.params.receiptId);
</script>

<div>
	<Receipt {receiptId} />
</div>
