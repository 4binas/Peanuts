import OpenAI from 'openai';
import { LLM_API_KEY, LLM_MODEL, LLM_ENDPOINT } from '$env/static/private';

class LLMService {
	private openai: OpenAI;

	constructor(
		private api_key: string,
		private model: string,
		private baseURL?: string
	) {
		this.openai = new OpenAI({ apiKey: this.api_key, baseURL: this.baseURL });
	}

	async generateText(image_base64: string): Promise<string> {
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
			// max_tokens: 10000
		});
		return response.choices[0].message.content || '';
	}
}

const llmService = new LLMService(LLM_API_KEY, LLM_MODEL, LLM_ENDPOINT);

export default llmService;
