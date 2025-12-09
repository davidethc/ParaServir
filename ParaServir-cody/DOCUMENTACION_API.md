# Documentación Completa de la API ParaServir

## Base URL
```
http://localhost:3900
```

## Autenticación
La mayoría de los endpoints requieren autenticación mediante JWT. El token se puede enviar de dos formas:
- **Cookie**: `access_token` (HTTP-only)
- **Header**: `Authorization: Bearer <token>`

---

## 📋 Endpoints Disponibles

### 1. Health Check
**GET** `/health`

Verifica el estado del servidor.

**Respuesta:**
```json
{
  "status": "ok"
}
```

---

### 2. Categorías de Servicios

#### 2.1. Listar Categorías
**GET** `/categories`

Obtiene todas las categorías de servicios disponibles (público).

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "rows": [
    {
      "id": "uuid",
      "name": "Plomería",
      "description": "Servicios de plomería",
      "icon": "plumber-icon"
    }
  ]
}
```

---

### 3. Autenticación

#### 3.1. Registro de Usuario/Trabajador
**POST** `/auth/register`

Registra un nuevo usuario o trabajador en el sistema.

**Body (Usuario regular):**
```json
{
  "email": "cliente@mail.com",
  "password": "Password123!",
  "first_name": "María",
  "last_name": "López",
  "cedula": "1712345679",
  "phone": "0988888888",
  "location": "Quito",
  "avatar_url": null,
  "role": "usuario"
}
```

**Body (Trabajador con servicio):**
```json
{
  "email": "juan@mail.com",
  "password": "Password123!",
  "first_name": "Juan",
  "last_name": "Pérez",
  "cedula": "1712345678",
  "phone": "0999999999",
  "location": "Loja, Ecuador",
  "avatar_url": "https://ejemplo.com/avatar.jpg",
  "role": "trabajador",
  "years_experience": 3,
  "certification_url": "https://certs.com/doc.pdf",
  "service_title": "Plomería básica",
  "service_description": "Reparación de fugas y grifos",
  "category_id": "uuid-de-categoria",
  "base_price": 25.5
}
```

**Notas:**
- `role` puede ser: `"usuario"`, `"trabajador"` o `"admin"`
- Para trabajadores, puedes usar `category_id` (UUID) o `category_name` (string)
- Si envías datos de servicio al registrar, se crea automáticamente el primer servicio
- La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un símbolo especial

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario agregado",
  "user": {
    "id": "uuid",
    "email": "juan@mail.com",
    "role": "trabajador",
    "is_verified": false
  },
  "token": "jwt-token-here"
}
```

**Errores:**
- `400`: Email ya existe, datos inválidos
- `500`: Error del servidor

---

#### 3.2. Login
**POST** `/auth/login`

Inicia sesión y obtiene un token JWT.

**Body:**
```json
{
  "email": "juan@mail.com",
  "password": "Password123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Bienvenido",
  "user": {
    "id": "uuid",
    "email": "juan@mail.com",
    "role": "trabajador"
  },
  "token": "jwt-token-here"
}
```

**Errores:**
- `400`: Credenciales incorrectas, campos faltantes

---

#### 3.3. Logout
**POST** `/auth/logout`

