
import { useState } from "react";
import { AuthForm } from "@/modules/Auth/Ui/Components/AuthForm";
import { AuthApiRepository } from "@/modules/Auth/Infraestructure/AuthApiRepository";
import { UserCreate } from "@/modules/Auth/Application/UserCreate/UserCreate";
import { UserId } from "@/modules/Auth/Domain/UserId";
import { UserName } from "@/modules/Auth/Domain/UserName";
import { UserEmail } from "@/modules/Auth/Domain/UserEmail";
import { UserCreatedAt } from "@/modules/Auth/Domain/UserCreatedAT";

// Helper para crear usuario usando el caso de uso y el repo de infraestructura
async function registerUser(email: string, password: string) {
  const repo = new AuthApiRepository();
  const userCreate = new UserCreate(repo);
  await userCreate.run(
    crypto.randomUUID(),
    email.split("@")[0], // nombre de ejemplo
    "", // lastName vacío
    email,
    password,
    "user", // rol por defecto
    false, // isVerified
    new Date()
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleRegister = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await registerUser(data.email, data.password);
      // Maneja el resultado (guardar token, redirigir, etc.)
      console.log("Register success", result);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm type="register" onSubmit={handleRegister} loading={loading} error={error} />;
}
