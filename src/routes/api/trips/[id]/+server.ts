import type { RequestHandler } from '@sveltejs/kit';
import { sql } from '$lib/db';

export const DELETE: RequestHandler = async ({ params }) => {
	const id = Number(params.id);
	if (isNaN(id)) {
		return new Response('Invalid ID', { status: 400 });
	}

	await sql`DELETE FROM trips WHERE id = ${id}`;

	return new Response('Deleted', { status: 200 });
};