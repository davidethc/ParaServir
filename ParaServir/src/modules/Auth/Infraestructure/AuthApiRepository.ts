import type { UserRepository } from "@/modules/Auth/Domain/UserRepository";
import type { User } from "@/modules/Auth/Domain/User";

const API_BASE_URL = "https://api.ejemplo.com"; // Cambia esta URL por la real

export class AuthApiRepository implements UserRepository {
  async create(user: User): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id.value,
        name: user.name.value,
        lastName: user.lastName,
        email: user.email.value,
        password: user.password,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt.value,
      }),
    });
    if (!response.ok) {
      throw new Error("Error al registrar usuario");
    }
  }

  async findById(id: string): Promise<User | null> {
    // Implementar si es necesario
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Implementar si es necesario
    return null;
  }

  async findAll(): Promise<User[]> {
    // Implementar si es necesario
    return [];
  }

  async update(user: User): Promise<void> {
    // Implementar si es necesario
  }

  async delete(id: string): Promise<void> {
    // Implementar si es necesario
  }
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Credenciales incorrectas o error de red");
  }
  return response.json();
}
