# 🏗️ Arquitectura Hexagonal con UI - Estructura Recomendada 2025

## 📐 Estructura Completa de Carpetas

```
src/
├── modules/
│   └── User/
│       ├── 📋 Domain/                    # Núcleo - Lógica de negocio
│       │   ├── User.ts
│       │   ├── UserRepository.ts        # Puerto (interfaz)
│       │   ├── UserId.ts
│       │   ├── UserEmail.ts
│       │   ├── UserName.ts
│       │   └── UserNotFoundError.ts
│       │
│       ├── 🎯 Application/               # Casos de uso
│       │   ├── UserCreate/
│       │   ├── UserEdit/
│       │   ├── UserDelete/
│       │   ├── UserGetAll/
│       │   └── UserGetOneById/
│       │
│       └── 🔌 infrastructure/            # Adaptadores
│           ├── api/                      # Adaptadores de API (Backend)
│           │   └── ExpressUserController.ts
│           │
│           ├── persistence/              # Adaptadores de persistencia
│           │   ├── PostgresUserRepository.ts
│           │   └── inMemoryUserRepository.ts
│           │
│           └── ui/                       # 🎨 Adaptadores de UI (Frontend)
│               ├── components/           # Componentes específicos del módulo
│               │   ├── UserForm.tsx
│               │   ├── UserList.tsx
│               │   └── UserCard.tsx
│               │
│               ├── pages/                # Páginas/Vistas
│               │   ├── RegisterPage.tsx
│               │   ├── LoginPage.tsx
│               │   └── UserProfilePage.tsx
│               │
│               ├── hooks/                # Custom hooks
│               │   ├── useUserCreate.ts
│               │   ├── useUserList.ts
│               │   └── useUserRegister.ts
│               │
│               └── services/             # Servicios de UI (API calls)
│                   └── userApiService.ts
│
├── shared/                               # Código compartido
│   ├── ui/                               # Componentes UI compartidos
│   │   └── components/                   # shadcn/ui components aquí
│   │       ├── button/
│   │       ├── input/
│   │       ├── form/
│   │       ├── card/
│   │       └── ...
│   │
│   ├── infrastructure/
│   │   └── ServiceContainer.ts
│   │
│   └── lib/                              # Utilidades compartidas
│       ├── utils.ts
│       └── api-client.ts
│
└── App.tsx                               # Punto de entrada principal
```

## 🎨 Estructura para shadcn/ui

```
src/
└── shared/
    └── ui/
        └── components/                   # Componentes de shadcn/ui
            ├── ui/                       # Componentes base de shadcn
            │   ├── button.tsx
            │   ├── input.tsx
            │   ├── form.tsx
            │   ├── card.tsx
            │   ├── label.tsx
            │   └── ...
            │
            └── lib/                      # Utilidades de shadcn
                └── utils.ts              # cn() function
```

## 🔄 Flujo de Registro (Ejemplo Completo)

```
1. Usuario llena formulario
   ↓
2. RegisterPage.tsx (infrastructure/ui/pages)
   ↓
3. useUserRegister.ts (infrastructure/ui/hooks)
   ↓
4. userApiService.ts (infrastructure/ui/services)
   ↓
5. HTTP Request → ExpressUserController (infrastructure/api)
   ↓
6. UserCreate.run() (Application)
   ↓
7. UserRepository.create() (Domain - interfaz)
   ↓
8. PostgresUserRepository.create() (infrastructure/persistence)
   ↓
9. PostgreSQL
```

## 📝 Convenciones 2025

1. **UI va en `infrastructure/ui/`** - Es un adaptador más
2. **shadcn/ui en `shared/ui/components/ui/`** - Componentes reutilizables
3. **Hooks personalizados en `infrastructure/ui/hooks/`** - Lógica de UI
4. **Servicios API en `infrastructure/ui/services/`** - Comunicación con backend
5. **Páginas en `infrastructure/ui/pages/`** - Vistas completas

