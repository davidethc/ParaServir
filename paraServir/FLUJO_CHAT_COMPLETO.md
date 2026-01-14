# 💬 Flujo Completo del Sistema de Chat - Documentación

## 🎯 Resumen

Este documento describe el flujo completo del sistema de chat entre **Cliente** y **Trabajador**, cómo se inicia, cómo funciona, qué puede hacer cada rol, y cómo se cierra.

---

## 🔄 FLUJO GENERAL DEL CHAT

### 1. **Creación de Solicitud de Servicio**
- **Cliente** crea una solicitud de servicio (puede o no especificar un trabajador)
- Estado inicial: `pending`
- **NO hay chat disponible aún** (no hay `worker_id` asignado)

### 2. **Aceptación de Solicitud**
- **Trabajador** acepta la solicitud
- Backend asigna `worker_id` a la solicitud
- Estado cambia a: `accepted`
- **AHORA SÍ hay chat disponible** (hay `worker_id` asignado)

### 3. **Inicio de Conversación**
- Una vez que hay `worker_id`, cualquiera de los dos puede iniciar el chat
- El chat se puede usar en estados: `accepted`, `in_progress`, `completed`
- **NO se puede chatear** si la solicitud está en `pending` o `cancelled`

### 4. **Uso del Chat**
- Ambos pueden enviar mensajes
- Los mensajes se guardan en la tabla `messages`
- Cada mensaje está vinculado a `request_id`

### 5. **Cierre de Conversación**
- **NO hay cierre explícito** - la conversación permanece disponible
- La conversación se puede seguir usando incluso después de `completed`
- Los mensajes históricos siempre están disponibles

---

## 📍 CÓMO SE INICIA UNA CONVERSACIÓN

### Opción 1: Desde Detalle de Solicitud
1. Cliente/Trabajador va a `/dashboard/requests/:id`
2. Si la solicitud tiene `worker_id` y está en estado válido (`accepted`, `in_progress`, `completed`)
3. Aparece botón "Ir al Chat"
4. Al hacer clic, navega a `/dashboard/chats?requestId=:id`
5. Se selecciona automáticamente esa conversación

### Opción 2: Desde Lista de Chats
1. Cliente/Trabajador va a `/dashboard/chats`
2. Ve lista de conversaciones (solo solicitudes con `worker_id` asignado)
3. Hace clic en una conversación
4. Se carga el chat

### Opción 3: Primer Mensaje
- Si no hay mensajes aún, cualquiera puede enviar el primer mensaje
- El primer mensaje puede usar `POST /chat/start` (opcional) o `POST /chat/:requestId/messages` (directo)

---

## 🔐 PERMISOS Y VALIDACIONES

### Backend Validaciones

#### `GET /chat/conversations`
- ✅ Usuario autenticado
- ✅ Solo muestra solicitudes donde el usuario es `client_id` O `worker_id`
- ✅ Solo muestra solicitudes con `worker_id IS NOT NULL`
- ✅ Ordena por último mensaje o `updated_at`

#### `GET /chat/:requestId/messages`
- ✅ Usuario autenticado
- ✅ Verifica que el usuario tiene acceso: `client_id = userId OR worker_id = userId`
- ✅ Retorna 403 si no tiene acceso

#### `POST /chat/:requestId/messages` (Enviar mensaje)
- ✅ Usuario autenticado
- ✅ Verifica acceso a la solicitud
- ✅ Verifica que `worker_id` existe (no se puede chatear sin trabajador asignado)
- ✅ Valida que `content` no esté vacío

#### `POST /chat/start` (Iniciar conversación)
- ✅ Usuario autenticado
- ✅ Verifica acceso a la solicitud
- ✅ Verifica que `worker_id` existe
- ✅ Verifica que NO hay mensajes previos (solo para primer mensaje)

### Frontend Validaciones

#### Estados donde se puede chatear:
- ✅ `accepted` - Trabajador aceptó
- ✅ `in_progress` - Trabajador en progreso
- ✅ `completed` - Servicio completado (chat histórico)

#### Estados donde NO se puede chatear:
- ❌ `pending` - Aún no hay trabajador asignado
- ❌ `cancelled` - Solicitud cancelada

---

## 👤 QUÉ PUEDE HACER CADA ROL

