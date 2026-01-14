# 📊 Estado de Endpoints: Backend vs Frontend

## ✅ Endpoints Disponibles en el Backend (29 endpoints)

### 🔐 Autenticación (4 endpoints)
1. ✅ `POST /auth/login` - Iniciar sesión
2. ✅ `POST /auth/register` - Registro (usuario o trabajador)
3. ✅ `POST /auth/logout` - Cerrar sesión
4. ✅ `GET /auth/verify-email` - Verificar email

### 📋 Categorías (2 endpoints)
5. ✅ `GET /categories` - Listar todas las categorías
6. ✅ `GET /categories/:id` - Detalle de categoría con trabajadores

### 👤 Usuarios (6 endpoints)
7. ✅ `GET /users/me` - Obtener perfil del usuario autenticado ⭐
8. ✅ `POST /users/new` - Crear nuevo usuario
9. ✅ `GET /users/list` - Listar todos los usuarios
10. ✅ `GET /users/watch/:id` - Ver usuario por ID
11. ✅ `PUT /users/edit/:id` - Actualizar usuario
12. ✅ `DELETE /users/delete/:id` - Eliminar usuario

### 👷 Trabajadores (8 endpoints)
13. ✅ `GET /workers/list` - Listar todos los trabajadores
14. ✅ `GET /workers/watch/:id` - Ver trabajador por ID
15. ✅ `GET /workers/:id/services` - Ver servicios de un trabajador ⭐
16. ✅ `POST /workers/profile` - Crear/actualizar perfil de trabajador
17. ✅ `POST /workers/services` - Crear servicios (uno o múltiples)
18. ✅ `PUT /workers/services/:id` - Actualizar servicio ⭐
19. ✅ `DELETE /workers/services/:id` - Eliminar servicio ⭐

### 📝 Solicitudes de Servicio (5 endpoints) ⭐ NUEVO MÓDULO
20. ✅ `POST /service-requests` - Crear solicitud de servicio
21. ✅ `GET /service-requests` - Listar solicitudes (con filtros)
22. ✅ `GET /service-requests/:id` - Ver solicitud específica
23. ✅ `PUT /service-requests/:id` - Actualizar solicitud
24. ✅ `DELETE /service-requests/:id` - Eliminar/cancelar solicitud

### ⭐ Reseñas (5 endpoints) ⭐ NUEVO MÓDULO
25. ✅ `POST /reviews` - Crear reseña
26. ✅ `GET /reviews/worker/:workerId` - Ver reseñas de trabajador (público)
27. ✅ `GET /reviews/request/:requestId` - Ver reseña de solicitud (público)
28. ✅ `PUT /reviews/:id` - Actualizar reseña
29. ✅ `DELETE /reviews/:id` - Eliminar reseña

### 🏥 Health Check (1 endpoint)
30. ✅ `GET /health` - Verificar estado del servidor

---

## 🎯 Estado de Implementación en el Frontend

### ✅ **IMPLEMENTADO EN EL FRONTEND**

#### Autenticación
- ✅ Login (`POST /auth/login`)
- ✅ Registro (`POST /auth/register`)
- ⚠️ Logout (`POST /auth/logout`) - Endpoint existe pero puede no estar conectado
- ❌ Verificar Email (`GET /auth/verify-email`) - Formulario existe pero falta conectar

#### Categorías
- ✅ Listar categorías (`GET /categories`)
- ✅ Detalle de categoría (`GET /categories/:id`)

#### Solicitudes de Servicio
- ✅ Crear solicitud (`POST /service-requests`)
- ✅ Listar solicitudes (`GET /service-requests`)
- ⚠️ Ver solicitud específica (`GET /service-requests/:id`) - Puede estar parcialmente implementado
- ⚠️ Actualizar solicitud (`PUT /service-requests/:id`) - Implementado en DashboardRequestsPage
- ❌ Eliminar solicitud (`DELETE /service-requests/:id`) - No implementado

#### Servicios de Trabajadores
- ✅ Crear servicios (`POST /workers/services`)
- ✅ Obtener servicios de trabajador (`GET /workers/:id/services`)
- ✅ Actualizar servicio (`PUT /workers/services/:id`)
- ❌ Eliminar servicio (`DELETE /workers/services/:id`) - No implementado

#### Trabajadores
- ⚠️ Listar trabajadores (`GET /workers/list`) - Estructura existe pero puede no estar conectada
- ⚠️ Ver trabajador por ID (`GET /workers/watch/:id`) - Estructura existe pero puede no estar conectada
- ⚠️ Perfil de trabajador (`POST /workers/profile`) - Formulario existe pero puede no estar conectado

---

### ❌ **NO IMPLEMENTADO EN EL FRONTEND**

#### Usuarios
- ❌ **`GET /users/me`** - Obtener perfil del usuario autenticado ⭐ IMPORTANTE
- ❌ `POST /users/new` - Crear usuario (alternativa a /auth/register)
- ❌ `GET /users/list` - Listar usuarios
- ❌ `GET /users/watch/:id` - Ver usuario por ID
- ❌ `PUT /users/edit/:id` - Actualizar usuario
- ❌ `DELETE /users/delete/:id` - Eliminar usuario

