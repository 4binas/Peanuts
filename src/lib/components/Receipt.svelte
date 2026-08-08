<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import './receipt.css';

	let items = $state([
		{ name: 'Tomato', price: 1.99 },
		{ name: 'Potato', price: 1.99 }
	]);

	const addItem = () => {
		items = [...items, { name: '', price: 0 }];
	};

	const total = $derived(items.reduce((acc, item) => acc + item.price, 0));

	const currency = 'CHF';
</script>

<div class="receipt">
	<input type="text" class="title" placeholder="Store" value="MIGROS" />
	<input type="date" class="date" value={new Date().toISOString().split('T')[0]} />
	<div class="overflow-x-auto">
		<div class="items">
			<!-- head -->
			<div class="items_head">
				<div class="name item-title">Item</div>
				<div class="price item-title">Price</div>
			</div>

			<!-- body -->
			{#each items as item, index (index)}
				<div class="item-container">
					<input
						type="text"
						class="item name"
						value={item.name}
						onchange={(e) => {
							console.log(e);
							items = items.map((i, idx) =>
								idx === index ? { ...i, name: (e.target as HTMLInputElement).value } : i
							);
						}}
					/>
					<input
						type="number"
						class="item price"
						value={item.price.toFixed(2)}
						onchange={(e) => {
							items = items.map((i, idx) =>
								idx === index
									? {
											...i,
											price: Number.parseFloat((e.target as HTMLInputElement).value)
										}
									: i
							);
						}}
					/>
					<div class="item currency">{currency}</div>
				</div>
			{/each}
			<div class="add-item">
				<button class="add-item" onclick={addItem}> <Plus size={16} /> Add Item </button>
			</div>
		</div>

		<div class="total">
			<div class="item name">Total</div>
			<div class="item price">{total}</div>
			<div class="item currency">{currency}</div>
		</div>
	</div>
</div>
