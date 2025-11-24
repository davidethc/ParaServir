# 🎨 Flujo Completo: Registro desde la UI

## 📊 Diagrama Visual del Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎨 FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. RegisterPage.tsx                                            │
│     └─> Renderiza RegisterForm                                 │
│                                                                  │
│  2. RegisterForm.tsx                                            │
│     ├─> Usuario llena: name, email, password                   │
│     ├─> Hace clic en "Registrarse"                             │
│     └─> Llama: register({ id, name, email, password })         │
│         │                                                        │
│         ↓                                                        │
│  3. useUserRegister() hook                                      │
│     ├─> setIsLoading(true)                                      │
│     ├─> Llama: userApiService.createUser(data)                │
│     └─> Maneja: loading, error, success                        │
│         │                                                        │
│         ↓                                                        │
│  4. userApiService.createUser()                                 │
│     └─> apiClient.post("/api/users", data)                     │
│         │                                                        │
│         ↓                                                        │
│  5. apiClient.post()                                            │
│     └─> fetch("http://localhost:3000/api/users", {...})      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│                    🔧 BACKEND (Express)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  6. server.ts                                                   │
│     └─> app.post("/api/users", ...)                            │
│         └─> userController.create(req, res)                   │
│             │                                                    │
│             ↓                                                    │
│  7. ExpressUserController.create()                             │
│     ├─> Extrae: { id, name, email, password }                 │
│     ├─> Valida campos requeridos                               │
│     └─> Llama: this.userCreate.run(...)                        │
│         │                                                        │
│         ↓                                                        │
│  8. UserCreate.run() (Application)                             │
│     ├─> Crea: new User(new UserId(id), ...)                   │
│     └─> Llama: this.repository.create(user)                   │
│         │                                                        │
│         ↓                                                        │
│  9. UserRepository.create() (Domain - Interfaz)               │
│     └─> Define contrato, no implementa                         │
│         │                                                        │
│         ↓                                                        │
│  10. PostgresUserRepository.create() (Infrastructure)           │
│      └─> INSERT INTO users (id, name, email) VALUES (...)     │
│          └─> PostgreSQL guarda el usuario                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP Response
┌─────────────────────────────────────────────────────────────────┐
│                    🎨 FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  11. apiClient recibe respuesta                                 │
│      └─> { message: "User created successfully" }              │
│          │                                                        │
│          ↓                                                        │
│  12. userApiService.createUser() resuelve                      │
│      └─> Retorna respuesta                                      │
│          │                                                        │
│          ↓                                                        │
│  13. useUserRegister recibe respuesta                          │
│      ├─> setSuccess(true)                                       │
│      └─> setIsLoading(false)                                    │
│          │                                                        │
│          ↓                                                        │
│  14. RegisterForm detecta success = true                       │
│      └─> Muestra: "¡Usuario registrado exitosamente!"          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 💻 Código Real Paso a Paso

### 1️⃣ Usuario llena formulario (RegisterForm.tsx)

```typescript
// Usuario escribe en los inputs
const [formData, setFormData] = useState({
  name: "Juan Pérez",
  email: "juan@test.com",
  password: "password123",
  confirmPassword: "password123"
});

// Usuario hace clic en "Registrarse"
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const id = crypto.randomUUID(); // Genera: "550e8400-e29b-41d4-a716-446655440000"
  
  // Llama al hook
  await register({
    id,
    name: formData.name,      // "Juan Pérez"
    email: formData.email,     // "juan@test.com"
    password: formData.password // "password123"
  });
};
```

### 2️⃣ Hook maneja estado (useUserRegister.ts)

```typescript
const register = async (data: CreateUserRequest) => {
  setIsLoading(true);  // Muestra "Registrando..."
  setError(null);
  setSuccess(false);
  
  try {
    // Llama al servicio
    await userApiService.createUser(data);
    // Si llega aquí, fue exitoso
    setSuccess(true);  // Muestra mensaje de éxito
  } catch (err) {
    setError(err.message);  // Muestra error
  } finally {
    setIsLoading(false);  // Oculta "Registrando..."
  }
};
```

### 3️⃣ Servicio hace HTTP (userApiService.ts)

