const OPENWEATHER_API_KEY = '057b769504fb941118ef3565c41af4e0';

export async function getLatLon(
  city: string,
  country = 'IN'
): Promise<{ lat: number; lon: number }> {
  const candidates = city.includes(',')
    ? [city]                                        // already has a country/state
    : [city, `${city},${country}`];                 // fallback with country code

  for (const q of candidates) {
    const geoUrl =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(q)}&limit=5&appid=${OPENWEATHER_API_KEY}`;

    const res   = await fetch(geoUrl);
    const list: any[] = await res.json();

    if (Array.isArray(list) && list.length) {
      const { lat, lon } = list[0];                 // take the first (most-populous) hit
      return { lat, lon };
    }
  }
  throw new Error(`City not found (tried: ${candidates.join(' / ')})`);
}

export async function getWeatherForecast(city: string, isoDate: string): Promise<string> {
	const { lat, lon } = await getLatLon(city);

	const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
	const res = await fetch(forecastUrl);
	if (!res.ok) {
		const text = await res.text();
		console.error("🌩️ Forecast error:", text);
		throw new Error('Forecast fetch failed');
	}

	const data = await res.json();
	const target = new Date(isoDate).toISOString().split('T')[0];

	const match = data.list.find((item: any) => item.dt_txt.startsWith(target));

	if (!match) {
		return `No forecast data for ${city} on ${isoDate}.`;
	}

	const desc = match.weather?.[0]?.description;
	const temp = match.main?.temp;
	const feels = match.main?.feels_like;

	return `Weather in ${city} on ${isoDate} will be ${desc}, ${temp}°C (feels like ${feels}°C).`;
}