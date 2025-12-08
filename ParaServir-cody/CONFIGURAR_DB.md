# 🔧 Configuración de Base de Datos PostgreSQL Local

## Paso 1: Crear archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de Datos PostgreSQL Local
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/paraservir

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Resend API Key (para emails)
RESEND_API_KEY=tu_resend_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development

# Puerto
PORT=3900
```

## Paso 2: Obtener credenciales de pgAdmin

1. Abre **pgAdmin** en tu computadora
2. Conecta a tu servidor PostgreSQL local
3. Busca el **nombre de la base de datos** que creaste (probablemente `paraservir` o similar)
4. Verifica el **puerto** (generalmente `5432`)
5. Verifica tu **usuario** (generalmente `postgres`)
6. Verifica tu **contraseña** (la que configuraste al instalar PostgreSQL)

## Paso 3: Completar DATABASE_URL

Reemplaza en el archivo `.env`:

- `TU_CONTRASEÑA` → Tu contraseña de PostgreSQL
- `paraservir` → El nombre exacto de tu base de datos en pgAdmin

**Ejemplo:**
```env
DATABASE_URL=postgresql://postgres:mipassword123@localhost:5432/paraservir
```

## Paso 4: Generar JWT Secret

En tu terminal ejecuta:
```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `JWT_SECRET` en el archivo `.env`

## Paso 5: Verificar conexión

Ejecuta el servidor:
```bash
npm start
```

Si ves el mensaje "Servidor corriendo en el puerto 3900", la conexión está correcta.

## Formato de DATABASE_URL

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_base_datos]
```

**Ejemplos comunes:**

- PostgreSQL local estándar:
  ```
  postgresql://postgres:password@localhost:5432/paraservir
  ```

- Si cambiaste el puerto:
  ```
  postgresql://postgres:password@localhost:5433/paraservir
  ```

- Si tu usuario es diferente:
  ```
  postgresql://miusuario:mipassword@localhost:5432/paraservir
  ```

## Solución de Problemas

### Error: "password authentication failed"
- Verifica que la contraseña en `.env` sea correcta
- Verifica que el usuario exista en PostgreSQL

### Error: "database does not exist"
- Verifica que el nombre de la base de datos sea correcto
- Crea la base de datos en pgAdmin si no existe:
  ```sql
  CREATE DATABASE paraservir;
  ```

### Error: "connection refused"
- Verifica que PostgreSQL esté corriendo
- Verifica que el puerto sea correcto (generalmente 5432)
- En pgAdmin, verifica la configuración del servidor

### Error: "relation does not exist"
- Ejecuta el script SQL `database/db.sql` en pgAdmin para crear las tablas

