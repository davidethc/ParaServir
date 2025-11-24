# 🏗️ Arquitectura Hexagonal con React Router y Redux

## 📐 Estructura Modular Implementada

```
src/
├── modules/
│   └── User/
│       └── infrastructure/
│           ├── store/                    # 🆕 Redux Slice del módulo User
│           │   └── userSlice.ts
│           │
│           └── ui/
│               ├── components/
│               │   ├── LoginForm.tsx     # 🆕 Formulario de login
│               │   └── RegisterForm.tsx
│               ├── hooks/
│               │   ├── useUserLogin.ts   # 🆕 Hook de login con Redux
│               │   └── useUserRegister.ts
│               ├── pages/
│               │   ├── LoginPage.tsx     # 🆕 Página de login
│               │   └── RegisterPage.tsx
│               └── services/
│                   └── userApiService.ts # Actualizado con login
│
└── shared/
    └── infrastructure/
        ├── routing/                      # 🆕 Configuración de rutas
        │   └── AppRoutes.tsx
        └── store/                        # 🆕 Redux Store centralizado
            ├── store.ts
            └── hooks.ts
```

## 🔄 Flujo Completo: Login con Redux

```
1. Usuario llena LoginForm
   ↓
2. useUserLogin hook
   ↓
3. userApiService.login() → POST /api/users/login
   ↓
4. Backend valida y responde
   ↓
5. dispatch(setUser()) → Redux guarda usuario
   ↓
6. navigate("/dashboard") → Redirige
```

## 📦 Redux Store Modular

### Estructura del Store:

```typescript
store/
├── store.ts              # Store principal
└── hooks.ts              # Hooks tipados
```

### User Slice:

```typescript
// modules/User/infrastructure/store/userSlice.ts
- Estado: { user, isAuthenticated, isLoading, error }
- Acciones: setUser, clearUser, setLoading, setError
```

## 🛣️ React Router Modular

### Rutas Configuradas:

```typescript
/                    → Redirige a /login
/login              → LoginPage (pública)
/register           → RegisterPage (pública)
/dashboard          → Protegida (futuro)
```

### Rutas Protegidas:

```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 💡 Ventajas de esta Arquitectura

### ✅ Modularidad
- Cada módulo tiene su propio slice de Redux
- Rutas organizadas por módulo
- Fácil de escalar

### ✅ Separación de Responsabilidades
- **Store**: Estado global (Redux)
- **Routing**: Navegación (React Router)
- **UI**: Componentes y páginas
- **Services**: Llamadas API

### ✅ Testeable
- Puedes testear cada parte por separado
- Redux store es independiente
- Rutas son configurables

### ✅ Escalable
- Agregar nuevo módulo = Agregar slice + rutas
- No afecta otros módulos

## 🎯 Cómo Agregar un Nuevo Módulo

### 1. Crear Redux Slice
```typescript
// modules/Product/infrastructure/store/productSlice.ts
export const productSlice = createSlice({...});
```

### 2. Agregar al Store
```typescript
// shared/infrastructure/store/store.ts
import productReducer from "../../../modules/Product/infrastructure/store/productSlice";

reducer: {
  user: userReducer,
  product: productReducer, // 🆕
}
```

### 3. Agregar Rutas
```typescript
// shared/infrastructure/routing/AppRoutes.tsx
<Route path="/products" element={<ProductsPage />} />
```

## 📝 Ejemplo de Uso

### En un Componente:

```typescript
import { useAppSelector, useAppDispatch } from "@/shared/infrastructure/store/hooks";
import { clearUser } from "../../store/userSlice";

function MyComponent() {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  
  const handleLogout = () => {
    dispatch(clearUser());
  };
  
  return <div>Hola {user?.name}</div>;
}
```

## 🚀 Próximos Pasos

1. ✅ Redux configurado
2. ✅ React Router configurado
3. ✅ Login implementado
4. ⏭️ Crear DashboardPage
5. ⏭️ Agregar más rutas protegidas
6. ⏭️ Persistir estado en localStorage

¡Tu arquitectura está lista para escalar! 🎉

