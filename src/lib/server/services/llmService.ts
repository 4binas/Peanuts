import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { LLM_API_KEY, LLM_MODEL, LLM_ENDPOINT } from '$env/static/private';
import { ReceiptSchema } from '../repository/receptRepository';
import * as z from 'zod';

const llmReceiptSchema = ReceiptSchema.omit({ userId: true, id: true, boughtAt: true });
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
							text: `Extract the receipt information from this image. Generate a structured JSON output for ${zodTextFormat(llmReceiptSchema, 'receipt')}`
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

		return llmReceiptSchema.parse(JSON.parse(responseData));
	}
}

const llmService = new LLMService(LLM_API_KEY, LLM_MODEL, LLM_ENDPOINT);

export default llmService;
