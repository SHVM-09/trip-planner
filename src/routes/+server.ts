import type { RequestHandler } from '@sveltejs/kit';
import { planTrip } from '$lib/api/planTrip';
import { saveTrip } from '$lib/api/saveTrip';

export const POST: RequestHandler = async ({ request }) => {
  const { input } = await request.json();

  const { output, destinationCoords, destination } = await planTrip(input);

  await saveTrip(input, output, destinationCoords, destination);

  return new Response(
    JSON.stringify({ output, destinationCoords, destination }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};