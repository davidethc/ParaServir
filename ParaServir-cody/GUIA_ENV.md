# 📋 Guía para Configurar tu Archivo .env

## 🔧 Variables Requeridas

### 1. **DATABASE_URL** (Obligatorio)
Conexión a tu base de datos PostgreSQL.

**Formato:**
```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_base_datos
```

**Ejemplo:**
```
DATABASE_URL=postgresql://postgres:mipassword123@localhost:5432/paraservir
```

**Alternativa:** Puedes usar variables individuales en lugar de DATABASE_URL:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paraservir
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

**¿Cómo obtener estos valores?**
- **Usuario:** Generalmente `postgres` (usuario por defecto de PostgreSQL)
- **Contraseña:** La que configuraste al instalar PostgreSQL
- **Host:** `localhost` si es local
- **Puerto:** `5432` (puerto por defecto de PostgreSQL)
- **Nombre de BD:** El nombre que le diste a tu base de datos (ej: `paraservir`)

---

### 2. **JWT_SECRET** (Obligatorio)
Clave secreta para firmar los tokens JWT. **DEBE ser una cadena larga y aleatoria.**

**Generar un JWT_SECRET seguro:**

**Opción 1 - Terminal (macOS/Linux):**
```bash
openssl rand -base64 32
```

**Opción 2 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Ejemplo:**
```
JWT_SECRET=K8j3mN9pQ2rT5vX8zA1bC4eF7gH0jK3mN6pQ9sT2vW5yZ8aB1dE4gH7jK0mN
```

⚠️ **IMPORTANTE:** 
- NO uses el valor de ejemplo
- Genera uno nuevo y único
- No lo compartas públicamente
- Guárdalo de forma segura

---

## 🔐 Variables Opcionales

### 3. **RESEND_API_KEY** (Opcional)
API Key de Resend para enviar emails de verificación.

**Si NO la configuras:**
- ✅ El servidor funcionará normalmente
- ✅ Podrás hacer login, registro, etc.
- ⚠️ Los emails de verificación NO se enviarán
- ℹ️ El link de verificación se mostrará en la consola (modo desarrollo)

**Si la configuras:**
1. Ve a https://resend.com
2. Crea una cuenta
3. Ve a "API Keys"
4. Crea una nueva API key
5. Cópiala aquí

**Ejemplo:**
```
RESEND_API_KEY=re_123456789abcdefghijklmnopqrstuvwxyz
```

---

### 4. **FRONTEND_URL** (Recomendado)
URL donde corre tu frontend para configurar CORS.

**Valores comunes:**
- Desarrollo local: `http://localhost:5173` (Vite)
- Desarrollo local: `http://localhost:3000` (Create React App)
- Producción: `https://tudominio.com`

**Ejemplo:**
```
FRONTEND_URL=http://localhost:5173
```

---

### 5. **NODE_ENV** (Opcional)
Ambiente de ejecución.

**Valores:**
- `development` - Desarrollo local
- `production` - Producción

**Ejemplo:**
```
NODE_ENV=development
```

---

### 6. **PORT** (Opcional)
Puerto donde correrá el servidor.

**Por defecto:** `3900`

**Ejemplo:**
```
PORT=3900
```

---

## 🚀 Pasos para Configurar

### Paso 1: Crear el archivo .env
```bash
cd ParaServir-cody
cp env.example.txt .env
```

### Paso 2: Editar el archivo .env
Abre el archivo `.env` y completa:

1. **DATABASE_URL** con tus credenciales de PostgreSQL
2. **JWT_SECRET** (genera uno nuevo)
3. **RESEND_API_KEY** (opcional, déjalo vacío si no lo necesitas)
4. **FRONTEND_URL** (ajusta si tu frontend corre en otro puerto)

### Paso 3: Verificar que PostgreSQL esté corriendo
```bash
# Verificar que PostgreSQL esté activo
psql -U postgres -l
```

### Paso 4: Crear la base de datos (si no existe)
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE paraservir;

# Salir
\q
```

### Paso 5: Ejecutar las migraciones
```bash
# Ejecutar el script SQL para crear las tablas
psql -U postgres -d paraservir -f database/db.sql
```

### Paso 6: Probar el servidor
```bash
npm start
```

---

## ✅ Ejemplo Completo de .env

```env
# Base de Datos
DATABASE_URL=postgresql://postgres:mipassword123@localhost:5432/paraservir

# JWT Secret (generado con: openssl rand -base64 32)
JWT_SECRET=K8j3mN9pQ2rT5vX8zA1bC4eF7gH0jK3mN6pQ9sT2vW5yZ8aB1dE4gH7jK0mN

# Resend API Key (opcional)
RESEND_API_KEY=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development

# Puerto
PORT=3900
```

---

## 🐛 Solución de Problemas

### Error: "Missing API key. Pass it to the constructor"
✅ **Solucionado:** El código ahora maneja esto automáticamente. Si no configuras `RESEND_API_KEY`, el servidor funcionará pero no enviará emails.

### Error: "Connection refused" o "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica que las credenciales en `.env` sean correctas
- Verifica que la base de datos exista

### Error: "JWT_SECRET is required"
- Asegúrate de tener `JWT_SECRET` en tu `.env`
- Genera uno nuevo si es necesario

---

## 🔒 Seguridad

⚠️ **NUNCA:**
- ❌ Compartas tu archivo `.env` públicamente
- ❌ Subas `.env` a Git (debe estar en `.gitignore`)
- ❌ Uses valores de ejemplo en producción
- ❌ Compartas tu `JWT_SECRET` o `RESEND_API_KEY`

✅ **SÍ:**
- ✅ Usa valores únicos y seguros
- ✅ Mantén `.env` en `.gitignore`
- ✅ Usa diferentes valores para desarrollo y producción
- ✅ Rota tus secrets periódicamente

---

**¿Necesitas ayuda?** Revisa los archivos:
- `CONFIGURAR_DB.md` - Para configurar la base de datos
- `env.example.txt` - Plantilla de ejemplo
- `setup-env.js` - Script interactivo para crear .env
