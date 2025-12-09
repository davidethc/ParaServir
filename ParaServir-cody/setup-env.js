#!/usr/bin/env node
/**
 * Script de ayuda para configurar el archivo .env
 * Ejecuta: node setup-env.js
 */

import { writeFileSync } from 'fs';
import { readFileSync, existsSync } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnv() {
  console.log('🔧 Configuración de variables de entorno para ParaServir\n');
  console.log('Necesitarás las siguientes credenciales de PostgreSQL:\n');

  // Verificar si .env ya existe
  if (existsSync('.env')) {
    const overwrite = await question('⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/n): ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('❌ Operación cancelada.');
      rl.close();
      return;
    }
  }

  // Obtener credenciales
  const dbUser = await question('Usuario de PostgreSQL (default: postgres): ') || 'postgres';
  const dbPassword = await question('Contraseña de PostgreSQL: ');
  const dbHost = await question('Host (default: localhost): ') || 'localhost';
  const dbPort = await question('Puerto (default: 5432): ') || '5432';
  const dbName = await question('Nombre de la base de datos (default: paraservir): ') || 'paraservir';
  
  console.log('\n📧 Configuración de email (Resend):');
  const resendKey = await question('Resend API Key (opcional, presiona Enter para omitir): ');
  
  console.log('\n🔐 Generando JWT Secret...');
  const { randomBytes } = await import('crypto');
  const jwtSecretInput = await question('JWT Secret (o presiona Enter para generar uno aleatorio): ');
  const jwtSecret = jwtSecretInput || randomBytes(32).toString('base64');
  
  const frontendUrl = await question('URL del frontend (default: http://localhost:5173): ') || 'http://localhost:5173';
  const port = await question('Puerto del servidor (default: 3900): ') || '3900';

  // Construir DATABASE_URL
  const databaseUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  // Contenido del archivo .env
  const envContent = `# Base de Datos PostgreSQL Local
DATABASE_URL=${databaseUrl}

# JWT Secret
JWT_SECRET=${jwtSecret}

# Resend API Key (para emails de verificación)
RESEND_API_KEY=${resendKey || 'tu_resend_api_key_aqui'}

# Frontend URL (para CORS)
FRONTEND_URL=${frontendUrl}

# Node Environment
NODE_ENV=development

# Puerto del servidor
PORT=${port}
`;

  // Escribir archivo
  try {
    writeFileSync('.env', envContent);
    console.log('\n✅ Archivo .env creado exitosamente!');
    console.log('\n📝 Resumen de configuración:');
    console.log(`   Base de datos: ${dbName} en ${dbHost}:${dbPort}`);
    console.log(`   Usuario: ${dbUser}`);
    console.log(`   Frontend: ${frontendUrl}`);
    console.log(`   Puerto servidor: ${port}`);
    console.log('\n⚠️  IMPORTANTE: Verifica que:');
    console.log('   1. PostgreSQL esté corriendo');
    console.log('   2. La base de datos exista en pgAdmin');
    console.log('   3. Las tablas estén creadas (ejecuta database/db.sql)');
    console.log('\n🚀 Ejecuta "npm start" para probar la conexión.\n');
  } catch (error) {
    console.error('❌ Error al crear archivo .env:', error.message);
  }

  rl.close();
}

setupEnv();

