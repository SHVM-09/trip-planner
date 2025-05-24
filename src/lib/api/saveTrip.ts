import { sql } from '$lib/db';

export async function saveTrip(
  input: string,
  output: string,
  coords?: { lat: number; lon: number },
  destination?: string
) {
  const lat = coords?.lat ?? null;
  const lon = coords?.lon ?? null;

  await sql`
    INSERT INTO trips
      (input, result, created_at, destination, destination_lat, destination_lon)
    VALUES
      (${input}, ${output}, NOW(), ${destination}, ${lat}, ${lon});
  `;
}