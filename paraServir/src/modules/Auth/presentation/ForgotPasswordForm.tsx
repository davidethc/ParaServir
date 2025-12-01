import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("El correo es obligatorio");
      return;
    }
    // Simulación de envío de email
    navigate("/verify-code");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <img src="src/shared/Assets/logo_servir.png" alt="Logo ParaServir" className="w-32 h-32 object-contain mb-2" />
        <span className="text-sm text-gray-500 font-medium">PARA SEVIR :)</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full mt-40">
        <h2 className="text-2xl font-bold text-center mb-2">Restablecer contraseña</h2>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>
        <Card className="w-full max-w-md p-8 shadow-none border-none">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <Label htmlFor="email" className="font-medium">Correo registrado <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico registrado"
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800">
              Volver al inicio de sesión
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Volver al inicio de sesión
            </Button>
          </form>
        </Card>
      </div>
      <footer className="text-xs text-gray-400 text-center mt-8 mb-2 w-full absolute bottom-2">
        © 2025 Todos los derechos reservados. <span className="mx-1">·</span>
        <Link to="#" className="hover:underline">Términos y Condiciones</Link> <span className="mx-1">·</span>
        <Link to="#" className="hover:underline">Política de Privacidad</Link>
      </footer>
      <div className="absolute inset-0 -z-10">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0C400 300 1000 0 1440 200V900H0V0Z" fill="none" stroke="#F87171" strokeWidth="1.5" strokeDasharray="8 8" />
        </svg>
      </div>
    </div>
  );
}
