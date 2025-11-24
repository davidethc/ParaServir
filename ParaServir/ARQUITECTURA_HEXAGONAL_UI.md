# 🎨 Arquitectura Hexagonal en la UI - Flujo Completo

## 🔄 Flujo Completo: Registro de Usuario desde la UI

### Visualización del Flujo:

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 UI LAYER (Frontend - React)                             │
│                                                              │
│  1. RegisterForm.tsx                                        │
│     - Usuario llena formulario                              │
│     - Hace clic en "Registrarse"                            │
│     ↓                                                        │
│  2. useUserRegister() hook                                  │
│     - Maneja estado (loading, error, success)               │
│     - Llama al servicio API                                 │
│     ↓                                                        │
│  3. userApiService.createUser()                             │
│     - Hace HTTP POST a /api/users                           │
│     - Usa apiClient (cliente HTTP centralizado)            │
└─────────────────────────────────────────────────────────────┘
                        ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│  🔌 INFRASTRUCTURE LAYER (Backend API)                      │
│                                                              │
│  4. server.ts                                               │
│     - Recibe POST /api/users                                │
│     - Llama a ExpressUserController                         │
│     ↓                                                        │
│  5. ExpressUserController.create()                         │
│     - Extrae datos del req.body                             │
│     - Valida campos requeridos                              │
│     - Llama al caso de uso                                  │
│     ↓                                                        │
│  6. UserCreate.run() (Application Layer)                   │
│     - Crea objeto User con Value Objects                    │
│     - Llama al repositorio                                 │
│     ↓                                                        │
│  7. UserRepository.create() (Domain - Interfaz)           │
│     - Define el contrato (no implementa)                   │
│     ↓                                                        │
│  8. PostgresUserRepository.create() (Infrastructure)       │
│     - Implementación real: INSERT INTO users...             │
│     - Guarda en PostgreSQL                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓ HTTP Response
┌─────────────────────────────────────────────────────────────┐
│  🎨 UI LAYER (Frontend - React)                             │
│                                                              │
│  9. useUserRegister recibe respuesta                       │
│     - Actualiza estado success = true                       │
│     - Muestra mensaje de éxito                              │
│     ↓                                                        │
│  10. RegisterForm muestra mensaje                          │
│      "¡Usuario registrado exitosamente!"                   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos en la UI

```
src/modules/User/infrastructure/ui/
├── components/
│   └── RegisterForm.tsx          ← 🎨 Componente visual
│       └── Usa: useUserRegister()
│
├── hooks/
│   └── useUserRegister.ts        ← 🔄 Lógica de estado
│       └── Usa: userApiService
│
├── services/
│   └── userApiService.ts         ← 🌐 Comunicación HTTP
│       └── Usa: apiClient
│
└── pages/
    └── RegisterPage.tsx          ← 📄 Página completa
        └── Usa: RegisterForm
```

## 💡 Cómo la Arquitectura Hexagonal Ayuda en la UI

### ✅ 1. Separación de Responsabilidades

Cada capa tiene UNA responsabilidad:

```typescript
// 🎨 RegisterForm.tsx - Solo UI
export function RegisterForm() {
  const { register, isLoading, error, success } = useUserRegister();
  // Solo se encarga de mostrar el formulario
  return <form>...</form>;
}

// 🔄 useUserRegister.ts - Solo lógica de estado
export function useUserRegister() {
  // Solo maneja loading, error, success
  // NO sabe cómo se hace la petición HTTP
}

// 🌐 userApiService.ts - Solo comunicación HTTP
export class UserApiService {
  // Solo sabe hacer peticiones HTTP
  // NO sabe de React, hooks, etc.
}
```

**Ventaja**: Puedes cambiar el servicio API sin tocar el componente.

### ✅ 2. Intercambiabilidad

Puedes cambiar la implementación sin tocar la UI:

```typescript
// Opción 1: API REST (actual)
const userApiService = new UserApiService(); // HTTP

// Opción 2: GraphQL (futuro)
const userApiService = new UserGraphQLService(); // GraphQL

// Opción 3: WebSocket (futuro)
const userApiService = new UserWebSocketService(); // WebSocket

// ✅ RegisterForm NO cambia, solo cambia el servicio
```

### ✅ 3. Testeable

Puedes testear cada capa por separado:

```typescript
// Test del hook sin UI
const { register } = useUserRegister();
await register({ id: "1", name: "Juan", email: "juan@test.com", password: "123" });

// Test del servicio sin hook
const service = new UserApiService();
await service.createUser({ ... });

// Test del componente con mock
const mockRegister = jest.fn();
render(<RegisterForm register={mockRegister} />);
```

