<script>
	import { page } from '$app/state';
	import Receipt from '../receipt/Receipt.svelte';
</script>

<div>
	<Receipt receiptId={page.params.receiptId} />
</div>
