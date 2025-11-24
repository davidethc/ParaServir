# 🏗️ Propuesta de Arquitectura Modular - ParaServir

## 🎯 Problema Identificado

Actualmente estamos **abusando del módulo User** mezclando responsabilidades:
- ❌ Autenticación (login, registro)
- ❌ Perfiles de usuario
- ❌ Perfiles de trabajador
- ❌ Servicios de trabajadores

## ✅ Solución: Separación por Dominios

Cada módulo debe tener **una responsabilidad clara** según las tablas de la BD.

---

## 📐 Estructura Modular Propuesta

```
src/modules/
├── Auth/                          # 🔐 Autenticación (users table)
│   ├── Domain/
│   │   ├── User.ts                # Solo: id, email, password, role, is_verified
│   │   ├── UserRepository.ts
│   │   └── ValueObjects...
│   ├── Application/
│   │   ├── UserRegister/
│   │   ├── UserLogin/
│   │   ├── ForgotPassword/
│   │   ├── VerifyCode/
│   │   └── SetPassword/
│   └── infrastructure/
│       ├── api/
│       ├── persistence/
│       └── ui/
│           ├── pages/
│           │   ├── LoginPage.tsx
│           │   ├── RegisterPage.tsx
│           │   ├── ForgotPasswordPage.tsx
│           │   ├── VerifyCodePage.tsx
│           │   └── SetPasswordPage.tsx
│           └── components/
│
├── Profile/                       # 👤 Perfil General (profiles table)
│   ├── Domain/
│   │   ├── Profile.ts             # full_name, phone, avatar_url, bio, location
│   │   ├── ProfileRepository.ts
│   │   └── ValueObjects...
│   ├── Application/
│   │   ├── ProfileCreate/
│   │   ├── ProfileUpdate/
│   │   └── ProfileGetByUserId/
│   └── infrastructure/
│       ├── api/
│       ├── persistence/
│       └── ui/
│           ├── pages/
│           │   └── ProfilePage.tsx
│           └── components/
│
├── Worker/                        # 👷 Trabajador (worker_profiles + worker_services)
│   ├── Domain/
│   │   ├── WorkerProfile.ts        # service_description, years_experience, certification_url, verification_status
│   │   ├── WorkerService.ts        # title, description, base_price, category_id
│   │   ├── WorkerRepository.ts
│   │   └── ValueObjects...
│   ├── Application/
│   │   ├── WorkerRegister/        # Registro como trabajador
│   │   ├── WorkerProfileCreate/
│   │   ├── WorkerProfileUpdate/
│   │   ├── WorkerServiceCreate/
│   │   └── WorkerServiceUpdate/
│   └── infrastructure/
│       ├── api/
│       ├── persistence/
│       └── ui/
│           ├── pages/
│           │   ├── WorkerRegisterPage.tsx
│           │   ├── WorkerProfilePage.tsx
│           │   └── WorkerServicesPage.tsx
│           └── components/
│
├── Service/                       # 🛠️ Servicios y Solicitudes
│   ├── Domain/
│   │   ├── ServiceCategory.ts     # name, description, icon
│   │   ├── ServiceRequest.ts      # description, status, address, scheduled_date
│   │   ├── ServiceRepository.ts
│   │   └── ValueObjects...
│   ├── Application/
│   │   ├── ServiceCategoryGetAll/
│   │   ├── ServiceRequestCreate/
│   │   ├── ServiceRequestUpdate/
│   │   └── ServiceRequestGetAll/
│   └── infrastructure/
│       ├── api/
│       ├── persistence/
│       └── ui/
│           ├── pages/
│           │   ├── ServiceCategoriesPage.tsx
│           │   └── ServiceRequestsPage.tsx
│           └── components/
│
├── Review/                        # ⭐ Reseñas (reviews table)
│   ├── Domain/
│   │   ├── Review.ts               # rating, comment
│   │   ├── ReviewRepository.ts
│   │   └── ValueObjects...
│   ├── Application/
│   │   ├── ReviewCreate/
│   │   └── ReviewGetByRequestId/
│   └── infrastructure/
│       ├── api/
│       ├── persistence/
│       └── ui/
│
├── Message/                       # 💬 Mensajería (messages table)
│   ├── Domain/
│   │   ├── Message.ts              # content
│   │   ├── MessageRepository.ts
│   │   └── ValueObjects...
│   ├── Application/
│   │   ├── MessageCreate/
│   │   └── MessageGetByRequestId/
│   └── infrastructure/
│       ├── api/
│       ├── persistence/
│       └── ui/
│
└── Admin/                         # 👨‍💼 Administración (admin_actions table)
    ├── Domain/
    │   ├── AdminAction.ts          # action, details
    │   ├── AdminRepository.ts
    │   └── ValueObjects...
    ├── Application/
    │   └── AdminActionLog/
    └── infrastructure/
        ├── api/
        ├── persistence/
        └── ui/
```