Cierra sesión eliminando la cookie de autenticación.

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Sesión cerrada. Cookie de token eliminada."
}
```

---

#### 3.4. Verificar Email
**GET** `/auth/verify-email?token=<verificationToken>`

Verifica el email del usuario usando el token enviado por correo.

**Query Parameters:**
- `token` (requerido): Token de verificación recibido por email

**Respuesta exitosa (200):**
```json
{
  "message": "Correo verificado exitosamente"
}
```

**Errores:**
- `400`: Token no proporcionado, token expirado o inválido
- `404`: Usuario no encontrado

---

### 4. Usuarios

#### 4.1. Crear Usuario (Público)
**POST** `/users/new`

Crea un nuevo usuario. Similar a `/auth/register` pero específico para usuarios regulares.

**Body:**
```json
{
  "email": "cliente@mail.com",
  "password": "Password123!",
  "first_name": "María",
  "last_name": "López",
  "cedula": "1712345679",
  "phone": "0988888888",
  "location": "Quito",
  "avatar_url": null,
  "role": "usuario"
}
```

**Respuesta:** Igual que `/auth/register`

---

#### 4.2. Listar Usuarios (Clientes)
**GET** `/users/list`

Obtiene la lista de todos los usuarios con rol "usuario" (clientes).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "rows": [
    {
      "first_name": "María",
      "last_name": "López",
      "cedula": "1712345679",
      "phone": "0988888888",
      "location": "Quito",
      "avatar_url": null,
      "email": "cliente@mail.com",
      "role": "usuario",
      "is_verified": true
    }
  ]
}
```

**Errores:**
- `401`: No autenticado
- `403`: Token inválido
- `404`: No se encontraron usuarios

---

#### 4.3. Ver Usuario por ID
**GET** `/users/watch/:id`

Obtiene los datos de un usuario específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros de URL:**
- `id` (requerido): UUID del usuario

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Usario encontrado",
  "rows": [
    {
      "first_name": "María",
      "last_name": "López",
      "cedula": "1712345679",
      "phone": "0988888888",
      "location": "Quito",
      "avatar_url": null,
      "email": "cliente@mail.com",
      "role": "usuario",
      "is_verified": true
    }
  ]
}
```

**Errores:**
- `401`: No autenticado
- `404`: Usuario no encontrado

---

#### 4.4. Actualizar Usuario
**PUT** `/users/edit/:id`

Actualiza los datos de un usuario existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (requerido): UUID del usuario

**Body:**
```json
{
  "email": "cliente@mail.com",
  "password": "NewPassword123!",
  "first_name": "María",
  "last_name": "López",
  "cedula": "1712345679",
  "phone": "0988888888",
  "location": "Quito",
  "avatar_url": null,
  "role": "usuario"
}
```

**Notas:**
- `password` es opcional. Si no se envía, se mantiene la contraseña actual.
- Si el usuario es trabajador, puedes incluir datos de `worker` en el body.

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario actualizado",
  "user": {
    "id": "uuid",
    "email": "cliente@mail.com",
    "role": "usuario"
  }
}
```

**Errores:**
- `401`: No autenticado
- `404`: Usuario no encontrado
- `400`: Error al actualizar

---

#### 4.5. Eliminar Usuario
**DELETE** `/users/delete/:id`

Elimina un usuario y todos sus datos relacionados (cascada).

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros de URL:**
- `id` (requerido): UUID del usuario

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado correctamente"
}
```

**Errores:**
- `401`: No autenticado
- `404`: Usuario no encontrado
- `500`: Error del servidor

---

### 5. Trabajadores

#### 5.1. Listar Trabajadores
**GET** `/workers/list`

Obtiene la lista de todos los trabajadores con sus perfiles completos.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "rows": [
    {
      "id": "uuid",
      "email": "juan@mail.com",
      "role": "trabajador",
      "is_verified": true,
      "first_name": "Juan",
      "last_name": "Pérez",
      "cedula": "1712345678",
      "phone": "0999999999",
      "avatar_url": "https://...",
      "location": "Loja, Ecuador",
      "years_experience": 3,
      "certification_url": "https://certs.com/doc.pdf",
      "verification_status": "pending",
      "is_active": true
    }
  ]
}
```

**Errores:**
- `401`: No autenticado
- `404`: No se encontraron trabajadores

---

#### 5.2. Ver Trabajador por ID
**GET** `/workers/watch/:id`

