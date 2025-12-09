import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import { login } from "@/Store/slices/authSlice";
import { AuthController } from "@/modules/Auth/infra/http/controllers/auth.controller";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authController = new AuthController();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const response = await authController.login({ email, password });

      // Guardar token
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.user.id);
      }

      // Actualizar Redux
      dispatch(login({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
      }));

      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión. Por favor intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Izquierda: Formulario */}

      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-xl mx-auto mt-8" >
        <div>
          <div className="mb-8 mt-8">
            <div className="mb-2 text-2xl font-bold text-gray-800">Inicia sesión en tu cuenta</div>
            <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>
          <Card className="p-8 shadow-lg border-2 border-blue-500 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div>
                <Label htmlFor="email" className="font-medium text-gray-700">Correo electrónico <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo electrónico registrado"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
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
                <div className="flex items-center justify-between mt-2 text-sm">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input type="checkbox" className="accent-blue-500" />
                    Recuérdame
                  </label>
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">¿Olvidaste tu contraseña?</Link>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">O ingresa con</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Google
              </Button>
              <div className="text-center text-sm mt-2 text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">Regístrate</Link>
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
           src="/src/shared/Assets/logo_servir.png" 
           alt="Logo ParaServir" 
           className="w-[620px] h-[620px] object-contain mx-auto mb-94"
           style={{ minWidth: 520, minHeight: 520 }}
          />
      </div>
    </div>
  );
}
