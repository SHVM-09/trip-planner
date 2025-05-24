import { env } from '$env/dynamic/private';

export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export async function fetchFromOpenRouter(messages: ChatMessage[], model = 'qwen/qwen3-32b') {
	const apiKey = env.OPENROUTER_API_KEY;

	const chatPayload = [
		{
			role: 'system',
			content: `You are a professional AI travel planner. Always answer factually, concisely and in a polished business style.`
		},
		...messages
	];

	const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'http://localhost:5173',
			'X-Title': 'AI Trip Planner'
		},
		body: JSON.stringify({
			model,
			provider: { only: ['Cerebras'] },
			messages: chatPayload,
			stream: false
		})
	});

	if (!res.ok) {
		throw new Error(`❌ OpenRouter API Error: ${res.statusText}`);
	}

	const data = await res.json();
	return data.choices[0].message.content as string;
}