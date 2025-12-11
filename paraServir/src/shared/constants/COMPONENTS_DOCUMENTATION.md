# 📚 Documentación de Componentes Compartidos

## 🎯 Objetivo
Sistema unificado de componentes reutilizables para mantener consistencia en diseño, código y buenas prácticas en toda la aplicación.

---

## 📦 Componentes de Layout

### `PageContainer`
**Ubicación:** `/shared/components/layout/PageContainer.tsx`

**Propósito:** Contenedor base unificado para todas las páginas.

**Props:**
- `children`: Contenido de la página
- `className?`: Clases CSS adicionales
- `maxWidth?`: Tamaño máximo ("sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "full")

**Uso:**
```tsx
<PageContainer maxWidth="6xl">
  {/* Contenido */}
</PageContainer>
```

**Beneficios:**
- ✅ Padding consistente (`p-6`)
- ✅ Max-width unificado
- ✅ Background consistente
- ✅ Fácil de mantener

---

### `PageHeader`
**Ubicación:** `/shared/components/layout/PageHeader.tsx`

**Propósito:** Header unificado para páginas con título, descripción y acción opcional.

**Props:**
- `title`: Título de la página
- `description?`: Descripción opcional
- `action?`: Botón o elemento de acción (opcional)
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<PageHeader
  title="Mis Solicitudes"
  description="Gestiona tus solicitudes de servicios"
  action={<Button>Nueva Solicitud</Button>}
/>
```

**Beneficios:**
- ✅ Diseño consistente
- ✅ Espaciado uniforme
- ✅ Tipografía unificada

---

## 🎨 Componentes de Feedback

### `LoadingState`
**Ubicación:** `/shared/components/feedback/LoadingState.tsx`

**Propósito:** Estado de carga unificado con skeletons.

**Props:**
- `count?`: Número de elementos skeleton (default: 6)
- `variant?`: Tipo ("card" | "list" | "grid")
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<LoadingState count={6} variant="card" />
```

**Variantes:**
- `card`: Grid de cards con skeleton
- `list`: Lista vertical de skeletons
- `grid`: Grid de 2 columnas

---

### `EmptyState`
**Ubicación:** `/shared/components/feedback/EmptyState.tsx`

**Propósito:** Estado vacío unificado para cuando no hay datos.

**Props:**
- `title?`: Título (default: "No hay elementos disponibles")
- `description?`: Descripción opcional
- `icon?`: Icono opcional (ReactNode)
- `action?`: Botón de acción opcional
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<EmptyState
  title="No hay trabajadores disponibles"
  description="No hay trabajadores ofreciendo servicios en esta categoría"
  action={{
    label: "Volver",
    onClick: () => navigate('/dashboard')
  }}
/>
```

---

## 🃏 Componentes de Cards

### `WorkerCard`
**Ubicación:** `/shared/components/cards/WorkerCard.tsx`

**Propósito:** Card unificado para mostrar información de trabajadores.

**Props:**
- `workerId`: ID del trabajador
- `firstName`: Nombre
- `lastName`: Apellido
- `avatarUrl?`: URL del avatar
- `location?`: Ubicación
- `yearsExperience?`: Años de experiencia
- `verificationStatus`: Estado de verificación
- `isActive`: Si está activo
- `servicesCount`: Cantidad de servicios
- `minPrice?`: Precio mínimo
- `maxPrice?`: Precio máximo
- `onClick?`: Callback al hacer clic
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<WorkerCard
  workerId={worker.worker_id}
  firstName={worker.first_name}
  lastName={worker.last_name}
  verificationStatus={worker.verification_status}
  servicesCount={worker.services_count}
  minPrice={worker.min_price}
  maxPrice={worker.max_price}
/>
```

---

### `ServiceCard`
**Ubicación:** `/shared/components/cards/ServiceCard.tsx`

**Propósito:** Card unificado para mostrar servicios.

**Props:**
- `id`: ID del servicio
- `title`: Título del servicio
- `description`: Descripción
- `basePrice?`: Precio base
- `isAvailable`: Si está disponible
- `workerName`: Nombre del trabajador
- `onClick?`: Callback al hacer clic
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<ServiceCard
  id={service.id}
  title={service.title}
  description={service.description}
  basePrice={service.base_price}
  isAvailable={service.is_available}
  workerName={service.worker_name}
/>
```

---

### `CategoryCard`
**Ubicación:** `/shared/components/cards/CategoryCard.tsx`

**Ya existente y unificado** - Muestra categorías de servicios.

---

## 🔍 Componentes de Formularios

### `SearchBar`
**Ubicación:** `/shared/components/forms/SearchBar.tsx`

**Propósito:** Barra de búsqueda unificada y reutilizable.

**Props:**
- `searchPlaceholder?`: Placeholder del input
- `categoryPlaceholder?`: Placeholder del selector
- `categories?`: Array de opciones de categorías
- `loadingCategories?`: Estado de carga
- `popularSearches?`: Array de búsquedas populares
- `onSearch`: Callback cuando se busca
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<SearchBar
  categories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
  loadingCategories={loadingCategories}
  popularSearches={["Diseñador Gráfico", "UI/UX"]}
  onSearch={(query, categoryId) => {
    if (categoryId) {
      navigate(buildRoute.categoryDetail(categoryId));
    }
  }}
/>
```

---

## 🧭 Componentes de Navegación

### `BackButton`
**Ubicación:** `/shared/components/navigation/BackButton.tsx`

**Propósito:** Botón de navegación hacia atrás unificado.

**Props:**
- `to?`: Ruta destino (default: ROUTES.DASHBOARD.HOME)
- `label?`: Texto del botón (default: "Volver")
- `className?`: Clases CSS adicionales

**Uso:**
```tsx
<BackButton to={ROUTES.DASHBOARD.HOME} label="Volver al Dashboard" />
```

---

## 🔐 Servicios de Estado

### `AuthStorageService`
**Ubicación:** `/shared/services/auth-storage.service.ts`

**Propósito:** Servicio centralizado para manejo de autenticación en localStorage.

**Métodos:**
- `saveAuthData(data)`: Guarda todos los datos de auth
- `getToken()`: Obtiene el token
- `getUserId()`: Obtiene el ID del usuario
- `getUserEmail()`: Obtiene el email
- `getUserRole()`: Obtiene el rol
- `getAuthData()`: Obtiene todos los datos
- `hasAuthData()`: Verifica si hay datos válidos
- `clearAuthData()`: Limpia todos los datos
- `updateToken(token)`: Actualiza solo el token

**Uso:**
```tsx
// Guardar
AuthStorageService.saveAuthData({
  token: response.token,
  userId: response.user.id,
  userEmail: response.user.email,
  userRole: response.user.role,
});

// Obtener
const token = AuthStorageService.getToken();

// Limpiar
AuthStorageService.clearAuthData();
```

**Beneficios:**
- ✅ Un solo lugar para manejar localStorage de auth
- ✅ Evita duplicación de código
- ✅ Facilita mantenimiento
- ✅ Consistencia en toda la app

---

## 📋 Reglas de Uso

### ✅ HACER:
1. **SIEMPRE** usa `PageContainer` para páginas del Dashboard
2. **SIEMPRE** usa `PageHeader` para títulos y descripciones
3. **SIEMPRE** usa `EmptyState` para estados vacíos
4. **SIEMPRE** usa `LoadingState` para estados de carga
5. **SIEMPRE** usa `WorkerCard` y `ServiceCard` para mostrar datos
6. **SIEMPRE** usa `AuthStorageService` para localStorage de auth
7. **SIEMPRE** usa `SearchBar` para búsquedas
8. **SIEMPRE** usa `BackButton` para navegación hacia atrás

### ❌ NO HACER:
1. **NUNCA** uses `localStorage` directamente para auth (usa `AuthStorageService`)
2. **NUNCA** crees componentes de layout duplicados
3. **NUNCA** hardcodees estilos que ya están en componentes compartidos
4. **NUNCA** mezcles estilos inline con componentes compartidos
5. **NUNCA** crees cards personalizados si existe un componente compartido

---

## 🎨 Estilos Unificados

### Colores:
- **Primario:** `blue-600` / `blue-700`
- **Éxito:** `green-600`
- **Error:** `red-600`
- **Texto:** `gray-900` (títulos), `gray-600` (descripciones), `gray-500` (secundario)

### Espaciado:
- **Padding de página:** `p-6`
- **Gap entre elementos:** `gap-4` o `gap-6`
- **Margin bottom de secciones:** `mb-8`

### Tipografía:
- **Títulos principales:** `text-3xl font-bold`
- **Títulos de sección:** `text-2xl font-semibold`
- **Descripciones:** `text-gray-600`

---

## 📁 Estructura de Componentes

```
shared/
  components/
    cards/          # Cards reutilizables
      CategoryCard.tsx
      WorkerCard.tsx
      ServiceCard.tsx
    feedback/       # Estados de UI
      EmptyState.tsx
      LoadingState.tsx
    forms/          # Formularios reutilizables
      SearchBar.tsx
    layout/         # Componentes de layout
      PageContainer.tsx
      PageHeader.tsx
    navigation/     # Navegación
      BackButton.tsx
    sections/       # Secciones completas
      CategoriesSection.tsx
      CategoryGrid.tsx
    ui/             # Componentes base (shadcn/ui)
      button.tsx
      card.tsx
      ...
```

---

## ✅ Estado Actual

- ✅ Componentes de layout unificados
- ✅ Componentes de feedback unificados
- ✅ Cards reutilizables creados
- ✅ Servicio de autenticación centralizado
- ✅ Todas las páginas del Dashboard actualizadas
- ✅ Estilos consistentes
- ✅ Sin duplicación de código

---

## 🔄 Próximos Pasos (Opcional)

1. Crear más componentes compartidos según necesidad
2. Agregar Storybook para documentación visual
3. Crear tests para componentes compartidos
4. Optimizar rendimiento con React.memo donde sea necesario
