import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { env } from '$env/dynamic/private';
import { ReceiptSchema } from '../repository/receptRepository';
import * as z from 'zod';

const llmReceiptSchema = ReceiptSchema.omit({ userId: true, id: true });
type LlmReceiptSchema = z.infer<typeof llmReceiptSchema>;

class LLMService {
	private openai: OpenAI;

	constructor(
		private api_key: string,
		private model: string,
		private baseURL?: string
	) {
		this.openai = new OpenAI({ apiKey: this.api_key, baseURL: this.baseURL });
	}

	async generateTextFromImage(image_base64: string): Promise<string> {
		const response = await this.openai.chat.completions.create({
			model: this.model,
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
	}

	async generateReciptFromImage(image_base64: string): Promise<LlmReceiptSchema> {
		const response = await this.openai.chat.completions.create({
			model: this.model,
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
	}
}

const llmService = new LLMService(env.LLM_API_KEY, env.LLM_MODEL, env.LLM_ENDPOINT);

export default llmService;
