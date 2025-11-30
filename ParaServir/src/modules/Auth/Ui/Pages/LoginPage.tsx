
import { useState } from "react";
import { AuthForm } from "@/modules/Auth/Ui/Components/AuthForm";
import { loginUser } from "@/modules/Auth/Infraestructure/AuthApiRepository";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await loginUser(data.email, data.password);
      // Maneja el resultado (guardar token, redirigir, etc.)
      console.log("Login success", result);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} loading={loading} error={error} />;
}
