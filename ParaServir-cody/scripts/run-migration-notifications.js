import { pool } from '../src/db.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFilePath = path.join(__dirname, '../database/migration_add_notifications.sql');

async function runMigration() {
    console.log('Iniciando migración de notificaciones...');
    let client;
    try {
        const sql = await fs.readFile(migrationFilePath, 'utf8');
        client = await pool.connect();
        await client.query(sql);
        console.log('✅ Migración de notificaciones ejecutada exitosamente.');
    } catch (error) {
        console.error('❌ Error al ejecutar la migración de notificaciones:', error.message);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        pool.end();
    }
}

runMigration();