Obtiene los datos completos de un trabajador específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros de URL:**
- `id` (requerido): UUID del trabajador

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "rows": [
    {
      "id": "uuid",
      "email": "juan@mail.com",
      "role": "trabajador",
      "is_verified": true,
      "first_name": "Juan",
      "last_name": "Pérez",
      "cedula": "1712345678",
      "phone": "0999999999",
      "avatar_url": "https://...",
      "location": "Loja, Ecuador",
      "years_experience": 3,
      "certification_url": "https://certs.com/doc.pdf",
      "verification_status": "pending",
      "is_active": true
    }
  ]
}
```

**Errores:**
- `401`: No autenticado
- `404`: Trabajador no encontrado

---

#### 5.3. Crear/Actualizar Perfil de Trabajador
**POST** `/workers/profile`

Crea o actualiza el perfil profesional del trabajador autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Requisitos:**
- El usuario debe estar autenticado
- El usuario debe tener rol `"trabajador"`

**Body:**
```json
{
  "years_experience": 5,
  "certification_url": "https://certs.com/certificado.pdf",
  "verification_status": "pending",
  "is_active": true
}
```

**Campos:**
- `years_experience` (requerido): Número entero >= 0
- `certification_url` (opcional): URL válida del certificado
- `verification_status` (opcional): `"pending"`, `"verified"`, `"rejected"` (default: `"pending"`)
- `is_active` (opcional): Boolean (default: `true`)

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "years_experience": 5,
    "certification_url": "https://certs.com/certificado.pdf",
    "verification_status": "pending",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `401`: No autenticado
- `403`: No tienes permisos (no eres trabajador)
- `400`: Datos inválidos

---

#### 5.4. Crear Servicios del Trabajador
**POST** `/workers/services`

Crea uno o más servicios para el trabajador autenticado. Máximo 3 servicios por trabajador.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Requisitos:**
- El usuario debe estar autenticado
- El usuario debe tener rol `"trabajador"`
- Máximo 3 servicios por trabajador

**Body (un servicio):**
```json
{
  "title": "Plomería básica",
  "description": "Reparación de fugas y grifos",
  "category_id": "uuid-de-categoria",
  "base_price": 25.5
}
```

**Body (múltiples servicios):**
```json
{
  "services": [
    {
      "title": "Plomería básica",
      "description": "Reparación de fugas y grifos",
      "category_id": "uuid-de-categoria",
      "base_price": 25.5
    },
    {
      "title": "Instalación de tuberías",
      "description": "Instalación completa de sistemas de tuberías",
      "category_name": "Plomería",
      "base_price": 50.0
    }
  ]
}
```

**Campos:**
- `title` o `service_title` (requerido): Título del servicio (mínimo 3 caracteres)
- `description` o `service_description` (opcional): Descripción del servicio (mínimo 10 caracteres si se proporciona)
- `category_id` (opcional): UUID de la categoría
- `category_name` (opcional): Nombre de la categoría (alternativa a `category_id`)
- `base_price` (opcional): Precio base del servicio (número >= 0)

**Nota:** Debes proporcionar `category_id` O `category_name`, no ambos.

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "message": "Servicios creados",
  "services": [
    {
      "id": "uuid",
      "worker_id": "uuid",
      "category_id": "uuid",
      "title": "Plomería básica",
      "description": "Reparación de fugas y grifos",
      "base_price": 25.5,
      "is_available": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Errores:**
- `401`: No autenticado
- `403`: No tienes permisos (no eres trabajador)
- `400`: 
  - Ya tienes 3 servicios (no puedes agregar más)
  - Categoría no encontrada
  - Datos inválidos
  - Título requerido

---

## 📊 Estructura de la Base de Datos

### Tablas Principales:

1. **users**: Información de autenticación (email, password_hash, role, is_verified)
2. **profiles**: Datos personales (first_name, last_name, cedula, phone, location, avatar_url)
3. **worker_profiles**: Perfil profesional del trabajador (years_experience, certification_url, verification_status, is_active)
4. **service_categories**: Categorías de servicios (name, description, icon)
5. **worker_services**: Servicios ofrecidos por trabajadores (title, description, base_price, category_id)
6. **service_requests**: Solicitudes de servicio (cliente-trabajador)
7. **messages**: Mensajes del chat
8. **reviews**: Reseñas de servicios
9. **admin_actions**: Log de acciones administrativas

---

## 🔐 Validaciones y Reglas

### Contraseña:
- Mínimo 8 caracteres
- Debe incluir letras, números y al menos un símbolo especial (@$!%*?&)

### Teléfono:
- Entre 8 y 15 dígitos
- Solo números (se eliminan caracteres especiales)

### Roles:
- `"usuario"`: Cliente regular
- `"trabajador"`: Proveedor de servicios
- `"admin"`: Administrador del sistema

### Servicios de Trabajador:
- Máximo 3 servicios por trabajador
- Se valida automáticamente con un trigger en la BD

### Verificación de Email:
- Al registrarse, se envía un email con token de verificación
- El token expira después de cierto tiempo
- Se debe verificar el email para activar la cuenta

---

## 🚨 Códigos de Estado HTTP

- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación o datos inválidos
- `401`: No autenticado
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error del servidor

---

## 📝 Notas Importantes

1. **Autenticación**: La mayoría de endpoints requieren token JWT. Se puede enviar en cookie o header.

2. **Normalización de Datos**: 
   - Los emails se convierten a minúsculas automáticamente
   - Los teléfonos se normalizan (solo dígitos)
   - Los roles se normalizan (`"client"` → `"usuario"`, `"worker"` → `"trabajador"`)

3. **Transacciones**: Las operaciones de creación/actualización usan transacciones de BD para garantizar consistencia.

4. **Cascada**: Al eliminar un usuario, se eliminan automáticamente:
   - Su perfil
   - Su perfil de trabajador (si existe)
   - Sus servicios (si es trabajador)
   - Todas las relaciones

5. **Límites**:
   - Máximo 3 servicios por trabajador
   - Validación de formato UUID para IDs
   - Validación de URLs para certificados y avatares

---

## 🔄 Flujo Típico de Uso

### Para un Cliente:
1. `POST /auth/register` - Registrarse
2. `GET /auth/verify-email?token=...` - Verificar email
3. `POST /auth/login` - Iniciar sesión
4. `GET /categories` - Ver categorías disponibles
5. `GET /workers/list` - Ver trabajadores disponibles
6. `GET /workers/watch/:id` - Ver detalles de un trabajador

### Para un Trabajador:
1. `POST /auth/register` - Registrarse como trabajador (con datos de servicio opcionales)
2. `GET /auth/verify-email?token=...` - Verificar email
3. `POST /auth/login` - Iniciar sesión
4. `POST /workers/profile` - Completar perfil profesional
5. `POST /workers/services` - Agregar servicios (hasta 3)
6. `GET /workers/list` - Ver otros trabajadores

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Registrar un Trabajador Completo
```bash
curl -X POST http://localhost:3900/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "plomero@mail.com",
    "password": "Plomero123!",
    "first_name": "Carlos",
    "last_name": "Méndez",
    "cedula": "1712345678",
    "phone": "0999999999",
    "location": "Quito, Ecuador",
    "role": "trabajador",
    "years_experience": 5,
    "certification_url": "https://certs.com/cert.pdf",
    "service_title": "Plomería completa",
    "service_description": "Reparación e instalación de sistemas de plomería",
    "category_name": "Plomería",
    "base_price": 30.0
  }'
```

### Ejemplo 2: Agregar Servicios Adicionales
```bash
curl -X POST http://localhost:3900/workers/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "services": [
      {
        "title": "Reparación de calentadores",
        "description": "Mantenimiento y reparación de calentadores de agua",
        "category_name": "Plomería",
        "base_price": 40.0
      },
      {
        "title": "Instalación de sanitarios",
        "description": "Instalación completa de sanitarios y accesorios",
        "category_name": "Plomería",
        "base_price": 50.0
      }
    ]
  }'
```

---

**Última actualización:** Diciembre 2024
**Versión de la API:** 1.0.0
