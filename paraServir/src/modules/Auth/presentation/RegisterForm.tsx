
import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import {

  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/shared/components/ui/select";
import { Link, useNavigate } from "react-router-dom";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !role) {
      setError("Todos los campos son obligatorios");
      return;
    }
    alert("Registro simulado: " + email + ", rol: " + role);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Izquierda: Formulario */}
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-xl mx-auto">
        <div>
          <div className="mb-8 mt-8">
            <div className="mb-2 text-3xl font-bold text-gray-800 leading-tight">
              Encuentra tu proximo empleo<br />Encuentra la proxima solucion<br />a tu problema
            </div>
            <div className="mt-4 mb-2 text-base text-gray-700">Regístrate gratis hoy</div>
          </div>
          <Card className="p-8 shadow-none border-none">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div>
                <Label htmlFor="email" className="font-medium">Correo electronio <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@company.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-medium">Contraseña <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929m14.142-14.142A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="relative z-0">
                <Label htmlFor="role" className="font-medium">Rol <span className="text-red-500">*</span></Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="mt-1 w-full" aria-label="Selecciona un rol" id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="z-50" >
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="trabajador">Trabajador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6">
                <Button type="submit" className="w-full" disabled>
                  Crear cuenta
                </Button>
              </div>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">O registrate con</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Google
              </Button>
              <div className="text-center text-sm mt-2">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-red-500 hover:underline font-medium">Inicia sesión</Link>
              </div>
            </form>
          </Card>
        </div>
        <footer className="text-xs text-gray-400 text-center mt-8 mb-2">
          © 2025 Todos los derechos reservados. <span className="mx-1">·</span>
          <Link to="#" className="hover:underline">Términos y Condiciones</Link> <span className="mx-1">·</span>
          <Link to="#" className="hover:underline">Política de Privacidad</Link>
        </footer>
      </div>
      {/* Derecha: Logo */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-white">
        <img 
          src="src/shared/Assets/logo_servir.png" 
          alt="Logo ParaServir" 
 className="w-[620px] h-[620px] object-contain mx-auto mb-94"
          style={{ minWidth: 520, minHeight: 520 }}
        />
      </div>
    </div>
  );
}