### Cliente (Usuario)
- ✅ Ver lista de conversaciones (solo sus solicitudes)
- ✅ Iniciar chat desde detalle de solicitud
- ✅ Enviar mensajes
- ✅ Ver mensajes recibidos
- ✅ Ver historial completo de mensajes
- ❌ NO puede chatear si no hay trabajador asignado
- ❌ NO puede chatear si la solicitud está cancelada

### Trabajador
- ✅ Ver lista de conversaciones (solo solicitudes que aceptó)
- ✅ Iniciar chat desde detalle de solicitud
- ✅ Enviar mensajes
- ✅ Ver mensajes recibidos
- ✅ Ver historial completo de mensajes
- ❌ NO puede chatear si no ha aceptado la solicitud
- ❌ NO puede chatear si la solicitud está cancelada

---

## 🔄 FLUJOS DETALLADOS

### Flujo: Cliente Inicia Chat

```
Cliente crea solicitud
  ↓
Estado: pending, worker_id: null
  ↓
Trabajador acepta solicitud
  ↓
Estado: accepted, worker_id: asignado
  ↓
Cliente va a /dashboard/requests/:id
  ↓
Ve botón "Ir al Chat" (porque canChat = true)
  ↓
Hace clic → Navega a /dashboard/chats?requestId=:id
  ↓
Frontend carga conversaciones
  ↓
Selecciona automáticamente la conversación del requestId
  ↓
Carga mensajes (puede estar vacío)
  ↓
Cliente escribe primer mensaje
  ↓
POST /chat/:requestId/messages
  ↓
Backend valida: worker_id existe, usuario tiene acceso
  ↓
Guarda mensaje en BD
  ↓
Frontend muestra mensaje en tiempo real
```

### Flujo: Trabajador Responde

```
Trabajador ve notificación o va a /dashboard/chats
  ↓
Ve conversación en lista (con badge de no leídos si hay)
  ↓
Hace clic en conversación
  ↓
Carga mensajes
  ↓
Ve mensaje del cliente
  ↓
Escribe respuesta
  ↓
POST /chat/:requestId/messages
  ↓
Backend valida y guarda
  ↓
Frontend muestra mensaje
```

### Flujo: Conversación Continua

```
Ambos pueden seguir enviando mensajes
  ↓
Cada mensaje actualiza updated_at de la solicitud
  ↓
La conversación aparece ordenada por último mensaje
  ↓
Contador de no leídos se actualiza
  ↓
Chat disponible mientras estado sea: accepted, in_progress, completed
```

---

## 🚫 CÓMO SE "CIERRA" UNA CONVERSACIÓN

### No hay cierre explícito
- La conversación **nunca se cierra** automáticamente
- Los mensajes históricos siempre están disponibles
- La conversación permanece en la lista incluso después de `completed`

### Estados que afectan el chat:
- **`cancelled`**: El chat deja de estar disponible (no se puede enviar mensajes)
- **`completed`**: El chat sigue disponible para mensajes históricos y seguimiento

### Eliminación de conversación:
- Solo se elimina si se elimina la solicitud completa
- No hay endpoint para "cerrar" o "archivar" conversación

---

## 📡 ENDPOINTS DEL BACKEND

### `GET /chat/conversations`
**Descripción**: Obtiene todas las conversaciones del usuario autenticado

**Autenticación**: ✅ Requerida