---

## 🔄 Flujo de Registro como Trabajador

```
1. Usuario se registra → Auth/UserRegister
   ↓
2. Crea perfil general → Profile/ProfileCreate
   ↓
3. Se registra como trabajador → Worker/WorkerRegister
   ↓
4. Completa perfil de trabajador → Worker/WorkerProfileCreate
   ↓
5. Agrega servicios → Worker/WorkerServiceCreate
```

---

## 📊 Mapeo Tabla → Módulo

| Tabla BD | Módulo | Responsabilidad |
|----------|--------|----------------|
| `users` | **Auth** | Autenticación básica |
| `profiles` | **Profile** | Perfil general del usuario |
| `worker_profiles` | **Worker** | Perfil específico de trabajador |
| `worker_services` | **Worker** | Servicios que ofrece el trabajador |
| `service_categories` | **Service** | Categorías de servicios |
| `service_requests` | **Service** | Solicitudes de servicio |
| `reviews` | **Review** | Reseñas y calificaciones |
| `messages` | **Message** | Mensajería entre cliente/trabajador |
| `admin_actions` | **Admin** | Log de acciones administrativas |

---

## ✅ Ventajas de esta Estructura

### 1. **Separación de Responsabilidades**
- Cada módulo tiene **una sola responsabilidad**
- Fácil de entender y mantener

### 2. **Escalabilidad**
- Agregar nuevas funcionalidades = Nuevo módulo
- No afecta otros módulos

### 3. **Testeable**
- Cada módulo se testea independientemente
- Mocks más simples

### 4. **Reutilizable**
- `Auth` puede usarse en otros proyectos
- `Worker` puede evolucionar sin afectar `Auth`

### 5. **Alineado con BD**
- Cada módulo mapea claramente a tablas específicas
- Fácil de entender la relación código-BD

---

## 🚀 Plan de Migración

### Fase 1: Separar Auth
1. Crear módulo `Auth/` con solo autenticación
2. Mover login, registro, recuperación de contraseña
3. Mantener `User` solo para datos básicos (email, password, role)

### Fase 2: Crear Profile
1. Crear módulo `Profile/` para perfiles generales
2. Mover lógica de perfiles desde User

### Fase 3: Crear Worker
1. Crear módulo `Worker/` para trabajadores
2. Implementar registro como trabajador
3. Implementar gestión de servicios

### Fase 4: Crear Service, Review, Message, Admin
1. Crear módulos restantes según necesidad
2. Implementar funcionalidades básicas

---

## 💡 Ejemplo: Registro como Trabajador

### Antes (Todo en User):
```typescript
// ❌ User module haciendo demasiado
UserRegister → crea usuario
UserRegister → crea perfil
UserRegister → crea worker_profile
UserRegister → crea worker_services
```

### Después (Separado):
```typescript
// ✅ Cada módulo hace su parte
Auth/UserRegister → crea usuario básico
Profile/ProfileCreate → crea perfil general
Worker/WorkerRegister → crea worker_profile
Worker/WorkerServiceCreate → crea servicios
```

---

## 🎯 Recomendación

**Empezar con:**
1. ✅ **Auth** - Separar autenticación (ya está parcialmente hecho)
2. ✅ **Profile** - Crear módulo de perfiles
3. ✅ **Worker** - Crear módulo de trabajadores

Los demás módulos (Service, Review, Message, Admin) se pueden crear cuando se necesiten.