```typescript
async createUser(data: CreateUserRequest) {
  // Hace POST a http://localhost:3000/api/users
  return apiClient.post("/api/users", {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Juan Pérez",
    email: "juan@test.com",
    password: "password123"
  });
}
```

### 4️⃣ Cliente HTTP (api-client.ts)

```typescript
async post<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Juan Pérez",
      email: "juan@test.com",
      password: "password123"
    })
  });
  
  return response.json(); // { message: "User created successfully" }
}
```

### 5️⃣ Backend recibe (server.ts)

```typescript
app.post("/api/users", (req, res) => {
  // req.body = {
  //   id: "550e8400-e29b-41d4-a716-446655440000",
  //   name: "Juan Pérez",
  //   email: "juan@test.com",
  //   password: "password123"
  // }
  userController.create(req, res);
});
```

### 6️⃣ Controller procesa (ExpressUserController.ts)

```typescript
async create(req: Request, res: Response) {
  const { id, name, email, password } = req.body;
  
  // Llama al caso de uso
  await this.userCreate.run(
    id,        // "550e8400-e29b-41d4-a716-446655440000"
    name,      // "Juan Pérez"
    email,     // "juan@test.com"
    password,  // "password123"
    "user",    // role por defecto
    false,     // isVerified por defecto
    new Date() // createdAt
  );
  
  res.status(201).json({ 
    message: "User created successfully" 
  });
}
```

### 7️⃣ Caso de uso ejecuta (UserCreate.ts)

```typescript
async run(id: string, name: string, email: string, password: string) {
  // Crea objeto de dominio con Value Objects
  const user = new User(
    new UserId(id),           // UserId("550e8400-...")
    new UserName(name),       // UserName("Juan Pérez")
    new UserEmail(email),     // UserEmail("juan@test.com")
    password,                 // "password123"
    "user",                   // role
    false,                    // isVerified
    new UserCreatedAt(new Date()) // createdAt
  );
  
  // Guarda usando el repositorio
  await this.repository.create(user);
}
```

### 8️⃣ Repository guarda (PostgresUserRepository.ts)

```typescript
async create(user: User): Promise<void> {
  await this.client.query({
    text: "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
    values: [
      user.id.value,      // "550e8400-e29b-41d4-a716-446655440000"
      user.name.value,    // "Juan Pérez"
      user.email.value    // "juan@test.com"
    ]
  });
  
  // PostgreSQL ejecuta: INSERT INTO users...
}
```

### 9️⃣ Respuesta vuelve al frontend

```typescript
// Backend responde
{ message: "User created successfully" }

// Hook recibe
setSuccess(true);

// Componente muestra
{success && (
  <div className="bg-green-50">
    <p>¡Usuario registrado exitosamente!</p>
  </div>
)}
```

## 🎯 Cómo Probar

### 1. Iniciar backend
```bash
npm run dev:server
```

### 2. Iniciar frontend (otra terminal)
```bash
npm run dev
```

### 3. Abrir navegador
- Ve a: http://localhost:5173
- Verás el formulario de registro

### 4. Llenar y enviar
- Nombre: "Juan Pérez"
- Email: "juan@test.com"
- Contraseña: "password123"
- Confirmar: "password123"
- Clic en "Registrarse"

### 5. Ver resultado
- ✅ Mensaje verde: "¡Usuario registrado exitosamente!"
- ✅ Usuario guardado en memoria (o Postgres si configuraste DATABASE_URL)

## 🔍 Ver en la Consola

### Frontend (navegador)
```javascript
// Verás en Network tab:
POST http://localhost:3000/api/users
Request: { id: "...", name: "Juan Pérez", email: "juan@test.com", password: "password123" }
Response: { message: "User created successfully" }
```

### Backend (terminal)
```
🚀 Server is running on http://localhost:3000
POST /api/users 201
```

## 💡 Ventajas de la Arquitectura

1. **Modular**: Cada capa es independiente
2. **Testeable**: Puedes testear cada parte por separado
3. **Intercambiable**: Cambias implementaciones sin tocar otras capas
4. **Mantenible**: Fácil de entender y modificar
5. **Escalable**: Agregas nuevas funcionalidades sin romper las existentes

¡Tu registro está completamente funcional! 🚀

