<script lang="ts">
	import { createGroup } from '../group.remote';
</script>

<form {...createGroup} enctype="multipart/form-data">
	<!-- form content goes here -->

	<!-- <input {...createReceipt.fields.prompt.as('text')} /> -->
	<label>
		Name:
		<input {...createGroup.fields.name.as('text')} />
	</label>
	<label>
		Currency:
		<input {...createGroup.fields.currency.as('text')} defaultValue="CHF" value="CHF" />
	</label>
	<button type="submit">Add</button>
</form>
