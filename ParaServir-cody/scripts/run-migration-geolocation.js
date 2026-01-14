/**
 * Script para ejecutar la migración de geolocalización
 * Ejecuta: node scripts/run-migration-geolocation.js
 */

import { pool } from '../src/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Iniciando migración de geolocalización...\n');
        
        // Leer el archivo SQL
        const migrationPath = join(__dirname, '../database/migration_add_geolocation.sql');
        const sql = readFileSync(migrationPath, 'utf8');
        
        // Ejecutar la migración
        await client.query('BEGIN');
        
        console.log('📝 Agregando columnas latitude y longitude...');
        await client.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
            ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
        `);
        
        console.log('📝 Creando índices...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_profiles_coords ON profiles(latitude, longitude);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_profiles_location_coords 
            ON profiles(location, latitude, longitude) 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
        `);
        
        await client.query(`
            COMMENT ON COLUMN profiles.latitude IS 'Latitud geográfica del usuario (coordenada Y)';
        `);
        
        await client.query(`
            COMMENT ON COLUMN profiles.longitude IS 'Longitud geográfica del usuario (coordenada X)';
        `);
        
        await client.query('COMMIT');
        
        console.log('\n✅ Migración completada exitosamente!');
        console.log('\n📊 Verificando cambios...');
        
        // Verificar que las columnas fueron creadas
        const checkResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name IN ('latitude', 'longitude')
            ORDER BY column_name;
        `);
        
        if (checkResult.rows.length === 2) {
            console.log('✅ Columnas creadas correctamente:');
            checkResult.rows.forEach(row => {
                console.log(`   - ${row.column_name}: ${row.data_type}`);
            });
        }
        
        // Verificar índices
        const indexResult = await client.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'profiles' 
            AND indexname LIKE '%coords%';
        `);
        
        if (indexResult.rows.length > 0) {
            console.log('\n✅ Índices creados:');
            indexResult.rows.forEach(row => {
                console.log(`   - ${row.indexname}`);
            });
        }
        
        console.log('\n🎉 ¡Todo listo! Ya puedes usar los endpoints de geolocalización.');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Error al ejecutar la migración:', error.message);
        console.error('\nDetalles:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar migración
runMigration().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
