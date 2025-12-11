# 📋 Resumen Completo de Endpoints - ParaServir API

## 🌐 Base URL
```
http://localhost:3900
```

---

## 📊 Estadísticas
- **Total de endpoints**: 13
- **Públicos**: 3
- **Protegidos (requieren auth)**: 10
- **Con control de roles**: 2

---

## ✅ Endpoints Disponibles

### 1. Health Check
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Verifica estado del servidor |

---

### 2. Autenticación (`/auth`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Iniciar sesión |
| POST | `/auth/register` | ❌ | Registro de usuario/trabajador |
| POST | `/auth/logout` | ✅ | Cerrar sesión |
| GET | `/auth/verify-email?token=...` | ❌ | Verificar email |

**Detalles:**
- `/auth/login` retorna token JWT
- `/auth/register` puede crear usuario o trabajador (según `role`)
- `/auth/logout` elimina cookie de sesión
- `/auth/verify-email` requiere token en query params

---

### 3. Categorías (`/categories`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/categories` | ❌ | Listar todas las categorías |

**Respuesta:**
```json
{
  "status": "success",
  "rows": [
    {
      "id": "uuid",
      "name": "Plomería",
      "description": "...",
      "icon": "..."
    }
  ]
}
```

---

### 4. Usuarios (`/users`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/users/new` | ❌ | Crear nuevo usuario |
| GET | `/users/list` | ✅ | Listar todos los usuarios (rol: usuario) |
| GET | `/users/watch/:id` | ✅ | Ver usuario por ID |
| PUT | `/users/edit/:id` | ✅ | Actualizar usuario |
| DELETE | `/users/delete/:id` | ✅ | Eliminar usuario |

**Notas:**
- `/users/new` es público (igual que `/auth/register`)
- Todos los demás requieren autenticación
- `/users/list` solo retorna usuarios con `role = 'usuario'`
- `/users/edit/:id` permite actualizar password (opcional)

---

### 5. Trabajadores (`/workers`)

| Método | Endpoint | Auth | Rol Requerido | Descripción |
|--------|----------|------|---------------|-------------|
| GET | `/workers/list` | ✅ | - | Listar todos los trabajadores |
| GET | `/workers/watch/:id` | ✅ | - | Ver trabajador por ID |
| POST | `/workers/profile` | ✅ | `trabajador` | Crear/actualizar perfil profesional |
| POST | `/workers/services` | ✅ | `trabajador` | Crear servicios (máx 3) |

**Notas:**
- `/workers/list` y `/workers/watch/:id` requieren auth pero cualquier rol puede acceder
- `/workers/profile` y `/workers/services` requieren rol `trabajador`
- `/workers/services` acepta un servicio o array de servicios
- Máximo 3 servicios por trabajador (validado en BD)

---

## 🔐 Autenticación

### Cómo Autenticarse:
1. **Login**: `POST /auth/login` con `{ email, password }`
2. **Recibir token**: El token viene en la respuesta JSON
3. **Usar token**: Enviar en header `Authorization: Bearer <token>` o en cookie `access_token`

### Ejemplo de Request Autenticado:
```javascript
fetch('http://localhost:3900/users/list', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## 📝 Ejemplos de Uso

### 1. Registrar un Usuario
```bash
POST /auth/register
Body:
{
  "email": "cliente@mail.com",
  "password": "Password123!",
  "first_name": "María",
  "last_name": "López",
  "cedula": "1712345679",
  "phone": "0988888888",
  "location": "Quito",
  "role": "usuario"
}
```

### 2. Registrar un Trabajador con Servicio
```bash
POST /auth/register
Body:
{
  "email": "trabajador@mail.com",
  "password": "Password123!",
  "first_name": "Juan",
  "last_name": "Pérez",
  "cedula": "1712345678",
  "phone": "0999999999",
  "location": "Loja",
  "role": "trabajador",
  "years_experience": 3,
  "certification_url": "https://certs.com/doc.pdf",
  "service_title": "Plomería básica",
  "service_description": "Reparación de fugas",
  "category_name": "Plomería",
  "base_price": 25.5
}
```

### 3. Crear Servicios Adicionales
```bash
POST /workers/services
Headers: Authorization: Bearer <token>
Body:
{
  "services": [
    {
      "title": "Reparación de calentadores",
      "description": "Mantenimiento de calentadores",
      "category_name": "Plomería",
      "base_price": 40.0
    },
    {
      "title": "Instalación de sanitarios",
      "description": "Instalación completa",
      "category_name": "Plomería",
      "base_price": 50.0
    }
  ]
}
```

---

## ❌ Endpoints Faltantes (Para Implementar)

### Críticos para Frontend:
1. `GET /users/me` - Obtener perfil del usuario autenticado
2. `GET /workers/:id/services` - Ver servicios de un trabajador
3. `PUT /workers/services/:id` - Actualizar servicio
4. `DELETE /workers/services/:id` - Eliminar servicio

### Core del Negocio:
5. `POST /service-requests` - Crear solicitud de servicio
6. `GET /service-requests` - Listar solicitudes
7. `GET /service-requests/:id` - Ver solicitud específica
8. `PUT /service-requests/:id` - Actualizar estado
9. `DELETE /service-requests/:id` - Cancelar solicitud

### Reseñas:
10. `POST /reviews` - Crear reseña
11. `GET /reviews/worker/:workerId` - Ver reseñas de trabajador
12. `GET /reviews/request/:requestId` - Ver reseña de solicitud

### Búsqueda:
13. `GET /workers/search` - Buscar trabajadores (filtros)

---

## 📦 Importar a Postman

1. Abre Postman
2. Click en "Import"
3. Selecciona el archivo: `ParaServir_API.postman_collection.json`
4. Configura la variable `base_url` = `http://localhost:3900`
5. Haz login primero para obtener el token
6. El token se guardará automáticamente en la variable `auth_token`

---

## 🎯 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado exitosamente |
| 400 | Error de validación o datos inválidos |
| 401 | No autenticado |
| 403 | No autorizado (sin permisos o rol incorrecto) |
| 404 | Recurso no encontrado |
| 500 | Error del servidor |

---

## 🔄 Flujo Típico

### Para un Cliente:
1. `POST /auth/register` → Registrarse
2. `GET /auth/verify-email?token=...` → Verificar email
3. `POST /auth/login` → Iniciar sesión
4. `GET /categories` → Ver categorías
5. `GET /workers/list` → Ver trabajadores
6. `GET /workers/watch/:id` → Ver detalles de trabajador

### Para un Trabajador:
1. `POST /auth/register` → Registrarse como trabajador
2. `GET /auth/verify-email?token=...` → Verificar email
3. `POST /auth/login` → Iniciar sesión
4. `POST /workers/profile` → Completar perfil profesional
5. `POST /workers/services` → Agregar servicios (hasta 3)

---

**Última actualización**: Diciembre 2024
**Versión API**: 1.0.0

