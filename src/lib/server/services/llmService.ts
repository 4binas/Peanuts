import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { env } from '$env/dynamic/private';
import { ReceiptItemSchema, ReceiptSchema } from '../repository/receptRepository';
import * as z from 'zod';

const llmReceiptSchema = ReceiptSchema.omit({ boughtById: true, id: true, groupId: true }).extend({
	items: z.array(ReceiptItemSchema.omit({ receiptSplit: true }))
});
type LlmReceiptSchema = z.infer<typeof llmReceiptSchema>;

const getLLMService = () => {
	return new OpenAI({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_ENDPOINT });
};

export const generateTextFromImage = async (image_base64: string): Promise<string> => {
	const openai = getLLMService();
	const response = await openai.chat.completions.create({
		model: env.LLM_MODEL,
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: 'What is in this image?'
					},
					{
						type: 'image_url',
						image_url: {
							url: image_base64
						}
					}
				]
			}
		]
	});
	return response.choices[0].message.content || '';
};

export const generateReciptFromImage = async (image_base64: string): Promise<LlmReceiptSchema> => {
	const openai = getLLMService();
	const response = await openai.chat.completions.create({
		model: env.LLM_MODEL,
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `Extract the receipt information from this image. All monetary values must be expressed as decimal values. Generate a structured JSON output for ${zodTextFormat(llmReceiptSchema, 'receipt')}`
					},
					{
						type: 'image_url',
						image_url: {
							url: image_base64
						}
					}
				]
			}
		],
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'receipt',
				schema: z.toJSONSchema(llmReceiptSchema)
			}
		}
	});
	const responseData = response.choices[0].message.content || '';
	console.log(responseData);
	const responseJSON = JSON.parse(responseData);
	let date: string | undefined;
	try {
		date = new Date(responseJSON.boughtAt).toISOString();
	} catch {
		date = new Date().toISOString();
	}
	const receipt = llmReceiptSchema.parse({ ...responseJSON, boughtAt: date });
	receipt.items = receipt.items.map((item) => ({
		...item,
		unitPrice: Math.round(item.unitPrice * 100),
		totalPrice: Math.round(item.totalPrice * 100)
	}));

	return receipt;
};