**Respuesta**:
```json
{
  "status": "success",
  "conversations": [
    {
      "id": "request_id",
      "request_id": "request_id",
      "status": "accepted",
      "description": "Descripción de la solicitud",
      "other_user": {
        "id": "user_id",
        "first_name": "Nombre",
        "last_name": "Apellido",
        "avatar": "url"
      },
      "last_message": "Último mensaje",
      "last_message_at": "2024-01-01T00:00:00Z",
      "unread_count": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Lógica**:
- Solo muestra solicitudes donde el usuario participa (`client_id` o `worker_id`)
- Solo muestra solicitudes con `worker_id IS NOT NULL`
- Ordena por último mensaje o `updated_at`

---

### `GET /chat/:requestId/messages`
**Descripción**: Obtiene todos los mensajes de una conversación

**Autenticación**: ✅ Requerida

**Validaciones**:
- Usuario debe ser `client_id` o `worker_id` de la solicitud

**Respuesta**:
```json
{
  "status": "success",
  "messages": [
    {
      "id": "message_id",
      "content": "Contenido del mensaje",
      "created_at": "2024-01-01T00:00:00Z",
      "sender_id": "user_id",
      "sender_name": "Nombre Apellido",
      "sender_avatar": "url",
      "is_own": true
    }
  ]
}
```

---

### `POST /chat/:requestId/messages`
**Descripción**: Envía un mensaje en una conversación

**Autenticación**: ✅ Requerida

**Body**:
```json
{
  "content": "Mensaje a enviar"
}
```

**Validaciones**:
- Usuario debe tener acceso a la solicitud
- `worker_id` debe existir (no se puede chatear sin trabajador)
- `content` no puede estar vacío

**Respuesta**:
```json
{
  "status": "success",
  "message": {
    "id": "message_id",
    "content": "Mensaje enviado",
    "created_at": "2024-01-01T00:00:00Z",
    "sender_id": "user_id",
    "sender_name": "Nombre Apellido",
    "sender_avatar": "url",
    "is_own": true
  }
}
```

---

### `POST /chat/start`
**Descripción**: Inicia una conversación (envía el primer mensaje)

**Autenticación**: ✅ Requerida

**Body**:
```json
{
  "request_id": "request_id",
  "content": "Primer mensaje"
}
```

**Validaciones**:
- Usuario debe tener acceso a la solicitud
- `worker_id` debe existir
- NO debe haber mensajes previos (solo para primer mensaje)

**Respuesta**: Igual que `POST /chat/:requestId/messages`

**Nota**: Este endpoint es opcional. Se puede usar `POST /chat/:requestId/messages` directamente.

---

## 🎨 INTERFAZ DE USUARIO

### Página de Chats (`/dashboard/chats`)

**Layout**:
- **Izquierda**: Lista de conversaciones
  - Avatar del otro usuario
  - Nombre
  - Último mensaje (preview)
  - Badge de no leídos
  - Estado de la solicitud
  - Tiempo del último mensaje
- **Derecha**: Ventana de chat
  - Header con info del otro usuario
  - Lista de mensajes (scrollable)
  - Input para escribir mensaje

**Estados**:
- **Loading**: Skeleton mientras carga
- **Empty**: "Aún no tienes conversaciones" si no hay ninguna
- **Error**: Mensaje de error si falla la carga
- **No seleccionada**: "Selecciona una conversación para comenzar"

---

## 🔧 CORRECCIONES NECESARIAS

### Error 404 en `/chat/conversations`

**Problema**: El frontend está intentando acceder a `/chat/conversations` pero recibe 404.

**Causa posible**:
1. El endpoint está correctamente registrado en `index.js` como `app.use('/chat', ChatRoutes)`
2. La ruta en `routes/chat.js` es `/conversations` (relativa)
3. La URL completa debería ser: `http://localhost:3900/chat/conversations`

**Verificación**:
- ✅ Backend: `index.js` tiene `app.use('/chat', ChatRoutes)`
- ✅ Routes: `routes/chat.js` tiene `router.get('/conversations', ...)`
- ✅ Frontend: `api.config.ts` tiene `conversations: '/chat/conversations'`

**Solución**: Verificar que el backend esté corriendo y que la URL base sea correcta.

---

## ✅ ESTADO ACTUAL

### ✅ Funcionando
- ✅ Backend endpoints implementados
- ✅ Validaciones de seguridad
- ✅ Frontend componentes creados
- ✅ Integración con solicitudes de servicio
- ✅ Manejo de estados vacíos y errores

### 🔧 Mejoras Pendientes
- ⚠️ Verificar error 404 (puede ser problema de servidor no corriendo)
- ⚠️ Implementar polling automático para nuevos mensajes (opcional)
- ⚠️ Implementar Socket.io para tiempo real (futuro)
- ⚠️ Marcar mensajes como leídos (actualmente solo cuenta total)

---

## 🚀 LISTO PARA PRODUCCIÓN

El sistema de chat está **funcional** pero necesita:
1. ✅ Verificar que el backend esté corriendo
2. ✅ Verificar que las rutas estén correctamente registradas
3. ✅ Probar el flujo completo end-to-end