#### Reseñas ⭐ MÓDULO COMPLETO FALTANTE
- ❌ **`POST /reviews`** - Crear reseña para solicitud completada
- ❌ **`GET /reviews/worker/:workerId`** - Ver reseñas de trabajador (público)
- ❌ **`GET /reviews/request/:requestId`** - Ver reseña de solicitud
- ❌ **`PUT /reviews/:id`** - Actualizar reseña
- ❌ **`DELETE /reviews/:id`** - Eliminar reseña

#### Solicitudes de Servicio (Funcionalidades faltantes)
- ❌ **`GET /service-requests/:id`** - Ver detalles completos de una solicitud
- ❌ **`DELETE /service-requests/:id`** - Eliminar/cancelar solicitud

#### Trabajadores (Funcionalidades faltantes)
- ❌ **`DELETE /workers/services/:id`** - Eliminar servicio

#### Autenticación
- ❌ **`GET /auth/verify-email`** - Verificar email (formulario existe pero no conectado)

---

## 🚀 Prioridades de Implementación

### 🔴 **ALTA PRIORIDAD**

1. **`GET /users/me`** - Esencial para mostrar perfil del usuario autenticado
   - Necesario para Dashboard, configuración de usuario, etc.

2. **Módulo de Reseñas completo** - Sistema crítico para la plataforma
   - Crear reseña después de completar servicio
   - Mostrar reseñas en perfil de trabajador
   - Ver reseñas en solicitudes completadas

3. **`GET /service-requests/:id`** - Ver detalles completos de solicitud
   - Necesario para vista detallada de solicitudes

4. **`DELETE /service-requests/:id`** - Cancelar solicitudes
   - Funcionalidad básica para usuarios

### 🟡 **MEDIA PRIORIDAD**

5. **`GET /auth/verify-email`** - Verificar email
   - Conectar formulario existente con backend

6. **`DELETE /workers/services/:id`** - Eliminar servicios
   - Gestión completa de servicios

7. **CRUD completo de Usuarios** - Si se necesita administración
   - Listar, ver, editar, eliminar usuarios

### 🟢 **BAJA PRIORIDAD**

8. **`POST /users/new`** - Alternativa de registro
   - Ya existe `/auth/register` que funciona

---

## 📁 Estructura Sugerida para Nuevos Módulos

### Módulo de Reseñas (Reviews)
```
src/modules/Reviews/
├── application/
│   ├── dto/
│   │   ├── create-review.dto.ts
│   │   └── review.dto.ts
│   └── use-cases/
│       ├── create-review.use-case.ts
│       ├── get-worker-reviews.use-case.ts
│       ├── get-request-review.use-case.ts
│       ├── update-review.use-case.ts
│       └── delete-review.use-case.ts
├── infra/
│   └── http/
│       ├── api.config.ts
│       └── controllers/
│           └── review.controller.ts
└── presentation/
    ├── CreateReviewForm.tsx
    ├── ReviewCard.tsx
    ├── WorkerReviewsList.tsx
    └── ReviewRating.tsx
```

### Mejoras en Usuarios
```
src/modules/Users/
├── application/
│   └── use-cases/
│       └── get-me.use-case.ts  ⭐ NUEVO
└── presentation/
    ├── UserProfilePage.tsx  ⭐ NUEVO
    └── EditUserForm.tsx  ⭐ NUEVO
```

---

## 📝 Notas Importantes

1. **Autenticación**: El sistema de autenticación está bien implementado, solo falta conectar verificación de email.

2. **Solicitudes de Servicio**: Está parcialmente implementado. Falta:
   - Vista detallada de solicitud individual
   - Eliminar/cancelar solicitud

3. **Reseñas**: Módulo completo faltante. Es crítico para la funcionalidad de la plataforma.

4. **Perfil de Usuario**: Falta `GET /users/me` que es esencial para mostrar datos del usuario autenticado.

5. **Trabajadores**: La estructura existe pero puede necesitar revisión de conexión con backend.

---

## 🔗 Endpoints Públicos vs Protegidos

### Públicos (no requieren autenticación):
- `GET /health`
- `GET /categories`
- `GET /categories/:id`
- `GET /reviews/worker/:workerId`
- `GET /reviews/request/:requestId`

### Protegidos (requieren token JWT):
- Todos los demás endpoints

### Requieren Rol Específico:
- `POST /workers/profile` - Requiere rol `trabajador`
- `POST /workers/services` - Requiere rol `trabajador`
- `PUT /workers/services/:id` - Requiere rol `trabajador`
- `DELETE /workers/services/:id` - Requiere rol `trabajador`

---

**Última actualización**: Diciembre 2024
**Backend**: ✅ Completo (29 endpoints)
**Frontend**: ⚠️ Parcialmente implementado (~15 endpoints conectados)

