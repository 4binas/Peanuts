import { form } from '$app/server';
import llmService from '$lib/server/services/LLMService';
import * as v from 'valibot';

export const createReceipt = form(
	v.object({
		// prompt: v.pipe(v.string(), v.nonEmpty()),
		image: v.pipe(v.file(), v.mimeType(['image/jpeg', 'image/png', 'image/webp']), v.minSize(1))
	}),
	async (data) => {
		const buffer = Buffer.from(await data.image.arrayBuffer());
		const base64 = buffer.toString('base64');
		const dataUrl = `data:${data.image.type};base64,${base64}`;
		const result = await llmService.generateText(dataUrl);
		return { receipt: result };
	}
);
