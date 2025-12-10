# 📋 Plan de Preparación para Conectar Frontend con Backend

## 🎯 Objetivo
Preparar la arquitectura del frontend para conectarse correctamente con el backend sin hacer cambios bruscos, paso a paso.

---

## 📊 Análisis de la Arquitectura Actual

### ✅ Lo que YA está bien configurado:

1. **Configuración de API (`api.config.ts`)**
   - ✅ Todos los módulos tienen `api.config.ts`
   - ✅ Usan `import.meta.env.VITE_API_URL`
   - ✅ Fallback corregido a `http://localhost:3900`
   - ✅ `.env` creado con `VITE_API_URL=http://localhost:3900`

2. **Arquitectura en Capas**
   - ✅ Separación clara: Presentation → Application → Infrastructure
   - ✅ Use Cases bien definidos
   - ✅ Controllers y Repositories implementados
   - ✅ DTOs definidos

3. **Manejo de Estado**
   - ✅ Redux configurado (`authSlice`)
   - ✅ Token guardado en `localStorage`

4. **Manejo de Errores**
   - ✅ Try-catch en use cases
   - ✅ Fallbacks a mock cuando falla la conexión

---

## ⚠️ Lo que necesita AJUSTE (sin cambios todavía):

### 1. **Flags de Mock Data**

**Archivos con `USE_MOCK_DATA = true`:**
- `src/modules/Auth/application/use-cases/login.use-case.ts` (línea 6)
- `src/modules/Auth/application/use-cases/register.use-case.ts` (línea 6)
- `src/modules/Services/application/use-cases/create-basic-service.use-case.ts` (línea 5)
- `src/modules/ServiceCategories/application/use-cases/get-service-categories.use-case.ts` (línea 5)
- `src/modules/workers/Application/use-cases/complete-worker-profile.use-case.ts` (línea 4)

**Acción necesaria:** Cambiar a `false` cuando el backend esté listo (pero NO ahora).

---

### 2. **Mapeo de Endpoints - Discrepancias**

#### ✅ Endpoints que COINCIDEN:

| Frontend | Backend | Estado |
|----------|---------|--------|
| `POST /auth/login` | `POST /auth/login` | ✅ Coincide |
| `POST /auth/register` | `POST /auth/register` | ✅ Coincide |
| `GET /categories` | `GET /categories` | ✅ Coincide |

#### ⚠️ Endpoints que NO COINCIDEN:

| Frontend | Backend Real | Problema |
|----------|--------------|----------|
| `GET /users` | `GET /users/list` | ❌ Falta `/list` |
| `GET /users/:id` | `GET /users/watch/:id` | ❌ Usa `watch` no `:id` |
| `POST /users` | `POST /users/new` | ❌ Falta `/new` |
| `PUT /users/:id` | `PUT /users/edit/:id` | ❌ Falta `/edit` |
| `DELETE /users/:id` | `DELETE /users/delete/:id` | ❌ Falta `/delete` |
| `GET /workers` | `GET /workers/list` | ❌ Falta `/list` |
| `GET /workers/:id` | `GET /workers/watch/:id` | ❌ Usa `watch` no `:id` |
| `POST /workers` | `POST /workers/profile` | ⚠️ Diferente propósito |
| `POST /workers/services` | `POST /workers/services` | ✅ Coincide |
| `GET /service-categories` | `GET /categories` | ❌ Nombre diferente |

---

### 3. **DTOs - Discrepancias de Formato**

#### Login/Register - ✅ Compatible
- Frontend envía: `{ email, password }`
- Backend espera: `{ email, password }`
- ✅ **Compatible**

#### Register - ⚠️ Diferencia en campos
**Frontend envía:**
```typescript
{
  email, password, firstName, lastName, 
  cedula, phone, location, avatar_url, role
}
```

**Backend espera:**
```typescript
{
  email, password, first_name, last_name,
  cedula, phone, location, avatar_url, role
}
```

**Problema:** Frontend usa `camelCase` (firstName), backend espera `snake_case` (first_name)

**Acción:** Necesita transformación en el use case o controller.

---

### 4. **Respuestas del Backend - Mapeo Necesario**

#### Login Response:
**Backend devuelve:**
```json
{
  "status": "success",
  "message": "Bienvenido",
  "user": { "id", "email", "role" },
  "token": "jwt-token"
}
```

**Frontend espera:**
```typescript
{
  token: string,
  user: { id, email, role }
}
```

**Estado:** ✅ El código ya maneja esto (líneas 70-77 de login.use-case.ts)

#### Register Response:
**Backend devuelve:**
```json
{
  "message": "Usuario agregado",
  "user": { "id", "email", "role", "is_verified" },
  "token": "jwt-token"
}
```

**Frontend espera:**
```typescript
{
  userId: string,
  email: string,
  role: string,
  token?: string,
  nextStep?: 'complete_worker_profile' | null
}
```

**Problema:** Estructura diferente, necesita mapeo.

---

### 5. **Autenticación - Headers**

**Estado actual:**
- ✅ Token se guarda en `localStorage`
- ⚠️ No se envía automáticamente en requests
- ⚠️ Falta interceptor HTTP para agregar `Authorization: Bearer <token>`

**Acción necesaria:** Crear servicio/interceptor HTTP que agregue el token automáticamente.

---

### 6. **Endpoints Faltantes en Frontend**

El backend tiene endpoints que el frontend NO está usando:

