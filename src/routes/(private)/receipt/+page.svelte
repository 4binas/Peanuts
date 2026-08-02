<script lang="ts">
	import { createReceipt } from './receipt.remote';
</script>

<form {...createReceipt} enctype="multipart/form-data">
	<!-- form content goes here -->

	<!-- <input {...createReceipt.fields.prompt.as('text')} /> -->
	<input {...createReceipt.fields.image.as('file')} />
	<button type="submit">Generate</button>
</form>

{#if createReceipt.result?.receipt}
	<p>{createReceipt.result?.receipt}</p>
{/if}
