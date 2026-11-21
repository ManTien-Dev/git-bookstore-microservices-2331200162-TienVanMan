import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST || 'product-db',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'products',
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Initialize schema
async function init() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 100
    );`);
    console.log('Product DB initialized');
  } catch (err) {
    console.error('Product DB init error, retrying in 3s:', err.message);
    setTimeout(init, 3000);
  }
}
init();

export default { query };
