import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

const NEON_DATABASE_URL = env.NEON_DATABASE_URL;

export function createDB(connectionString: string) {
	if (!connectionString) throw new Error('❌ NEON_DATABASE_URL is required');
	return neon(connectionString);
}

export const sql = createDB(NEON_DATABASE_URL);