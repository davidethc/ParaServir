# 👷 Ejemplo: Módulo Worker - Registro como Trabajador

## 📐 Estructura del Módulo Worker

```
src/modules/Worker/
├── Domain/
│   ├── WorkerProfile.ts
│   ├── WorkerService.ts
│   ├── WorkerRepository.ts
│   └── ValueObjects/
│       ├── WorkerId.ts
│       ├── ServiceDescription.ts
│       └── YearsExperience.ts
│
├── Application/
│   ├── WorkerRegister/
│   │   └── WorkerRegister.ts
│   ├── WorkerProfileCreate/
│   │   └── WorkerProfileCreate.ts
│   ├── WorkerProfileUpdate/
│   │   └── WorkerProfileUpdate.ts
│   ├── WorkerServiceCreate/
│   │   └── WorkerServiceCreate.ts
│   └── WorkerServiceGetByWorkerId/
│       └── WorkerServiceGetByWorkerId.ts
│
└── infrastructure/
    ├── api/
    │   └── ExpressWorkerController.ts
    ├── persistence/
    │   └── PostgresWorkerRepository.ts
    └── ui/
        ├── pages/
        │   ├── WorkerRegisterPage.tsx
        │   ├── WorkerProfilePage.tsx
        │   └── WorkerServicesPage.tsx
        ├── components/
        │   ├── WorkerRegisterForm.tsx
        │   ├── WorkerProfileForm.tsx
        │   └── WorkerServiceForm.tsx
        ├── hooks/
        │   ├── useWorkerRegister.ts
        │   └── useWorkerProfile.ts
        └── services/
            └── workerApiService.ts
```

---

## 🔄 Flujo Completo: Registro como Trabajador

### Paso 1: Usuario se registra (Auth)
```
POST /api/auth/register
{
  "email": "juan@example.com",
  "password": "123456",
  "role": "trabajador"
}
→ Crea usuario en tabla `users`
```

### Paso 2: Crea perfil general (Profile)
```
POST /api/profiles
{
  "user_id": "uuid-del-usuario",
  "full_name": "Juan Pérez",
  "phone": "+1234567890",
  "location": "Ciudad, País"
}
→ Crea perfil en tabla `profiles`
```

### Paso 3: Se registra como trabajador (Worker)
```
POST /api/workers/register
{
  "user_id": "uuid-del-usuario",
  "service_description": "Plomero con 5 años de experiencia",
  "years_experience": 5,
  "certification_url": "https://..."
}
→ Crea registro en tabla `worker_profiles`
```

### Paso 4: Agrega servicios (Worker)
```
POST /api/workers/services
{
  "worker_id": "uuid-del-trabajador",
  "category_id": "uuid-categoria",
  "title": "Reparación de tuberías",
  "description": "Reparo todo tipo de tuberías...",
  "base_price": 50.00
}
→ Crea servicio en tabla `worker_services`
```

---

## 💻 Ejemplo de Código

### Domain/WorkerProfile.ts
```typescript
import type { UserId } from "../../Auth/Domain/UserId";
import type { ServiceDescription } from "./ValueObjects/ServiceDescription";
import type { YearsExperience } from "./ValueObjects/YearsExperience";

export class WorkerProfile {
  constructor(
    public readonly id: string,
    public readonly userId: UserId,
    public readonly serviceDescription: ServiceDescription,
    public readonly yearsExperience: YearsExperience,
    public readonly certificationUrl?: string,
    public readonly isActive: boolean = true,
    public readonly verificationStatus: 'pending' | 'approved' | 'rejected' = 'pending',
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}
```

### Application/WorkerRegister/WorkerRegister.ts
```typescript
import type { WorkerRepository } from "../../Domain/WorkerRepository";
import type { WorkerProfile } from "../../Domain/WorkerProfile";

export class WorkerRegister {
  constructor(private repository: WorkerRepository) {}

  async run(
    userId: string,
    serviceDescription: string,
    yearsExperience: number,
    certificationUrl?: string
  ): Promise<WorkerProfile> {
    // Validaciones
    if (yearsExperience < 0) {
      throw new Error("Los años de experiencia no pueden ser negativos");
    }

    // Crear perfil de trabajador
    const workerProfile = new WorkerProfile(
      crypto.randomUUID(),
      userId,
      serviceDescription,
      yearsExperience,
      certificationUrl
    );

    // Guardar
    await this.repository.create(workerProfile);

    return workerProfile;
  }
}
```

### infrastructure/api/ExpressWorkerController.ts
```typescript
import { Request, Response } from "express";
import { WorkerRegister } from "../../Application/WorkerRegister/WorkerRegister";

export class ExpressWorkerController {
  constructor(private workerRegister: WorkerRegister) {}

  async register(req: Request, res: Response) {
    try {
      const { user_id, service_description, years_experience, certification_url } = req.body;

      const workerProfile = await this.workerRegister.run(
        user_id,
        service_description,
        years_experience,
        certification_url
      );

      res.status(201).json({
        message: "Trabajador registrado exitosamente",
        worker: workerProfile
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

### infrastructure/ui/pages/WorkerRegisterPage.tsx
```typescript
import { WorkerRegisterForm } from "../components/WorkerRegisterForm";
import { useNavigate } from "react-router-dom";

export function WorkerRegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/worker/profile");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6">Registro como Trabajador</h2>
        <WorkerRegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
```

### infrastructure/ui/components/WorkerRegisterForm.tsx
```typescript
import { useState, type FormEvent } from "react";
import { useWorkerRegister } from "../hooks/useWorkerRegister";

interface WorkerRegisterFormProps {
  onSuccess?: () => void;
}

export function WorkerRegisterForm({ onSuccess }: WorkerRegisterFormProps) {
  const { register, isLoading, error } = useWorkerRegister();
  const [formData, setFormData] = useState({
    serviceDescription: "",
    yearsExperience: 0,
    certificationUrl: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Obtener user_id del estado de autenticación (Redux)
    const userId = "uuid-del-usuario-autenticado"; // Desde Redux
    
    await register({
      userId,
      serviceDescription: formData.serviceDescription,
      yearsExperience: formData.yearsExperience,
      certificationUrl: formData.certificationUrl || undefined,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Descripción del servicio
        </label>
        <textarea
          required
          value={formData.serviceDescription}
          onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Describe tu experiencia y servicios..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Años de experiencia
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.yearsExperience}
          onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          URL de certificación (opcional)
        </label>
        <input
          type="url"
          value={formData.certificationUrl}
          onChange={(e) => setFormData({ ...formData, certificationUrl: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="https://..."
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {isLoading ? "Registrando..." : "Registrarse como Trabajador"}
      </button>
    </form>
  );
}
```

---

## 🎯 Ventajas de esta Separación

### ✅ Responsabilidades Claras
- **Auth**: Solo autenticación
- **Profile**: Solo perfil general
- **Worker**: Solo lógica de trabajadores

### ✅ Independencia
- Puedes cambiar la lógica de trabajadores sin afectar autenticación
- Cada módulo se testea por separado

### ✅ Reutilización
- `WorkerRegister` puede usarse desde API, CLI, o cualquier adaptador
- No está acoplado a Express o React

### ✅ Escalabilidad
- Agregar nuevas funcionalidades de trabajador = Nuevos casos de uso en Worker
- No contamina otros módulos

---

## 📝 Próximos Pasos

1. **Crear módulo Auth** (separar de User actual)
2. **Crear módulo Profile**
3. **Crear módulo Worker** (como en este ejemplo)
4. **Conectar todo** en el flujo de registro completo

