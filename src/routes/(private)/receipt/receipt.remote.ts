import { command, form, getRequestEvent, query } from '$app/server';
import { getAuth } from '$lib/server/auth';
import {
	CreateReceiptSchema,
	receiptRepository,
	ReceiptSchema
} from '$lib/server/repository/receptRepository';
import { generateReciptFromImage } from '$lib/server/services/llmService';
import * as v from 'valibot';

export const parseReceiptImage = form(
	v.object({
		// prompt: v.pipe(v.string(), v.nonEmpty()),
		image: v.pipe(v.file(), v.mimeType(['image/jpeg', 'image/png', 'image/webp']), v.minSize(1))
	}),
	async (data) => {
		const event = getRequestEvent();
		const session = await getAuth().api.getSession({
			headers: event.request.headers
		});

		if (!session) {
			throw new Error('Unauthorized');
		}
		const buffer = Buffer.from(await data.image.arrayBuffer());
		const base64 = buffer.toString('base64');
		const dataUrl = `data:${data.image.type};base64,${base64}`;
		const result = await generateReciptFromImage(dataUrl);

		try {
			return { receipt: result };
		} catch (error) {
			throw new Error('Failed to create receipt: ' + error, { cause: error });
		}
	}
);

export const createReceipt = command(CreateReceiptSchema, async (data) => {
	const event = getRequestEvent();
	const session = await getAuth().api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		throw new Error('Unauthorized');
	}

	//TODO: Check if the user belongs to the group!!
	const receipt = await receiptRepository.createReceipt({ ...data });
	return receipt;
});

export const deleteReceipt = command(
	v.object({
		receiptId: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		await receiptRepository.deleteReceipt(data.receiptId);
	}
);

export const getReceipt = query(
	v.object({
		receiptId: v.pipe(v.string(), v.nonEmpty())
	}),
	async (data) => {
		//TODO: Check if the user belongs to the group!!
		const receipt = await receiptRepository.getReceipt(data.receiptId);
		return receipt;
	}
);

export const patchReceipt = command(ReceiptSchema, async (data) => {
	const event = getRequestEvent();
	const session = await getAuth().api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		throw new Error('Unauthorized');
	}
	//TODO: Check if the user belongs to the group!!
	//TODO: Actually patch the receipt
	await receiptRepository.deleteReceipt(data.id);
	const receipt = await receiptRepository.createReceipt({ ...data });
	return receipt;
});
