# 🔄 FLUJO COMPLETO: Cómo funciona todo

## 📊 Diagrama del flujo:

```
Cliente (Postman/Frontend)
    ↓
    HTTP Request (POST /api/users)
    ↓
┌─────────────────────────────────────┐
│  server.ts                         │
│  - Recibe la petición HTTP         │
│  - Llama al controller             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  ExpressUserController             │
│  - Extrae datos del request        │
│  - Llama a los casos de uso        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Application Layer                 │
│  (UserCreate, UserGetAll, etc.)    │
│  - Lógica de negocio               │
│  - Usa el Repository (interfaz)    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Repository (Interfaz)             │
│  - No sabe si es Postgres o Memory │
└─────────────────────────────────────┘
    ↓
    ┌──────────────┴──────────────┐
    ↓                             ↓
┌─────────────┐          ┌──────────────────┐
│ inMemory    │          │ Postgres         │
│ Repository  │          │ Repository       │
│ (Array)     │          │ (Base de datos)  │
└─────────────┘          └──────────────────┘
```

## 🎯 Ejemplo práctico:

### Cuando llega una petición POST /api/users:

1. **server.ts** recibe: `POST /api/users` con `{id: "1", name: "Juan", email: "juan@test.com", password: "123"}`

2. **server.ts** llama: `userController.create(req, res)`

3. **ExpressUserController.create()** hace:
   - Extrae: `id, name, email, password` del `req.body`
   - Llama: `this.userCreate.run(id, name, email, password)`

4. **UserCreate.run()** hace:
   - Crea un objeto `User` (objeto de dominio)
   - Llama: `this.repository.create(user)`
   - ⚠️ **NO SABE** si es Postgres o Memory, solo usa la interfaz

5. **Repository** (el que esté configurado):
   - Si es **inMemory**: guarda en el array `this.users.push(user)`
   - Si es **Postgres**: ejecuta `INSERT INTO users...`

6. **Response** vuelve por todas las capas hasta el cliente

## 🔄 ¿Cómo se decide qué Repository usar?

En **ServiceContainer.ts**:

```typescript
// Si existe DATABASE_URL → usa Postgres
// Si NO existe → usa Memory

if (process.env.DATABASE_URL) {
  this.userRepository = new PostgresUserRepository(databaseUrl);
} else {
  this.userRepository = new InMemoryUserRepository();
}
```

## 💡 Ventaja de esta arquitectura:

**Puedes cambiar de Postgres a Memory (o viceversa) SIN tocar:**
- ❌ El código del Controller
- ❌ Los casos de uso (UserCreate, UserGetAll, etc.)
- ❌ La lógica de negocio

**Solo cambias UNA línea en ServiceContainer** 🎉


