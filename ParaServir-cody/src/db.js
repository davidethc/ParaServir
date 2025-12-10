import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (!globalThis._pool) {
  let connectionString;
  let config;

  // Si existe DATABASE_URL, usarlo directamente
  if (process.env.DATABASE_URL) {
    connectionString = process.env.DATABASE_URL.trim(); // Eliminar espacios en blanco
    
    // Validar que la contraseña esté presente en la URL
    if (!connectionString.includes('@') || connectionString.split('@')[0].split(':').length < 3) {
      console.error('❌ Error: DATABASE_URL no tiene el formato correcto');
      console.error('Formato esperado: postgresql://usuario:contraseña@host:puerto/base_datos');
      process.exit(1);
    }

    // Si la contraseña tiene caracteres especiales, puede necesitar codificación URL
    // Pero primero intentemos con la URL tal cual
    config = {
      connectionString,
      // Solo usar SSL en producción (cuando DATABASE_URL viene de un servicio cloud)
      ...(process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('amazonaws.com') ? {
        ssl: {
          rejectUnauthorized: false
        }
      } : {})
    };
  } else {
    // Usar variables individuales directamente (más confiable que construir URL)
    const user = String(process.env.DB_USER || 'postgres').trim();
    const password = String(process.env.DB_PASSWORD || '').trim();
    const host = String(process.env.DB_HOST || 'localhost').trim();
    const port = parseInt(process.env.DB_PORT || '5432', 10);
    const database = String(process.env.DB_NAME || 'paraservir').trim();

    // Validar que la contraseña sea un string y no esté vacía
    if (typeof password !== 'string' || password === '') {
      console.error('❌ Error: DB_PASSWORD debe ser un string no vacío');
      console.error('Verifica tu archivo .env');
      process.exit(1);
    }

    // Usar objeto de configuración directamente (más confiable)
    config = {
      user: user,
      password: password,  // ← Asegurar que sea string explícitamente
      host: host,
      port: port,
      database: database,
    };

    // No usar connectionString cuando tenemos variables individuales
    connectionString = null;
  }

  // Validar configuración
  if (connectionString && typeof connectionString !== 'string') {
    console.error('❌ Error: connectionString no es válido');
    process.exit(1);
  }

  if (!connectionString && (!config.user || !config.password)) {
    console.error('❌ Error: Configuración de base de datos incompleta');
    console.error('Verifica DB_USER y DB_PASSWORD en tu archivo .env');
    process.exit(1);
  }

  try {
    // Log de configuración (sin mostrar contraseña completa)
    if (connectionString) {
      console.log('🔌 Conectando a PostgreSQL usando DATABASE_URL');
    } else {
      console.log(`🔌 Conectando a PostgreSQL: ${config.user}@${config.host}:${config.port}/${config.database}`);
    }

    globalThis._pool = new pg.Pool(config);

    // Manejo de errores del pool
    globalThis._pool.on('error', (err) => {
      console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
      process.exit(-1);
    });

    // Probar la conexión
    globalThis._pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        console.error('Verifica tu DATABASE_URL en el archivo .env');
      } else {
        console.log('✅ Conexión a la base de datos establecida correctamente');
      }
    });

  } catch (error) {
    console.error('❌ Error al crear el pool de conexiones:', error.message);
    process.exit(1);
  }
}

pool = globalThis._pool;

export { pool };
