import pg from 'pg';

let pool;

if (!globalThis._pool) {
  globalThis._pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

pool = globalThis._pool;

export { pool };
