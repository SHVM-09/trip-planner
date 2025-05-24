import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '$lib/db';

export const GET: RequestHandler = async () => {
	const rows = await sql`
		SELECT id, input, result, created_at, destination_lat, destination_lon, destination
		FROM trips
		ORDER BY created_at DESC
	`;

	return new Response(JSON.stringify(rows), {
		headers: { 'Content-Type': 'application/json' }
	});
};