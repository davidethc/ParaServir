# 📋 Flujo Completo de Perfil - Documentación

## 🎯 Resumen

Este documento describe el flujo completo de edición de perfil para **Cliente** y **Trabajador**, tanto en frontend como backend.

---

## 🔐 SEGURIDAD IMPLEMENTADA

### Backend (`PUT /users/edit/:id`)
✅ **Validación de propiedad**: Solo puedes editar tu propio perfil (`req.user.id === req.params.id`)
✅ **Protección de role**: No se permite cambiar el `role` (solo admins pueden hacerlo)
✅ **Autenticación requerida**: Todas las rutas requieren token válido

### Frontend
✅ **Validación de formularios**: Zod schema valida todos los campos
✅ **Separación de roles**: Cliente solo ve/edita perfil personal, Trabajador ve/edita ambos

---

## 👤 FLUJO PARA CLIENTE (Usuario)

### 1. Acceso al Perfil
- **Ruta**: `/dashboard/settings`
- **Componente**: `DashboardSettingsPage`
- **Navegación**: Sidebar → "Configuración" (ícono Settings)

### 2. Qué Puede Ver/Editar
- ✅ **Perfil Personal**:
  - Nombre (first_name)
  - Apellido (last_name)
  - Email
  - Teléfono
  - Ubicación
  - Cédula
- ❌ **Perfil Profesional**: No tiene acceso (solo trabajadores)

### 3. Proceso de Edición
1. Usuario hace clic en "Editar Perfil Personal"
2. Se muestra `EditUserForm` con datos pre-cargados
3. Usuario modifica campos
4. Hace clic en "Guardar Cambios"
5. Se envía `PUT /users/edit/:id` con solo campos personales
6. Backend valida que `req.user.id === req.params.id`
7. Backend actualiza solo `users` y `profiles` (NO cambia role)
8. Frontend recarga datos con `refetch()`
9. Se muestra mensaje de éxito
10. Formulario se cierra automáticamente

### 4. Endpoints Usados
- `GET /users/me` - Obtener perfil actual
- `PUT /users/edit/:id` - Actualizar perfil personal

---

## 👷 FLUJO PARA TRABAJADOR

### 1. Acceso al Perfil
- **Ruta**: `/dashboard/settings`
- **Componente**: `DashboardSettingsPage`
- **Navegación**: Sidebar → "Configuración" (ícono Settings)

### 2. Qué Puede Ver/Editar

#### A. Perfil Personal (Igual que Cliente)
- ✅ Nombre, Apellido, Email, Teléfono, Ubicación, Cédula
- **Endpoint**: `PUT /users/edit/:id`

#### B. Perfil Profesional
- ✅ Años de experiencia
- ✅ URL de certificación
- ✅ Servicios (máximo 3)
- **Endpoints**: 
  - `POST /workers/profile` - Actualizar perfil profesional
  - `POST /workers/services` - Crear servicios

### 3. Proceso de Edición

#### A. Editar Perfil Personal
1. Mismo proceso que Cliente (ver arriba)

#### B. Editar Perfil Profesional
1. Usuario hace clic en "Actualizar Perfil Profesional" o "Completar Perfil Profesional"
2. Navega a `/complete-worker-profile` (`CompleteWorkerProfileForm`)
3. Formulario carga datos existentes (si ya tiene perfil)
4. Usuario modifica:
   - Años de experiencia
   - URL de certificación
   - Servicios (agregar/editar hasta 3)
5. Hace clic en "Guardar"
6. Frontend envía:
   - Primero: `POST /workers/profile` (perfil profesional)
   - Luego: `POST /workers/services` (servicios)
7. Backend valida:
   - Usuario autenticado
   - Role = 'trabajador'
   - Máximo 3 servicios
8. Frontend recarga datos con `refetchUser()`
9. Redirige a `/dashboard/services`

---

## 🔄 FLUJOS DETALLADOS

### Flujo: Cliente Edita Perfil Personal

