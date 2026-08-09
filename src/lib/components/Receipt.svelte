<script lang="ts">
	import { ImageUp, Plus } from '@lucide/svelte';
	import './receipt.css';
	import { uuidv4, ZodUUID } from 'zod';
	import { tick } from 'svelte';
	import { createReceipt } from '../../routes/(private)/receipt/receipt.remote';
	import { slide } from 'svelte/transition';

	let storeName = $state('');
	let boughtAt: Date = $state(new Date());
	let boughtAtInput = $derived(boughtAt.toISOString().slice(0, 10));
	let items: { name: string; price: number; id: ZodUUID }[] = $state([]);

	let lastInput: HTMLInputElement | undefined = $state(undefined);

	let imageLoading = $state(false);

	const addItem = async () => {
		items = [...items, { name: '', price: 0, id: uuidv4() }];
		await tick();
		// await tick();
		setTimeout(() => {
			lastInput?.focus();
		}, 305);
	};

	const total = $derived((items.reduce((acc, item) => acc + item.price, 0) / 100).toFixed(2));

	const currency = 'CHF';

	let fileInput: HTMLInputElement;

	let form: HTMLFormElement;

	const handleImageSelect = () => {
		imageLoading = true;
		if (fileInput?.files?.length) {
			form?.requestSubmit();
		}
	};

	const deleteItem = (id: ZodUUID) => {
		items = items.filter((item) => item.id !== id);
	};

	$effect(() => {
		if (createReceipt.result?.receipt) {
			items = createReceipt.result.receipt.items.map((item) => ({
				name: item.name,
				price: item.totalPrice,
				id: uuidv4()
			}));
			storeName = createReceipt.result.receipt.storeName;
			boughtAt = new Date(createReceipt.result.receipt.boughtAt);
			console.log(createReceipt.result?.receipt);
			imageLoading = false;
		}
	});
</script>

<div class="receipt">
	<div>
		<form
			bind:this={form}
			{...createReceipt}
			enctype="multipart/form-data"
			class="grid justify-end"
		>
			<!-- form content goes here -->

			<!-- <input {...createReceipt.fields.prompt.as('text')} /> -->
			<input
				bind:this={fileInput}
				onchange={handleImageSelect}
				{...createReceipt.fields.image.as('file')}
				hidden
			/>

			<button
				class="btn btn-outline"
				type="button"
				onclick={() => fileInput?.click()}
				aria-label="Upload image"
				disabled={imageLoading}
			>
				{#if imageLoading}
					<span class="loading loading-md loading-spinner"></span>
				{:else}
					<ImageUp size={18} />
				{/if}
			</button>
		</form>

		<input type="text" class="title" placeholder="Store" bind:value={storeName} />
	</div>
	<input
		type="date"
		class="date"
		value={boughtAtInput}
		onchange={(e) => {
			boughtAt = new Date(`${e.currentTarget.value}T00:00:00`);
		}}
	/>
	<div class="overflow-x-auto">
		<div class="items">
			<!-- head -->
			<div class="items_head">
				<div class="name item-title">Item</div>
				<div class="price-title item-title">
					{currency}
				</div>
			</div>

			<!-- body -->
			<div class="item-container">
				{#each items as item (item.id)}
					<div class="item-row" transition:slide={{ duration: 300 }}>
						<input
							type="text"
							class="item name"
							required
							bind:value={item.name}
							bind:this={lastInput}
							onblur={(e) => {
								item.name = (e.target as HTMLInputElement).value;
								if (item.name.trim() === '') {
									deleteItem(item.id);
								}
							}}
						/>
						<input
							type="number"
							class="item price"
							value={(item.price / 100).toFixed(2)}
							onfocus={(e) => {
								(e.target as HTMLInputElement).select();
							}}
							onblur={(e) =>
								(item.price = Math.round(
									parseFloat((e.target as HTMLInputElement).value || '0') * 100
								))}
							inputmode="decimal"
						/>
						<div class="item-actions">
							<button>SPLIT</button>
							<button onclick={() => deleteItem(item.id)}>DELETE</button>
						</div>
					</div>
				{/each}
			</div>
			<div class="add-item">
				<button class="add-item" onclick={addItem}> <Plus size={16} /> Add Item </button>
			</div>
		</div>

		<div class="total">
			<div class="item name">Total {currency}</div>
			<div class="price-title item">{total}</div>
		</div>
	</div>
</div>
