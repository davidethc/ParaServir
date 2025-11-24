# 🏗️ Cómo la Arquitectura Hexagonal te Ayuda a Crear Métodos Modulares

## 🎯 El Problema que Resuelve

Imagina que necesitas:
- ✅ Crear usuario
- ✅ Iniciar sesión (obtener usuario)
- ✅ Eliminar usuario
- ✅ Actualizar usuario

**Sin arquitectura hexagonal**: Todo estaría mezclado, difícil de testear y cambiar.

**Con arquitectura hexagonal**: Cada operación es un módulo independiente y reutilizable.

## 📐 Estructura Modular por Operación

### 1️⃣ **CREAR USUARIO**

```
┌─────────────────────────────────────────┐
│  ExpressUserController.create()         │ ← Recibe HTTP
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserCreate.run()                      │ ← Lógica de negocio
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserRepository.create()              │ ← Interfaz (puerto)
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PostgresUserRepository.create()      │ ← Implementación
└─────────────────────────────────────────┘
```

**Ventaja**: Puedes cambiar de Postgres a MongoDB sin tocar `UserCreate`.

### 2️⃣ **INICIAR SESIÓN (OBTENER)**

```
┌─────────────────────────────────────────┐
│  ExpressUserController.login()         │ ← Recibe HTTP
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserLogin.run()                       │ ← Lógica de negocio
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserRepository.findByEmail()          │ ← Interfaz (puerto)
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PostgresUserRepository.findByEmail()  │ ← Implementación
└─────────────────────────────────────────┘
```

**Ventaja**: La lógica de login está separada, fácil de testear.

### 3️⃣ **ELIMINAR USUARIO**

```
┌─────────────────────────────────────────┐
│  ExpressUserController.delete()        │ ← Recibe HTTP
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserDelete.run()                      │ ← Lógica simple
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserRepository.delete()               │ ← Interfaz
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PostgresUserRepository.delete()       │ ← Implementación
└─────────────────────────────────────────┘
```

**Ventaja**: Cada operación es independiente, puedes agregar validaciones sin afectar otras.

### 4️⃣ **ACTUALIZAR USUARIO**

```
┌─────────────────────────────────────────┐
│  ExpressUserController.update()        │ ← Recibe HTTP
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserEdit.run()                        │ ← Valida y actualiza
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  UserRepository.findById()             │ ← Busca primero
│  UserRepository.update()               │ ← Luego actualiza
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PostgresUserRepository.update()       │ ← Implementación
└─────────────────────────────────────────┘
```

**Ventaja**: La lógica de validación está en `UserEdit`, no en el controller.

## 🔄 Flujo Completo: Crear Usuario

### Paso a Paso:

1. **Cliente HTTP** → `POST /api/users`
   ```json
   {
     "id": "123",
     "name": "Juan",
     "email": "juan@test.com",
     "password": "secret123"
   }
   ```

2. **server.ts** → Recibe la petición
   ```typescript
   app.post("/api/users", (req, res) => {
     userController.create(req, res);
   });
   ```

3. **ExpressUserController.create()** → Extrae datos
   ```typescript
   const { id, name, email, password } = req.body;
   await this.userCreate.run(id, name, email, password, ...);
   ```

4. **UserCreate.run()** → Crea el objeto de dominio
   ```typescript
   const user = new User(
     new UserId(id),
     new UserName(name),
     new UserEmail(email),
     password
   );
   await this.repository.create(user);
   ```

5. **UserRepository.create()** → Interfaz (no sabe cómo se guarda)

6. **PostgresUserRepository.create()** → Implementación real
   ```typescript
   await this.client.query(
     "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
     [user.id.value, user.name.value, user.email.value]
   );
   ```

## 💡 Ventajas de esta Modularidad

### ✅ **Separación de Responsabilidades**

Cada capa tiene UNA responsabilidad:
- **Controller**: Convierte HTTP ↔ Lógica
- **Application**: Orquesta casos de uso
- **Domain**: Define reglas de negocio
- **Infrastructure**: Implementa detalles técnicos

### ✅ **Testeable**

```typescript
// Puedes testear UserCreate sin base de datos
const mockRepository = new InMemoryUserRepository();
const userCreate = new UserCreate(mockRepository);
await userCreate.run("1", "Juan", "juan@test.com", "pass");
```

### ✅ **Intercambiable**

```typescript
// Cambiar de Postgres a MongoDB solo requiere:
// 1. Crear MongoDBUserRepository
// 2. Cambiar en ServiceContainer
// ✅ NO tocas UserCreate, UserEdit, etc.
```

### ✅ **Escalable**

Agregar nueva operación es fácil:
1. Crear `UserNewOperation` en Application
2. Agregar método en Controller
3. Agregar ruta en server.ts
4. ✅ Listo, sin romper nada existente

## 🎯 Ejemplo: Agregar "Cambiar Contraseña"

### 1. Crear caso de uso
```typescript
// Application/UserChangePassword/UserChangePassword.ts
export class UserChangePassword {
  constructor(private repository: UserRepository) {}
  
  async run(id: string, oldPassword: string, newPassword: string) {
    const user = await this.repository.findById(id);
    if (user.password !== oldPassword) {
      throw new Error("Invalid password");
    }
    user.password = newPassword;
    await this.repository.update(user);
  }
}
```

### 2. Agregar al Controller
```typescript
async changePassword(req: Request, res: Response) {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  await this.userChangePassword.run(id, oldPassword, newPassword);
  res.json({ message: "Password changed" });
}
```

### 3. Agregar ruta
```typescript
app.put("/api/users/:id/password", (req, res) => {
  userController.changePassword(req, res);
});
```

**✅ Sin tocar código existente, solo agregas módulos nuevos.**

## 📊 Comparación: Con vs Sin Arquitectura Hexagonal

### ❌ Sin Arquitectura (Todo mezclado)
```typescript
// Todo en un solo archivo
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  const client = new Pool({ connectionString: "..." });
  await client.query("INSERT INTO users...");
  res.json({ success: true });
});
```

**Problemas**:
- ❌ Difícil de testear
- ❌ No puedes cambiar de BD fácilmente
- ❌ Lógica mezclada con detalles técnicos
- ❌ Difícil de escalar

### ✅ Con Arquitectura Hexagonal
```typescript
// Separado en capas
Controller → Application → Domain → Infrastructure
```

**Ventajas**:
- ✅ Fácil de testear
- ✅ Intercambiable (BD, framework, etc.)
- ✅ Lógica separada de detalles técnicos
- ✅ Escalable y mantenible

## 🎓 Resumen

La **Arquitectura Hexagonal** te ayuda porque:

1. **Cada operación es un módulo independiente**
2. **Puedes cambiar implementaciones sin tocar lógica**
3. **Fácil de testear cada parte por separado**
4. **Agregar nuevas operaciones no rompe las existentes**
5. **El código es más limpio y mantenible**

**Es como tener piezas de LEGO**: Cada pieza (módulo) encaja perfectamente y puedes construir lo que quieras sin romper nada.