### ✅ 4. Reutilizable

El mismo servicio puede usarse en diferentes componentes:

```typescript
// RegisterForm usa userApiService
const { register } = useUserRegister(); // Usa userApiService

// AdminUserForm también puede usar userApiService
const { createUser } = useAdminUser(); // Usa el mismo userApiService

// ✅ Un solo servicio, múltiples componentes
```

## 🔍 Código Paso a Paso

### Paso 1: Usuario llena formulario (RegisterForm.tsx)

```typescript
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // Generar ID único
  const id = crypto.randomUUID();
  
  // Llamar al hook
  await register({
    id,
    name: formData.name,
    email: formData.email,
    password: formData.password,
  });
};
```

### Paso 2: Hook maneja estado (useUserRegister.ts)

```typescript
const register = async (data: CreateUserRequest) => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Llama al servicio
    await userApiService.createUser(data);
    setSuccess(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Paso 3: Servicio hace HTTP (userApiService.ts)

```typescript
async createUser(data: CreateUserRequest) {
  // Usa el cliente HTTP centralizado
  return apiClient.post("/api/users", data);
}
```

### Paso 4: Cliente HTTP (api-client.ts)

```typescript
async post<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${this.baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Paso 5: Backend recibe (server.ts)

```typescript
app.post("/api/users", (req, res) => {
  userController.create(req, res);
});
```

### Paso 6: Controller procesa (ExpressUserController.ts)

```typescript
async create(req: Request, res: Response) {
  const { id, name, email, password } = req.body;
  await this.userCreate.run(id, name, email, password, ...);
  res.json({ message: "User created successfully" });
}
```

### Paso 7: Caso de uso ejecuta (UserCreate.ts)

```typescript
async run(id: string, name: string, email: string, password: string) {
  const user = new User(
    new UserId(id),
    new UserName(name),
    new UserEmail(email),
    password
  );
  await this.repository.create(user);
}
```

### Paso 8: Repository guarda (PostgresUserRepository.ts)

```typescript
async create(user: User): Promise<void> {
  await this.client.query(
    "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
    [user.id.value, user.name.value, user.email.value]
  );
}
```

## 🎯 Ventajas en la Práctica

### ✅ Cambiar de API REST a GraphQL

```typescript
// Solo cambias el servicio
// src/modules/User/infrastructure/ui/services/userGraphQLService.ts
export class UserGraphQLService {
  async createUser(data: CreateUserRequest) {
    return graphqlClient.mutate(CREATE_USER_MUTATION, { variables: data });
  }
}

// ✅ useUserRegister y RegisterForm NO cambian
```

### ✅ Agregar validación en el frontend

```typescript
// Solo cambias el hook
export function useUserRegister() {
  const register = async (data: CreateUserRequest) => {
    // Validar antes de enviar
    if (!isValidEmail(data.email)) {
      setError("Email inválido");
      return;
    }
    // ... resto del código
  };
}

// ✅ RegisterForm y userApiService NO cambian
```

### ✅ Agregar caché

```typescript
// Solo cambias el servicio
export class UserApiService {
  async createUser(data: CreateUserRequest) {
    // Guardar en caché después de crear
    const result = await apiClient.post("/api/users", data);
    cache.set(`user-${result.id}`, result);
    return result;
  }
}

// ✅ RegisterForm y useUserRegister NO cambian
```

## 📊 Comparación: Con vs Sin Arquitectura

### ❌ Sin Arquitectura (Todo mezclado)

```typescript
// Todo en un componente
function RegisterForm() {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    setLoading(true);
    const response = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({ ... })
    });
    setLoading(false);
  };
  
  return <form>...</form>;
}
```

**Problemas**:
- ❌ Difícil de testear
- ❌ No reutilizable
- ❌ URL hardcodeada
- ❌ Lógica mezclada con UI

### ✅ Con Arquitectura Hexagonal

```typescript
// Separado en capas
RegisterForm → useUserRegister → userApiService → apiClient → Backend
```

**Ventajas**:
- ✅ Fácil de testear cada capa
- ✅ Reutilizable en múltiples componentes
- ✅ Configurable (URL desde env)
- ✅ Lógica separada de UI

## 🎓 Resumen

La **Arquitectura Hexagonal en la UI** te ayuda porque:

1. **Cada capa tiene una responsabilidad clara**
2. **Puedes cambiar implementaciones sin tocar otras capas**
3. **Fácil de testear cada parte por separado**
4. **Reutilizable en múltiples componentes**
5. **Mantenible y escalable**

**Es como tener capas de una cebolla**: Cada capa protege a la siguiente y puedes cambiar una sin afectar las demás.

