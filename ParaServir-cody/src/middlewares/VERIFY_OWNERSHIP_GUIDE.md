# Middleware de Verificación de Propiedad - `verifyOwnership`

## ¿Qué es?

Un middleware que verifica que el usuario logueado solo pueda hacer cambios (actualizar/eliminar) en sus propios datos. Evita que un usuario modifique información de otros usuarios.

## ¿Cómo funciona?

1. Decodifica el token JWT para obtener el ID del usuario logueado
2. Obtiene el ID del recurso a modificar desde los parámetros de la URL
3. Consulta la base de datos para verificar quién es el propietario del recurso
4. Si el usuario es el propietario, permite continuar. Si no, rechaza la solicitud con un error 403

## Importación

```javascript
import { verifyOwnership } from "../middlewares/verifyOwnership.js";
```

## Parámetros

```javascript
verifyOwnership(tableName, paramName, ownerField)
```

- **tableName** (requerido): Nombre de la tabla en la BD (ej: 'users', 'services', 'service_requests')
- **paramName** (requerido): Nombre del parámetro en la URL (ej: 'id')
- **ownerField** (opcional): Campo en la tabla que contiene el ID del propietario. Por defecto es 'user_id'

## Ejemplos de Uso

### 1. Usuario actualiza su propio perfil

```javascript
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";
import { updateUser } from "../controllers/user.js";

const router = Router();

// El usuario solo puede actualizar su propio perfil
router.put('/update/:id', auth, verifyOwnership('users', 'id'), updateUser);

export default router;
```

### 2. Worker actualiza sus propios servicios

```javascript
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";
import { updateService } from "../controllers/service.js";

const router = Router();

// El worker solo puede actualizar sus propios servicios
// El campo 'worker_id' en la tabla 'services' identifica al propietario
router.put('/update/:id', auth, verifyOwnership('services', 'id', 'worker_id'), updateService);

export default router;
```

### 3. Usuario elimina su propia solicitud

```javascript
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";
import { deleteRequest } from "../controllers/serviceRequest.js";

const router = Router();

// El usuario solo puede eliminar sus propias solicitudes
router.delete('/delete/:id', auth, verifyOwnership('service_requests', 'id', 'user_id'), deleteRequest);

export default router;
```

## Respuestas del Middleware

### ✅ Éxito - Usuario es propietario

Si el usuario es el propietario del recurso, el middleware continúa con el siguiente controlador.

### ❌ Error 403 - No es propietario

```json
{
    "status": "error",
    "message": "No tienes permiso para modificar este recurso. Solo puedes cambiar tus propios datos."
}
```

### ❌ Error 404 - Recurso no encontrado

```json
{
    "status": "error",
    "message": "Recurso no encontrado en users"
}
```

### ❌ Error 400 - Parámetro faltante

```json
{
    "status": "error",
    "message": "Parámetro 'id' no encontrado en la solicitud"
}
```

## Tabla de Referencia - Configuración por Entidad

| Entidad | Tabla | Parámetro URL | Campo Propietario |
|---------|-------|---------------|--------------------|
| Usuario | `users` | `id` | (sin usar, es directo) |
| Servicio | `services` | `id` | `worker_id` |
| Solicitud de Servicio | `service_requests` | `id` | `user_id` |
| Reseña | `reviews` | `id` | `user_id` o `worker_id` |
| Categoría | `categories` | `id` | Depende de tu estructura |

## Implementación en Rutas Existentes

Si quieres actualizar tus rutas actuales, aquí está cómo quedarían:

### service.js

```javascript
import { Router } from "express";
import { createServices, listService, watchService, deleteService, updateService, available } from "../controllers/service.js";
import { auth } from "../middlewares/auth.js";
import { requireWorker } from "../middlewares/requireWorker.js";
import { validateService } from "../middlewares/validateService.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

router.post('/create', auth, requireWorker, validateService, createServices);
router.get('/list', auth, listService);
router.get('/watch/:id', auth, watchService);

// Ahora solo el worker propietario puede eliminar su servicio
router.delete('/delete/:id', auth, requireWorker, verifyOwnership('services', 'id', 'worker_id'), deleteService);

// Ahora solo el worker propietario puede actualizar su servicio
router.put(
    '/update/:id', 
    auth,
    requireWorker,
    verifyOwnership('services', 'id', 'worker_id'),
    validateService, 
    updateService
);

// Solo el worker propietario puede cambiar el estado
router.put('/change_status/:id', auth, requireWorker, verifyOwnership('services', 'id', 'worker_id'), available);

export default router;
```

## Consideraciones Importantes

1. **Orden de middlewares**: El `verifyOwnership` debe ir DESPUÉS del `auth` para asegurar que el usuario esté autenticado
2. **Campo propietario**: Verifica que el nombre del campo en la BD coincida exactamente (case-sensitive)
3. **Combinación con otros middlewares**: Funciona bien con `requireWorker`, `validateService`, etc.
4. **Auditoría**: Considera agregar logs si necesitas auditoría de intentos fallidos

## Verificación de Seguridad

✅ Token válido y no expirado (verificado por middleware `auth`)
✅ Usuario autenticado
✅ Recurso existe en la BD
✅ Usuario es el propietario del recurso
✅ Previene acceso no autorizado (403 Forbidden)