```
Usuario → Dashboard → Settings
  ↓
Ve: UserProfileCard (solo lectura)
  ↓
Clic: "Editar Perfil Personal"
  ↓
Ve: EditUserForm (modo edición)
  ↓
Modifica campos
  ↓
Clic: "Guardar Cambios"
  ↓
Frontend: PUT /users/edit/:id
  ↓
Backend: Valida req.user.id === req.params.id
  ↓
Backend: Actualiza users + profiles (SIN cambiar role)
  ↓
Backend: Retorna user actualizado
  ↓
Frontend: refetch() → Actualiza UI
  ↓
Muestra: "Perfil actualizado correctamente"
  ↓
Formulario se cierra → Vuelve a modo lectura
```

### Flujo: Trabajador Edita Perfil Personal

```
Trabajador → Dashboard → Settings
  ↓
Ve: UserProfileCard + Perfil Profesional (solo lectura)
  ↓
Clic: "Editar Perfil Personal"
  ↓
[Mismo proceso que Cliente]
```

### Flujo: Trabajador Edita Perfil Profesional

```
Trabajador → Dashboard → Settings
  ↓
Ve: Card "Perfil Profesional"
  ↓
Clic: "Actualizar Perfil Profesional"
  ↓
Navega: /complete-worker-profile
  ↓
Ve: CompleteWorkerProfileForm
  ↓
Formulario carga datos existentes (si aplica)
  ↓
Modifica: años experiencia, certificación, servicios
  ↓
Clic: "Guardar"
  ↓
Frontend: POST /workers/profile (perfil)
  ↓
Frontend: POST /workers/services (servicios)
  ↓
Backend: Valida role = 'trabajador'
  ↓
Backend: Actualiza worker_profiles + worker_services
  ↓
Frontend: refetchUser()
  ↓
Navega: /dashboard/services
```

---

## 🛡️ VALIDACIONES

### Frontend (EditUserForm)
- ✅ Nombre: mínimo 2 caracteres
- ✅ Apellido: mínimo 2 caracteres
- ✅ Email: formato válido
- ✅ Teléfono: mínimo 10 caracteres
- ✅ Cédula: mínimo 10 caracteres (opcional)
- ✅ Ubicación: opcional

### Backend (PUT /users/edit/:id)
- ✅ Usuario autenticado
- ✅ `req.user.id === req.params.id` (solo edita su propio perfil)
- ✅ Role NO se puede cambiar
- ✅ Email válido
- ✅ Campos requeridos presentes

### Backend (POST /workers/profile)
- ✅ Usuario autenticado
- ✅ Role = 'trabajador'
- ✅ Años experiencia: número válido
- ✅ Certificación URL: opcional, formato válido

### Backend (POST /workers/services)
- ✅ Usuario autenticado
- ✅ Role = 'trabajador'
- ✅ Máximo 3 servicios totales
- ✅ Cada servicio: category_id, title, description requeridos

---

## 📍 RUTAS Y NAVEGACIÓN

### Cliente
- `/dashboard/settings` → Ver y editar perfil personal

### Trabajador
- `/dashboard/settings` → Ver y editar perfil personal + ver perfil profesional
- `/complete-worker-profile` → Editar perfil profesional completo

---

## ✅ ESTADO ACTUAL

### ✅ Funcionando
- ✅ Cliente puede editar perfil personal
- ✅ Trabajador puede editar perfil personal
- ✅ Trabajador puede editar perfil profesional
- ✅ Validaciones frontend y backend
- ✅ Seguridad: solo edita su propio perfil
- ✅ Protección: no puede cambiar role
- ✅ Botón cancelar cierra modo edición
- ✅ Mensajes de éxito/error
- ✅ Recarga automática de datos después de guardar

### 🔧 Mejoras Implementadas
- ✅ Separación clara entre perfil personal y profesional
- ✅ Botón cancelar funcional
- ✅ Validación de seguridad en backend
- ✅ Endpoints correctos configurados
- ✅ Manejo de errores robusto

---

## 🚀 LISTO PARA PRODUCCIÓN

El sistema de perfiles está **100% funcional y seguro**:
- ✅ Seguridad implementada
- ✅ Validaciones completas
- ✅ Separación de roles correcta
- ✅ Flujos completos
- ✅ Manejo de errores
- ✅ UX pulida

