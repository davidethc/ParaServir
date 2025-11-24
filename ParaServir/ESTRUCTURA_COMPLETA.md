# 📁 Estructura Completa del Proyecto - Arquitectura Hexagonal 2025

## 🎯 Resumen de la Organización

Tu proyecto ahora sigue **Arquitectura Hexagonal** con UI integrada, siguiendo las mejores prácticas de 2025.

## 📂 Estructura de Carpetas

```
ParaServir/
├── src/
│   ├── modules/
│   │   └── User/
│   │       ├── 📋 Domain/                          # Núcleo - NO depende de nada
│   │       │   ├── User.ts
│   │       │   ├── UserRepository.ts               # Puerto (interfaz)
│   │       │   ├── UserId.ts
│   │       │   ├── UserName.ts
│   │       │   ├── UserEmail.ts
│   │       │   ├── UserCreatedAT.ts
│   │       │   └── UserNotFoundError.ts
│   │       │
│   │       ├── 🎯 Application/                     # Casos de uso
│   │       │   ├── UserCreate/UserCreate.ts
│   │       │   ├── UserEdit/UserEdit.ts
│   │       │   ├── UserDelete/UserDelete.ts
│   │       │   ├── UserGetAll/UserGetAll.ts
│   │       │   └── UserGetOneById/UserGetOneById.ts
│   │       │
│   │       └── 🔌 infrastructure/                 # Adaptadores
│   │           ├── api/                           # Backend API
│   │           │   └── ExpressUserController.ts
│   │           │
│   │           ├── persistence/                  # Base de datos
│   │           │   ├── PostgresUserRepository.ts
│   │           │   └── inMemoryUserRepository.ts
│   │           │
│   │           └── ui/                           # 🎨 Frontend UI
│   │               ├── components/
│   │               │   └── RegisterForm.tsx
│   │               ├── pages/
│   │               │   └── RegisterPage.tsx
│   │               ├── hooks/
│   │               │   └── useUserRegister.ts
│   │               └── services/
│   │                   └── userApiService.ts
│   │
│   ├── shared/                                    # Código compartido
│   │   ├── ui/
│   │   │   └── components/
│   │   │       └── ui/                           # shadcn/ui components aquí
│   │   │
│   │   ├── infrastructure/
│   │   │   └── ServiceContainer.ts
│   │   │
│   │   └── lib/                                  # Utilidades
│   │       ├── utils.ts                          # cn() function
│   │       └── api-client.ts                     # Cliente HTTP
│   │
│   ├── App.tsx                                    # Punto de entrada
│   └── main.tsx
│
├── server.ts                                       # Servidor Express
└── package.json
```

## 🔄 Flujo de Registro (Ejemplo Completo)

```
1. Usuario llena formulario en RegisterPage
   ↓
2. RegisterForm.tsx (infrastructure/ui/components)
   ↓
3. useUserRegister.ts (infrastructure/ui/hooks)
   ↓
4. userApiService.ts (infrastructure/ui/services)
   ↓
5. HTTP POST → http://localhost:3000/api/users
   ↓
6. ExpressUserController.create() (infrastructure/api)
   ↓
7. UserCreate.run() (Application)
   ↓
8. UserRepository.create() (Domain - interfaz)
   ↓
9. PostgresUserRepository.create() (infrastructure/persistence)
   ↓
10. PostgreSQL guarda el usuario
```

## 📝 Archivos Creados

### ✅ UI (Frontend)
- `src/modules/User/infrastructure/ui/pages/RegisterPage.tsx` - Página de registro
- `src/modules/User/infrastructure/ui/components/RegisterForm.tsx` - Formulario
- `src/modules/User/infrastructure/ui/hooks/useUserRegister.ts` - Hook personalizado
- `src/modules/User/infrastructure/ui/services/userApiService.ts` - Servicio API

### ✅ Shared
- `src/shared/lib/utils.ts` - Utilidades (cn function para shadcn)
- `src/shared/lib/api-client.ts` - Cliente HTTP centralizado

### ✅ Configuración
- `tsconfig.app.json` - Path aliases configurados (@/*)
- `vite.config.ts` - Resolve alias configurado

## 🎨 Para usar shadcn/ui

```bash
# 1. Inicializar shadcn/ui
npx shadcn@latest init

# 2. Agregar componentes
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add form
```

Los componentes se instalarán en: `src/shared/ui/components/ui/`

## 🚀 Cómo usar

### 1. Correr el backend
```bash
npm run dev:server
```

### 2. Correr el frontend
```bash
npm run dev
```

### 3. Acceder
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📚 Convenciones

1. **Domain**: Solo lógica de negocio, NO imports de infrastructure
2. **Application**: Orquesta casos de uso, usa interfaces del Domain
3. **Infrastructure**: Implementa adaptadores (API, BD, UI)
4. **UI va en infrastructure/ui/**: Es un adaptador más
5. **shadcn/ui en shared/ui/components/ui/**: Componentes reutilizables

## 🎯 Ventajas de esta estructura

✅ **Separación clara**: Cada capa tiene su responsabilidad  
✅ **Testeable**: Puedes mockear infrastructure fácilmente  
✅ **Escalable**: Agregas nuevos módulos siguiendo el mismo patrón  
✅ **Mantenible**: Cambios en UI no afectan Domain/Application  
✅ **Intercambiable**: Cambias de Postgres a MongoDB sin tocar lógica  

