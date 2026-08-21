<script lang="ts">
	import { parseReceiptImage } from './receipt.remote';
</script>

<form {...parseReceiptImage} enctype="multipart/form-data">
	<!-- form content goes here -->

	<!-- <input {...createReceipt.fields.prompt.as('text')} /> -->
	<input {...parseReceiptImage.fields.image.as('file')} />
	<button type="submit">Generate</button>
</form>

{#if parseReceiptImage.result?.receipt}
	<p>{parseReceiptImage.result?.receipt}</p>
{/if}
