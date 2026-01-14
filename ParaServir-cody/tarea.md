# 📅 PLAN DE TRABAJO — PARA SERVIR

Este documento define **qué hacer**, **en qué orden** y **qué corresponde a cada rol (Cliente / Trabajador / Backend / Frontend)**.

---

## 🧠 REGLA GENERAL DE TRABAJO

1. Leer la Historia de Usuario (HU).
2. Entender qué problema resuelve.
3. Implementar subtareas **una por una**.
4. Probar localmente antes de marcar como “Hecho”.
5. Hacer commits pequeños y claros.
6. Si no se termina, dejar en **En progreso** con comentarios.

---

# ✅ EPIC 01 — MÓDULO DE USUARIOS (COMÚN A AMBOS ROLES)

## HU01 — Registro

### 👤 CLIENTE / 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Crear formulario de registro
- [ ] Campos: nombre, email, contraseña, rol
- [ ] Validar campos
- [ ] Enviar a `POST /auth/register`
- [ ] Mostrar mensajes de error / éxito
- [ ] Redirigir a login

### ⚙️ BACKEND
- [ ] Endpoint `POST /auth/register`
- [ ] Validar email único
- [ ] Hashear contraseña (bcrypt)
- [ ] Guardar usuario con rol
- [ ] Retornar status HTTP correcto

---

## HU02 — Login

### 👤 CLIENTE / 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Formulario login
- [ ] Validar email y contraseña
- [ ] Enviar a `POST /auth/login`
- [ ] Guardar token en localStorage
- [ ] Redirigir según rol:
  - Cliente → Dashboard Cliente
  - Trabajador → Dashboard Trabajador

### ⚙️ BACKEND
- [ ] Endpoint `POST /auth/login`
- [ ] Validar credenciales
- [ ] Generar JWT (id, rol)
- [ ] Retornar token + user

---

## HU03 — Recuperar contraseña

### 👤 CLIENTE / 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Pantalla solicitar email
- [ ] Pantalla nueva contraseña
- [ ] Mostrar notificaciones

### ⚙️ BACKEND
- [ ] `POST /auth/forgot`
- [ ] Generar token temporal
- [ ] Enviar email
- [ ] `POST /auth/reset`
- [ ] Actualizar contraseña

---

# ✅ EPIC 02 — PERFIL (CLIENTE vs TRABAJADOR)

## HU04 — Editar perfil

### 👤 CLIENTE — FRONTEND
- [ ] Editar nombre, foto, teléfono
- [ ] Guardar cambios
- [ ] Preview imagen

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Editar datos personales
- [ ] Editar experiencia profesional
- [ ] Editar descripción
- [ ] Subir fotos de trabajos

### ⚙️ BACKEND (AMBOS)
- [ ] `PUT /users/profile`
- [ ] Validar campos
- [ ] Guardar cambios
- [ ] Manejo de imágenes (multer o cloud)

---

## HU05 — Eliminar cuenta

### 👤 CLIENTE / 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Botón eliminar cuenta
- [ ] Modal de confirmación
- [ ] Logout automático

### ⚙️ BACKEND
- [ ] `DELETE /users/delete`
- [ ] Soft delete o delete físico
- [ ] Invalidar token

---

# ✅ EPIC 03 — SERVICIOS (SOLO TRABAJADOR CREA)

## HU09 — Crear perfil profesional

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Formulario experiencia
- [ ] Selección de categorías
- [ ] Subir fotos
- [ ] Guardar perfil

### ⚙️ BACKEND
- [ ] `POST /worker/profile`
- [ ] Validar rol trabajador
- [ ] Guardar info profesional

---

## HU10 — Crear servicios

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Formulario crear servicio
- [ ] Validar máximo 3 servicios
- [ ] Mostrar lista de servicios

### ⚙️ BACKEND
- [ ] `POST /worker/services`
- [ ] Middleware límite 3
- [ ] Guardar servicio

---

## HU14 — Ver servicios

### 👤 CLIENTE — FRONTEND
- [ ] Ver perfil del trabajador
- [ ] Ver servicios
- [ ] Ver precios y rating

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Ver sus propios servicios
- [ ] Editar servicio
- [ ] Eliminar servicio

### ⚙️ BACKEND
- [ ] `GET /worker/:id/services`

---

# ✅ EPIC 04 — PUBLICACIONES / FEED (AMBOS VEN)

## HU15 — Feed de servicios

### 👤 CLIENTE — FRONTEND
- [ ] Feed principal
- [ ] Buscar servicios
- [ ] Aplicar filtros

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Ver servicios publicados
- [ ] Ver ranking propio

### ⚙️ BACKEND
- [ ] `GET /services`
- [ ] Paginación

---

# ✅ EPIC 05 — CHAT (MISMA LÓGICA, DISTINTAS VISTAS)

## HU25 — Iniciar chat

### 👤 CLIENTE — FRONTEND
- [ ] Botón “Chatear”
- [ ] Abrir chat con trabajador

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Ver chats entrantes
- [ ] Ver notificaciones

### ⚙️ BACKEND
- [ ] `POST /chat/start`
- [ ] Crear sala si no existe

---

## HU26 — Mensajes en tiempo real

### 👤 CLIENTE / 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] UI tipo WhatsApp
- [ ] Enviar mensajes
- [ ] Recibir mensajes
- [ ] Ver historial

### ⚙️ BACKEND
- [ ] Configurar Socket.io
- [ ] Guardar mensajes
- [ ] Emitir eventos

---

# ✅ EPIC 06 — RESEÑAS

## HU30 — Calificar trabajador

### 👤 CLIENTE — FRONTEND
- [ ] Formulario de estrellas
- [ ] Comentario
- [ ] Enviar reseña

### 🧑‍🔧 TRABAJADOR — FRONTEND
- [ ] Ver reseñas recibidas
- [ ] Ver promedio de calificación

### ⚙️ BACKEND
- [ ] `POST /reviews`
- [ ] Guardar rating
- [ ] Calcular promedio

---

# 🧠 REGLA FINAL PARA TODO EL EQUIPO

- ❌ No avanzar sin probar
- ❌ No hacer commits gigantes
- ✅ Commits pequeños y claros
- ✅ Una HU = varias subtareas
- ✅ Documentar bloqueos
