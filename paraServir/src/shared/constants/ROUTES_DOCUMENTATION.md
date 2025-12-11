# Documentación del Sistema de Rutas

## 📋 Resumen

Sistema centralizado de rutas para evitar errores de tipeo, facilitar mantenimiento y asegurar seguridad consistente en toda la aplicación.

## 📁 Archivo Principal

**`/shared/constants/routes.constants.ts`**

Este archivo contiene todas las constantes de rutas del proyecto.

## 🔐 Tipos de Rutas

### 1. Rutas Públicas (`ROUTES.PUBLIC`)
- **Acceso**: Sin autenticación requerida
- **Guards**: `PublicRoute` (redirige si ya estás autenticado)
- **Rutas**:
  - `HOME`: "/"
  - `LOGIN`: "/login"
  - `REGISTER`: "/register"
  - `FORGOT_PASSWORD`: "/forgot-password"
  - `VERIFY_CODE`: "/verify-code"
  - `RESET_PASSWORD`: "/reset-password"
  - `RESET_SUCCESS`: "/reset-success"

### 2. Rutas del Dashboard (`ROUTES.DASHBOARD`)
- **Acceso**: Requiere autenticación
- **Guards**: `ProtectedRoute`
- **Rutas**:
  - `HOME`: "/dashboard"
  - `CATEGORIES`: "/dashboard/categories"
  - `CATEGORY_DETAIL(id)`: Función que retorna "/dashboard/categories/{id}"
  - `REQUESTS`: "/dashboard/requests"
  - `CHATS`: "/dashboard/chats"
  - `HELP`: "/dashboard/help"
  - `SETTINGS`: "/dashboard/settings"
  - `SEARCH(query)`: Función que retorna "/dashboard/search?q={query}"

### 3. Rutas de Trabajador (`ROUTES.WORKER`)
- **Acceso**: Requiere autenticación + rol "trabajador"
- **Guards**: `RoleProtectedRoute` con `requiredRole="trabajador"`
- **Rutas**:
  - `CREATE_SERVICE`: "/create-basic-service"
  - `COMPLETE_PROFILE`: "/complete-worker-profile"

### 4. Rutas de Navegación (`ROUTES.NAVIGATION`)
- **Acceso**: Públicas (pueden no estar implementadas aún)
- **Rutas**:
  - `JOBS`: "/jobs"
  - `ABOUT`: "/about"
  - `SERVICES`: "/services"
  - `TERMS`: "#"
  - `PRIVACY`: "#"

## 🛡️ Guards de Seguridad

### `PublicRoute`
- **Propósito**: Protege rutas públicas (login, register)
- **Comportamiento**: Si el usuario está autenticado, redirige a `/dashboard`
- **Uso**: Envolver `LoginForm` y `RegisterForm`

### `ProtectedRoute`
- **Propósito**: Protege rutas que requieren autenticación
- **Comportamiento**: 
  - Si no está autenticado → redirige a `/login`
  - Valida token y estado de autenticación
  - Opcional: valida rol con `requiredRole`
- **Uso**: Envolver rutas del dashboard y otras protegidas

### `RoleProtectedRoute`
- **Propósito**: Protege rutas que requieren un rol específico
- **Comportamiento**:
  - Valida autenticación primero
  - Luego valida el rol requerido
  - Si no tiene el rol → redirige a `/dashboard`
- **Uso**: Rutas solo para trabajadores

## 📝 Uso en el Código

### Ejemplo 1: Navegación programática
```typescript
import { useNavigate } from "react-router-dom";
import { ROUTES, buildRoute } from "@/shared/constants/routes.constants";

const navigate = useNavigate();

// Navegar a dashboard
navigate(ROUTES.DASHBOARD.HOME);

// Navegar a detalle de categoría
navigate(buildRoute.categoryDetail(categoryId));

// Navegar a búsqueda
navigate(ROUTES.DASHBOARD.SEARCH("carpintería"));
```

### Ejemplo 2: Links
```typescript
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";

<Link to={ROUTES.PUBLIC.LOGIN}>Iniciar Sesión</Link>
<Link to={ROUTES.DASHBOARD.HOME}>Dashboard</Link>
```

### Ejemplo 3: Redirección después del login
```typescript
import { getPostLoginRoute } from "@/shared/constants/routes.constants";

const redirectRoute = getPostLoginRoute(user.role);
navigate(redirectRoute);
```

## ✅ Verificación de Seguridad

Todas las rutas están protegidas correctamente:

- ✅ Rutas públicas con `PublicRoute` (login, register)
- ✅ Rutas del dashboard con `ProtectedRoute`
- ✅ Rutas de trabajador con `RoleProtectedRoute`
- ✅ Todas las navegaciones usan constantes (no strings hardcodeados)
- ✅ Guards redirigen correctamente según el estado de autenticación

## 🔄 Flujo de Redirección

### Usuario no autenticado
1. Intenta acceder a `/dashboard` → Redirige a `/login`
2. Intenta acceder a `/create-basic-service` → Redirige a `/login`
3. Accede a `/login` → Muestra formulario

### Usuario autenticado (rol: usuario)
1. Intenta acceder a `/login` → Redirige a `/dashboard`
2. Intenta acceder a `/create-basic-service` → Redirige a `/dashboard` (no tiene rol)
3. Accede a `/dashboard` → Muestra dashboard

### Usuario autenticado (rol: trabajador)
1. Intenta acceder a `/login` → Redirige a `/dashboard`
2. Accede a `/create-basic-service` → Muestra formulario
3. Accede a `/dashboard` → Muestra dashboard

## 📌 Reglas de Uso

1. **NUNCA** uses strings hardcodeados para rutas
2. **SIEMPRE** importa `ROUTES` desde `@/shared/constants/routes.constants`
3. **USA** `buildRoute` para rutas dinámicas (con parámetros)
4. **USA** `getPostLoginRoute()` para redirección después del login
5. **VERIFICA** que las rutas estén protegidas con los guards apropiados

## 🔧 Mantenimiento

Si necesitas agregar una nueva ruta:

1. Agrega la constante en `routes.constants.ts`
2. Agrega la ruta en `AppRouter.tsx` con el guard apropiado
3. Actualiza esta documentación
