# 🔗 Mapeo Detallado: Frontend ↔ Backend

## 📊 Tabla de Correspondencia de Endpoints

### 🔐 Autenticación

| Frontend | Backend | Método | Estado | Acción |
|----------|---------|--------|--------|--------|
| `/auth/login` | `/auth/login` | POST | ✅ Coincide | Ninguna |
| `/auth/register` | `/auth/register` | POST | ⚠️ Mapeo respuesta | Ajustar respuesta |

---

### 👤 Usuarios

| Frontend | Backend | Método | Estado | Acción |
|----------|---------|--------|--------|--------|
| `GET /users` | `GET /users/list` | GET | ❌ Diferente | Cambiar a `/users/list` |
| `GET /users/:id` | `GET /users/watch/:id` | GET | ❌ Diferente | Cambiar a `/users/watch/:id` |
| `POST /users` | `POST /users/new` | POST | ❌ Diferente | Cambiar a `/users/new` |
| `PUT /users/:id` | `PUT /users/edit/:id` | PUT | ❌ Diferente | Cambiar a `/users/edit/:id` |
| `DELETE /users/:id` | `DELETE /users/delete/:id` | DELETE | ❌ Diferente | Cambiar a `/users/delete/:id` |
| - | `GET /users/me` | GET | ❌ Falta | **AGREGAR** |

---

### 👷 Trabajadores

| Frontend | Backend | Método | Estado | Acción |
|----------|---------|--------|--------|--------|
| `GET /workers` | `GET /workers/list` | GET | ❌ Diferente | Cambiar a `/workers/list` |
| `GET /workers/:id` | `GET /workers/watch/:id` | GET | ❌ Diferente | Cambiar a `/workers/watch/:id` |
| `POST /workers` | `POST /workers/profile` | POST | ⚠️ Diferente propósito | Revisar lógica |
| `POST /workers/services` | `POST /workers/services` | POST | ✅ Coincide | Ninguna |
| - | `GET /workers/:id/services` | GET | ❌ Falta | **AGREGAR** |
| - | `PUT /workers/services/:id` | PUT | ❌ Falta | **AGREGAR** |
| - | `DELETE /workers/services/:id` | DELETE | ❌ Falta | **AGREGAR** |

---

### 📦 Categorías

| Frontend | Backend | Método | Estado | Acción |
|----------|---------|--------|--------|--------|
| `GET /service-categories` | `GET /categories` | GET | ❌ Diferente | Cambiar a `/categories` |

---

### 🛠️ Servicios

| Frontend | Backend | Método | Estado | Acción |
|----------|---------|--------|--------|--------|
| `POST /workers/services` | `POST /workers/services` | POST | ✅ Coincide | Ninguna |

---

### 📋 Solicitudes de Servicio (NUEVO - No existe en frontend)

| Backend | Método | Prioridad | Acción |
|---------|--------|-----------|--------|
| `POST /service-requests` | POST | 🔴 Alta | **CREAR módulo completo** |
| `GET /service-requests` | GET | 🔴 Alta | **CREAR módulo completo** |
| `GET /service-requests/:id` | GET | 🔴 Alta | **CREAR módulo completo** |
| `PUT /service-requests/:id` | PUT | 🔴 Alta | **CREAR módulo completo** |
| `DELETE /service-requests/:id` | DELETE | 🔴 Alta | **CREAR módulo completo** |

---

### ⭐ Reseñas (NUEVO - No existe en frontend)

| Backend | Método | Prioridad | Acción |
|---------|--------|-----------|--------|
| `POST /reviews` | POST | 🟡 Media | **CREAR módulo completo** |
| `GET /reviews/worker/:workerId` | GET | 🟡 Media | **CREAR módulo completo** |
| `GET /reviews/request/:requestId` | GET | 🟡 Media | **CREAR módulo completo** |
| `PUT /reviews/:id` | PUT | 🟡 Media | **CREAR módulo completo** |
| `DELETE /reviews/:id` | DELETE | 🟡 Media | **CREAR módulo completo** |

---

## 🔄 Mapeo de DTOs (Request/Response)

### Login

**Request:**
```typescript
// Frontend envía
{ email: string, password: string }

// Backend espera
{ email: string, password: string }
```
✅ **Compatible - Sin cambios**

**Response:**
```typescript
// Backend devuelve
{
  status: "success",
  message: "Bienvenido",
  user: { id, email, role },
  token: "jwt-token"
}

// Frontend espera
{
  token: string,
  user: { id, email, role }
}
```
✅ **Ya manejado en código** (líneas 70-77 de login.use-case.ts)

---

### Register

**Request:**
```typescript
// Frontend envía (camelCase)
{
  email, password, firstName, lastName,
  cedula, phone, location, avatar_url, role
}

// Backend espera (snake_case)
{
  email, password, first_name, last_name,
  cedula, phone, location, avatar_url, role
}
```
⚠️ **Necesita transformación:** `firstName` → `first_name`, `lastName` → `last_name`

**Response:**
```typescript
// Backend devuelve
{
  message: "Usuario agregado",
  user: { id, email, role, is_verified },
  token: "jwt-token"
}

// Frontend espera
{
  userId: string,
  email: string,
  role: string,
  token?: string,
  nextStep?: 'complete_worker_profile' | null
}
```
⚠️ **Necesita mapeo:** `user.id` → `userId`, agregar `nextStep` si es trabajador

---

### Users

**Request/Response:**
- Frontend usa `camelCase` en requests
- Backend espera `snake_case` en requests
- Backend devuelve `snake_case` en responses
- Frontend espera `camelCase` en responses

⚠️ **Necesita transformación bidireccional**

---

## 📝 Resumen de Acciones Necesarias

### Cambios en Endpoints (Actualizar URLs):
1. Users: 5 endpoints a actualizar
2. Workers: 2 endpoints a actualizar  
3. ServiceCategories: 1 endpoint a actualizar

### Nuevos Endpoints a Agregar:
1. `GET /users/me` - Alta prioridad
2. `GET /workers/:id/services` - Media prioridad
3. `PUT /workers/services/:id` - Media prioridad
4. `DELETE /workers/services/:id` - Media prioridad

### Nuevos Módulos a Crear:
1. ServiceRequests (5 endpoints) - Alta prioridad
2. Reviews (5 endpoints) - Media prioridad

### Transformaciones de DTOs:
1. Register: `camelCase` → `snake_case` (request)
2. Register: Mapeo de respuesta
3. Users: Transformación bidireccional
4. Workers: Transformación bidireccional

---

**Total de cambios:** ~20 archivos a modificar/crear
**Complejidad:** Media
**Tiempo estimado:** 2-3 días trabajando paso a paso

