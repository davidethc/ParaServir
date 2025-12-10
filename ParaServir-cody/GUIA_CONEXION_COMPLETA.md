# 🔌 Guía Completa de Conexión - Backend y Frontend

## 📋 Índice
1. [Cómo funciona el .env con el Backend](#1-cómo-funciona-el-env-con-el-backend)
2. [Configuración del Frontend](#2-configuración-del-frontend)
3. [Cómo funciona Postman con la Base de Datos](#3-cómo-funciona-postman-con-la-base-de-datos)
4. [Flujo Completo de Datos](#4-flujo-completo-de-datos)

---

## 1. Cómo funciona el .env con el Backend

### ✅ El Backend ya está configurado automáticamente

El backend **lee automáticamente** el archivo `.env` cuando inicia. Esto sucede en `index.js`:

```javascript
import dotenv from 'dotenv';
dotenv.config(); // ← Esto carga el .env automáticamente
```

### 🔄 Flujo de Conexión:

```
1. Inicias el servidor: npm start
   ↓
2. index.js ejecuta: dotenv.config()
   ↓
3. Carga las variables del archivo .env
   ↓
4. src/db.js usa process.env.DATABASE_URL
   ↓
5. Se conecta a PostgreSQL (paraServir2)
   ↓
6. ✅ Backend listo y conectado
```

### 📝 Variables que el Backend lee del .env:

| Variable | Dónde se usa | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | `src/db.js` | `postgresql://postgres:password@localhost:5432/paraServir2` |
| `JWT_SECRET` | `src/helpers/jwt.js` | `GAG6F2dKgcO9tdu57JFaLbUGDAZV3sfzddcooPJqhGA=` |
| `FRONTEND_URL` | `index.js` (CORS) | `http://localhost:5173` |
| `PORT` | `src/config.js` | `3900` |
| `RESEND_API_KEY` | `src/helpers/mail.js` | `re_...` (opcional) |
| `NODE_ENV` | Varios lugares | `development` |

### ✅ Verificar que funciona:

```bash
# 1. Asegúrate de tener el .env configurado
cd ParaServir-cody
cat .env  # Debe mostrar tus variables

# 2. Inicia el servidor
npm start

# 3. Deberías ver:
# "Servidor corriendo en el puerto 3900"
```

**Si ves ese mensaje, el .env está conectado correctamente.** ✅

---

## 2. Configuración del Frontend

### 📁 Archivo .env del Frontend

El frontend necesita su propio archivo `.env` en la carpeta `paraServir/`.

### 🔧 Crear/Configurar .env del Frontend:

**Ubicación:** `/Users/davidetandazo/Desktop/ParaServir/paraServir/.env`

**Contenido:**
```env
# URL del Backend
# IMPORTANTE: El backend corre en el puerto 3900 y NO tiene /api
VITE_API_URL=http://localhost:3900

# Si tu frontend corre en otro puerto, ajusta esto:
# VITE_FRONTEND_PORT=5173
```

### ⚠️ IMPORTANTE - Diferencias:

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Puerto** | `3900` | `5173` (Vite) o `3000` (CRA) |
| **URL Base** | `http://localhost:3900` | `http://localhost:3900` |
| **Prefijo /api** | ❌ NO tiene | ❌ NO necesita |
| **Variable** | `DATABASE_URL`, `JWT_SECRET`, etc. | `VITE_API_URL` |

### 🔄 Cómo el Frontend se conecta:

```
1. Frontend hace request: fetch('http://localhost:3900/auth/login')
   ↓
2. Vite lee VITE_API_URL del .env
   ↓
3. Se construye la URL completa
   ↓
4. Request va al Backend (puerto 3900)
   ↓
5. Backend procesa y responde
   ↓
6. Frontend recibe la respuesta
```

### 📝 Ejemplo de uso en el Frontend:

```typescript
// En cualquier componente o servicio
const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3900',
    endpoints: {
        auth: {
            login: '/auth/login',
        },
    },
};

// Hacer request
const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
});
```

### ✅ Verificar conexión Frontend-Backend:

1. **Backend corriendo:**
   ```bash
   cd ParaServir-cody
   npm start
   # Debe mostrar: "Servidor corriendo en el puerto 3900"
   ```

2. **Frontend corriendo:**
   ```bash
   cd paraServir
   npm run dev
   # Debe mostrar: "Local: http://localhost:5173"
   ```

3. **Probar en el navegador:**
   - Abre: `http://localhost:5173`
   - Intenta hacer login
   - Revisa la consola del navegador (F12) para ver los requests

---

## 3. Cómo funciona Postman con la Base de Datos

### ✅ SÍ, cuando envías algo por Postman, se guarda en la base de datos

### 🔄 Flujo completo:

```
1. Haces POST en Postman
   ↓
2. Request llega al Backend (puerto 3900)
   ↓
3. Backend procesa en el Controller
   ↓
4. Controller usa pool.query() de PostgreSQL
   ↓
5. Se ejecuta INSERT/UPDATE en la BD
   ↓
6. Datos se guardan en paraServir2
   ↓
7. Backend responde con éxito
   ↓
8. Postman muestra la respuesta
```

### 📊 Ejemplo Real:

**1. Crear un usuario por Postman:**

```
POST http://localhost:3900/auth/register
Body:
{
  "email": "test@mail.com",
  "password": "Password123!",
  "first_name": "Juan",
  "last_name": "Pérez",
  "cedula": "1712345678",
  "phone": "0988888888",
  "location": "Quito",
  "role": "usuario"
}
```

**2. ¿Qué pasa internamente?**

```javascript
// 1. Request llega a src/routes/user.js
router.post('/new', createUser);

// 2. Se ejecuta src/controllers/user.js -> createUser()
const passwordHash = await bcrypt.hash(user.password, 10);

// 3. Se inserta en la BD
await client.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)`,
    [user.email, passwordHash, user.role]
);

// 4. Se inserta en profiles
await client.query(
    `INSERT INTO profiles (user_id, first_name, last_name, ...)
     VALUES ($1, $2, $3, ...)`,
    [newUser.id, user.first_name, user.last_name, ...]
);

// 5. ✅ Datos guardados en paraServir2
// 6. Backend responde con el usuario creado
```

**3. Verificar en la Base de Datos:**

Abre DBeaver/pgAdmin y ejecuta:
```sql
SELECT * FROM users WHERE email = 'test@mail.com';
SELECT * FROM profiles WHERE user_id = (SELECT id FROM users WHERE email = 'test@mail.com');
```

**¡Verás los datos que enviaste por Postman!** ✅

### 🎯 Endpoints que escriben en la BD:

| Endpoint | Tabla(s) afectada(s) |
|----------|---------------------|
| `POST /auth/register` | `users`, `profiles`, `worker_profiles` (si es trabajador) |
| `POST /workers/services` | `worker_services` |
| `POST /service-requests` | `service_requests` |
| `POST /reviews` | `reviews` |
| `PUT /users/edit/:id` | `users`, `profiles` |
| `PUT /service-requests/:id` | `service_requests` |
| `DELETE /users/delete/:id` | `users`, `profiles` (CASCADE) |

### ⚠️ Importante:

- **Sí se guarda en la BD** cuando usas Postman
- **Sí se guarda en la BD** cuando usas el Frontend
- **Ambos usan el mismo backend** y la misma base de datos
- **Los datos son compartidos** entre Postman y Frontend

---

## 4. Flujo Completo de Datos

### 🔄 Flujo End-to-End:

```
┌─────────────┐
│  Frontend   │  (React/Vite en puerto 5173)
│  .env:      │
│  VITE_API_URL│
└──────┬──────┘
       │ HTTP Request
       │ (fetch/axios)
       ↓
┌─────────────┐
│   Backend   │  (Express en puerto 3900)
│   .env:     │
│   DATABASE_URL│
│   JWT_SECRET│
└──────┬──────┘
       │ SQL Query
       │ (pg.Pool)
       ↓
┌─────────────┐
│ PostgreSQL  │  (Base de datos paraServir2)
│   Tablas:   │
│   - users   │
│   - profiles│
│   - ...     │
└─────────────┘
```

### 📝 Ejemplo Completo:

**1. Usuario hace login en el Frontend:**
```typescript
// Frontend: LoginForm.tsx
const response = await fetch('http://localhost:3900/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
});
```

**2. Backend procesa:**
```javascript
// Backend: src/controllers/logger.js
const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
// Verifica contraseña, genera token JWT
```

**3. Respuesta al Frontend:**
```json
{
  "status": "success",
  "user": { "id": "...", "email": "..." },
  "token": "eyJhbGc..."
}
```

**4. Frontend guarda el token:**
```typescript
localStorage.setItem('token', response.token);
```

**5. Próximos requests incluyen el token:**
```typescript
fetch('http://localhost:3900/users/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

---

## ✅ Checklist de Configuración

### Backend:
- [ ] Archivo `.env` existe en `ParaServir-cody/`
- [ ] `DATABASE_URL` apunta a `paraServir2`
- [ ] Contraseña de PostgreSQL configurada
- [ ] `JWT_SECRET` configurado
- [ ] Servidor inicia sin errores: `npm start`

### Frontend:
- [ ] Archivo `.env` existe en `paraServir/`
- [ ] `VITE_API_URL=http://localhost:3900` configurado
- [ ] Frontend inicia sin errores: `npm run dev`

### Base de Datos:
- [ ] Base de datos `paraServir2` existe
- [ ] Tablas creadas (ejecutar `database/db.sql`)
- [ ] Puedes conectarte desde DBeaver/pgAdmin

### Pruebas:
- [ ] Postman puede hacer requests al backend
- [ ] Los datos de Postman se guardan en la BD
- [ ] Frontend puede hacer requests al backend
- [ ] Los datos del Frontend se guardan en la BD

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica `DATABASE_URL` en el `.env` del backend
- Verifica que la base de datos `paraServir2` exista

### Error: "CORS policy"
- Verifica `FRONTEND_URL` en el `.env` del backend
- Debe coincidir con la URL donde corre tu frontend

### Error: "Network Error" en Frontend
- Verifica que el backend esté corriendo (`npm start`)
- Verifica `VITE_API_URL` en el `.env` del frontend
- Debe ser `http://localhost:3900` (sin `/api`)

### Los datos no se guardan
- Verifica que el backend esté corriendo
- Revisa la consola del backend para ver errores
- Verifica que las tablas existan en la BD

---

## 🚀 Resumen Rápido

1. **Backend .env** → Se carga automáticamente con `dotenv.config()`
2. **Frontend .env** → Necesitas crear `.env` con `VITE_API_URL=http://localhost:3900`
3. **Postman** → Sí guarda en la BD, usa el mismo backend que el frontend
4. **Base de Datos** → Todos los datos (Postman + Frontend) van a `paraServir2`

**¡Todo está conectado y funcionando!** 🎉
