import { form, getRequestEvent } from '$app/server';
import { getAuth } from '$lib/server/auth';
import { generateReciptFromImage } from '$lib/server/services/llmService';
import * as v from 'valibot';

export const createReceipt = form(
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