| Backend Endpoint | ¿Frontend lo usa? | Prioridad |
|------------------|-------------------|-----------|
| `GET /users/me` | ❌ No | 🔴 Alta |
| `GET /workers/:id/services` | ❌ No | 🟡 Media |
| `POST /service-requests` | ❌ No | 🔴 Alta |
| `GET /service-requests` | ❌ No | 🔴 Alta |
| `POST /reviews` | ❌ No | 🟡 Media |
| `GET /reviews/worker/:workerId` | ❌ No | 🟡 Media |

---

## 📝 Plan de Acción (Paso a Paso)

### **Fase 1: Preparación de Infraestructura** (Sin cambios todavía)

#### 1.1 Crear Servicio HTTP Centralizado
**Archivo nuevo:** `src/shared/services/http-client.service.ts`
- Interceptor para agregar token automáticamente
- Manejo centralizado de errores
- Transformación de respuestas

#### 1.2 Crear Mapper de DTOs
**Archivo nuevo:** `src/shared/mappers/backend-mapper.ts`
- Transformar `camelCase` → `snake_case` para requests
- Transformar `snake_case` → `camelCase` para responses

#### 1.3 Actualizar api.config.ts
**Archivos a actualizar:**
- Todos los `api.config.ts` para usar endpoints correctos del backend

---

### **Fase 2: Ajustar Endpoints Existentes**

#### 2.1 Auth Module
- ✅ Login: Ya está bien mapeado
- ⚠️ Register: Ajustar mapeo de respuesta

#### 2.2 Users Module
- ⚠️ Actualizar endpoints: `/users` → `/users/list`, `/users/:id` → `/users/watch/:id`
- ⚠️ Agregar `GET /users/me`

#### 2.3 Workers Module
- ⚠️ Actualizar endpoints: `/workers` → `/workers/list`
- ⚠️ Agregar `GET /workers/:id/services`

#### 2.4 ServiceCategories Module
- ⚠️ Cambiar endpoint: `/service-categories` → `/categories`

---

### **Fase 3: Agregar Nuevos Módulos**

#### 3.1 Service Requests Module (Nuevo)
- Crear módulo completo para solicitudes de servicio
- Endpoints: POST, GET, PUT, DELETE `/service-requests`

#### 3.2 Reviews Module (Nuevo)
- Crear módulo completo para reseñas
- Endpoints: POST, GET `/reviews`

---

### **Fase 4: Testing y Validación**

#### 4.1 Desactivar Mock Data
- Cambiar todos los `USE_MOCK_DATA = false`
- Probar cada endpoint

#### 4.2 Validar Flujos Completos
- Login → Obtener perfil → Crear servicio → etc.

---

## 🔍 Archivos que Necesitan Cambios (Lista Detallada)

### **Alta Prioridad:**

1. **`src/modules/Users/infra/http/api.config.ts`**
   - Cambiar endpoints para coincidir con backend

2. **`src/modules/Users/infra/http/repositories/http-user.repository.ts`**
   - Actualizar URLs de endpoints
   - Agregar método `getMe()`

3. **`src/modules/workers/infra/http/api.config.ts`**
   - Actualizar endpoints

4. **`src/modules/workers/infra/http/repositories/http-worker.repository.ts`**
   - Actualizar URLs
   - Agregar método para obtener servicios

5. **`src/modules/ServiceCategories/infra/http/api.config.ts`**
   - Cambiar `/service-categories` → `/categories`

6. **`src/modules/Auth/application/use-cases/register.use-case.ts`**
   - Ajustar mapeo de respuesta del backend

### **Media Prioridad:**

7. **`src/modules/Services/infra/http/api.config.ts`**
   - Verificar que endpoints coincidan

8. **Crear nuevos módulos:**
   - `src/modules/ServiceRequests/` (completo)
   - `src/modules/Reviews/` (completo)

### **Baja Prioridad (Mejoras):**

9. **Crear servicio HTTP centralizado**
10. **Crear mapper de DTOs**
11. **Mejorar manejo de errores**

---

## 📋 Checklist de Preparación

### Infraestructura Base:
- [x] `.env` configurado con `VITE_API_URL`
- [x] `api.config.ts` en todos los módulos
- [ ] Servicio HTTP centralizado (crear)
- [ ] Mapper de DTOs (crear)

### Módulos Existentes:
- [ ] Auth: Ajustar mapeo de register
- [ ] Users: Actualizar endpoints
- [ ] Workers: Actualizar endpoints
- [ ] Services: Verificar endpoints
- [ ] ServiceCategories: Cambiar endpoint

### Nuevos Módulos:
- [ ] ServiceRequests: Crear módulo completo
- [ ] Reviews: Crear módulo completo

### Testing:
- [ ] Desactivar mock data
- [ ] Probar cada endpoint
- [ ] Validar flujos completos

---

## 🎯 Próximos Pasos (Cuando estés listo)

1. **Crear servicio HTTP centralizado** (infraestructura base)
2. **Ajustar endpoints de Users y Workers** (compatibilidad)
3. **Ajustar mapeo de Register** (compatibilidad)
4. **Crear módulos nuevos** (ServiceRequests, Reviews)
5. **Desactivar mock data** (conexión real)
6. **Testing completo** (validación)

---

## 📝 Notas Importantes

- **NO hacer cambios todavía** - Este es solo el plan
- **Hacer cambios paso a paso** - Uno a la vez, probando cada uno
- **Mantener mock data activo** - Hasta que todo esté listo
- **Probar cada cambio** - Antes de pasar al siguiente

---

**Estado:** ✅ Plan de preparación completo
**Siguiente paso:** Revisar este plan y decidir por dónde empezar

