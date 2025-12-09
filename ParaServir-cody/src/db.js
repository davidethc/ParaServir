import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (!globalThis._pool) {
  // Construir connectionString si no existe DATABASE_URL
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'paraservir'}`;

  const config = {
    connectionString,
    // Solo usar SSL en producción (cuando DATABASE_URL viene de un servicio cloud)
    // En desarrollo local, PostgreSQL generalmente no requiere SSL
    ...(process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('amazonaws.com') ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {})
  };

  globalThis._pool = new pg.Pool(config);

  // Manejo de errores del pool
  globalThis._pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
  });
}

pool = globalThis._pool;

export { pool };
