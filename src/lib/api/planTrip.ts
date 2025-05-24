import { extractTripInfo } from './extractLocation';
import { getWeatherForecast, getLatLon } from '$lib/api/weather';
import type { ChatMessage } from '$lib/openrouter';
import { fetchFromOpenRouter } from '$lib/openrouter';

export async function planTrip(
  userInput: string
): Promise<{ output: string; destinationCoords: { lat: number; lon: number }; destination: string }> {

  const { destination, date } = await extractTripInfo(userInput);
  console.log('🗺️ Extracted trip info:', { destination, date });

  const destinationCoords = await getLatLon(destination);

  let weatherMessage: ChatMessage = {
    role: 'system',
    content: `No weather data for ${destination}.`
  };

  try {
    const weatherText = await getWeatherForecast(destination, date);
    weatherMessage = {
      role: 'system',
      content: `Weather info for ${destination} on ${date}: ${weatherText}`
    };
  } catch (err) {
    console.warn('⚠️ Weather fetch failed:', err);
  }

  const formatMessage: ChatMessage = {
    role: 'system',
    content: `
  FORMAT RULES – STRICT  
  Return GitHub-flavoured Markdown with **exactly** these sections – nothing more, nothing less, in the order shown.

  # Trip to ${destination}
  *(Travel date: ${date})*

  ## Quick Facts
  | Item | Details |
  |------|---------|
  | Region / Country | |
  | Population | |
  | Primary languages | |
  | Local currency | |
  | Time zone | |

  ## Historical Snapshot
  • 4-5 sentences on the city/region’s key historical events that shaped its culture.

  ## Overview
  • 5-6 sentences describing the destination’s ambience and why it appeals to travellers.

  ## Weather & Go-No-Go
  • One detailed paragraph on expected conditions.  
  ### Decision  
  Start with **GO** or **NO-GO** (bold, all-caps) followed by a single-paragraph rationale.  
  • If **NO-GO**, recommend an alternative destination with a quick reason.  
  • If **GO**, add a short weather summary.

  ## Preparation Checklist
  • Clothing & gear  
  • Documents (visa, ID, tickets)  
  • Health items / vaccinations  
  • Transport and money tips

  ## One-Day Itinerary
  | Time | Activity |
  |------|----------|
  | 09:00 | |
  | 11:00 | |
  | 13:00 | |
  | 15:00 | |
  | 18:00 | |
  | 20:00 | |

  ## Budget Estimate
  Total (local currency) followed by multi-line breakdown:  
  • Transport  
  • Meals  
  • Activities / misc

  ## Local Cuisine Highlights
  List 3-5 dishes or drinks worth tasting. Format: • *Dish* – one-line description.

  ## Transport & Connectivity
  • Getting around (metro, taxi, walkability)  
  • Typical ride costs or day passes  
  • Mobile data / SIM information

  ## Safety & Health Tips
  • Common scams / zones to avoid  
  • Cultural etiquette notes  
  • Key emergency numbers

  ## Visitor Sentiment
  • Summarise recent traveller reviews (pros & cons) from reputable sources (TripAdvisor, Google, etc.).

  ## Key Locations
  List POIs. Each line: • *Place* – one-line note.

  ## Helpful Resources
  Provide 3-5 bullet links (markdown style) to official tourism sites, public-transit maps, or local event calendars.

  Rules: no emojis, no exclamation marks, no images, no code blocks, never break section order, ensure valid Markdown table syntax.`
  };

  const userMessage: ChatMessage = {
    role: 'user',
    content: userInput
  };

  const output = await fetchFromOpenRouter([
    weatherMessage,
    formatMessage,
    userMessage
  ]);

  return { output, destinationCoords, destination };
}