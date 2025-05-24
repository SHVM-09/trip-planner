import type { ChatMessage } from '$lib/openrouter';
import { fetchFromOpenRouter } from '$lib/openrouter';

interface TripInfo {
	destination: string;
	date: string;
}
const fallbackCapitals: Record<string, string> = {
	kerala: 'Thiruvananthapuram',
	gujarat: 'Gandhinagar',
	rajasthan: 'Jaipur',
	tamilnadu: 'Chennai',
	bihar: 'Patna',
	maharashtra: 'Mumbai',
	india: 'New Delhi',
	karnataka: 'Bengaluru',
	up: 'Lucknow',
	uttarpradesh: 'Lucknow',
	punjab: 'Chandigarh',
	himachal: 'Shimla',
	goa: 'Panaji',
	jammu: 'Srinagar',
	kashmir: 'Srinagar',
	telangana: 'Hyderabad',
	pakistan: 'Islamabad',
	srilanka: 'Colombo',
	nepal: 'Kathmandu',
	bangladesh: 'Dhaka',
	usa: 'Washington D.C.',
	us: 'Washington D.C.',
	america: 'Washington D.C.'
};

export async function extractTripInfo(userMessage: string): Promise<TripInfo> {
	const today = new Date().toISOString().split('T')[0];

	const messages: ChatMessage[] = [
		{
			role: 'system',
			content: `You are a travel assistant. Today is ${today}. Extract the destination city and normalized date from the user's message. Respond ONLY in raw JSON like:

From the user's input, extract:
- the most relevant **city** (not state or country),
- the intended **date** in YYYY-MM-DD format.

If the user mentions only a **state or country**, return the capital city of that region.

Respond ONLY in this JSON format:

{
  "destination": "City Name",
  "date": "YYYY-MM-DD"
}

Examples:
- If user says "tomorrow", return today's date + 1.
- If user says "next week", return today's date + 7.
- If user gives an exact date, return that.
NEVER include any markdown or code blocks. Only raw JSON.`
		},
		{
			role: 'user',
			content: userMessage
		}
	];

	const response = await fetchFromOpenRouter(messages);

	try {
		const clean = response.trim().replace(/^```json/, '').replace(/```$/, '');
		const json = JSON.parse(clean);
        console.log('🗺️ Extracted trip info:', json);

		const cityRaw = json.destination?.toLowerCase().trim();
        const finalCity = fallbackCapitals[cityRaw] || json.destination;

        return {
            destination: finalCity,
            date: json.date || today
        };
	} catch (e) {
		console.error('❌ Failed to parse city/date from model output:', response);
		return {
			destination: 'Ahmedabad',
			date: today
		};
	}
}