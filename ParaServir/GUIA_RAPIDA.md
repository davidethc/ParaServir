# 🚀 Guía Rápida - Arquitectura Hexagonal con UI

## 📐 Estructura Final

```
src/
├── modules/User/
│   ├── Domain/              # 📋 Núcleo (NO depende de nada)
│   ├── Application/         # 🎯 Casos de uso
│   └── infrastructure/
│       ├── api/             # 🔌 Backend API (Express)
│       ├── persistence/     # 💾 Base de datos (Postgres/Memory)
│       └── ui/              # 🎨 Frontend (React)
│           ├── components/ # Componentes específicos
│           ├── pages/       # Páginas/Vistas
│           ├── hooks/       # Custom hooks
│           └── services/    # Servicios API
│
└── shared/
    ├── infrastructure/      # ServiceContainer
    └── lib/                 # Utilidades (utils, api-client)
```

## ✅ Ejemplo de Registro Implementado

### Archivos creados:

1. **RegisterPage.tsx** - Página completa de registro
2. **RegisterForm.tsx** - Formulario reutilizable
3. **useUserRegister.ts** - Hook para lógica de registro
4. **userApiService.ts** - Servicio para llamadas API
5. **api-client.ts** - Cliente HTTP centralizado

### Flujo:

```
RegisterPage → RegisterForm → useUserRegister → userApiService 
  → Backend API → UserCreate → Repository → BD
```

## 🎨 Para agregar shadcn/ui

```bash
# 1. Inicializar
npx shadcn@latest init

# 2. Agregar componentes
npx shadcn@latest add button input card form label

# 3. Los componentes se instalan en:
# src/shared/ui/components/ui/
```

## 🚀 Comandos

```bash
# Backend
npm run dev:server

# Frontend
npm run dev
```

## 📝 Convenciones

- **Domain**: Solo lógica de negocio
- **Application**: Casos de uso
- **Infrastructure**: Adaptadores (api, persistence, ui)
- **UI es un adaptador más**: Va en `infrastructure/ui/`
- **shadcn/ui**: En `shared/ui/components/ui/`

## 🎯 Próximos pasos

1. ✅ Estructura creada
2. ✅ Ejemplo de registro implementado
3. ⏭️ Instalar shadcn/ui
4. ⏭️ Mejorar estilos del formulario
5. ⏭️ Agregar más páginas (Login, Profile, etc.)

