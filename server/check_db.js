import postgres from 'postgres';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const sql = postgres(process.env.VITE_DATABASE_URL, { ssl: 'require' });

async function check() {
    const results = await sql`SELECT id, user_id, lab_name, created_at FROM reports ORDER BY created_at DESC LIMIT 5`;
    console.log('Recent reports in DB:', JSON.stringify(results, null, 2));
    await sql.end();
}

check();
