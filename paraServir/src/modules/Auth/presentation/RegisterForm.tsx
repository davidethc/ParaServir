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
import { AuthController } from "@/modules/Auth/infra/http/controllers/auth.controller";
import { useDispatch } from "react-redux";
import { login } from "@/Store/slices/authSlice";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState<"usuario" | "trabajador" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authController = new AuthController();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones cliente
    if (!email || !password || !firstName || !lastName || !cedula || !phone || !location || !role) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    if (!validateEmail(email)) {
      setError("El formato del correo electrónico no es válido");
      return;
    }

    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!validatePhone(phone)) {
      setError("El teléfono debe tener 10 dígitos");
      return;
    }

    if (!cedula.trim()) {
      setError("La cédula es obligatoria");
      return;
    }

    setLoading(true);

    try {
      const response = await authController.register({
        email,
        password,
        firstName,
        lastName,
        cedula,
        phone,
        location,
        avatar_url: avatarUrl || null,
        role: role as "usuario" | "trabajador",
      });

      // Guardar token si existe
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.userId);
      }

      // Actualizar Redux
      dispatch(login({
        id: response.userId,
        email: response.email,
        role: response.role,
      }));

      // Si es trabajador y necesita completar perfil, redirigir
      if (response.role === "trabajador" && (response.nextStep === "complete_worker_profile" || !response.nextStep)) {
        // Asegurar que tenemos token antes de redirigir
        const tokenToPass = response.token || localStorage.getItem("token") || "";
        if (tokenToPass && response.userId) {
          navigate("/complete-worker-profile", { 
            state: { 
              userId: response.userId, 
              token: tokenToPass 
            },
            replace: false 
          });
        } else {
          // Si no hay token, redirigir a login
          setError("Error al obtener token. Por favor inicia sesión.");
          navigate("/login");
        }
      } else {
        // Si es usuario normal, redirigir a home o dashboard
        navigate("/", { replace: true });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al registrar usuario. Por favor intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Izquierda: Formulario */}
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-xl mx-auto">
        <div>
          <div className="mb-8 mt-8">
            <div className="mb-2 text-3xl font-bold text-gray-800 leading-tight">
              Encuentra tu próximo empleo<br />Encuentra la próxima solución<br />a tu problema
            </div>
            <div className="mt-4 mb-2 text-base text-gray-700">Regístrate gratis hoy</div>
          </div>
          <Card className="p-8 shadow-lg border-2 border-blue-500 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert variant="destructive">{error}</Alert>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="font-medium text-gray-700">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Pérez"
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cedula" className="font-medium text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  placeholder="0928374651"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-medium text-gray-700">
                  Correo electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@company.com"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0988888888"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location" className="font-medium text-gray-700">
                  Ubicación <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Quito, Guayaquil, etc."
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="avatarUrl" className="font-medium text-gray-700">
                  URL del Avatar (Opcional)
                </Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="password" className="font-medium text-gray-700">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
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
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="font-medium text-gray-700">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative z-0">
                <Label htmlFor="role" className="font-medium text-gray-700">
                  Rol <span className="text-red-500">*</span>
                </Label>
                <Select value={role} onValueChange={(value) => setRole(value as "usuario" | "trabajador")}>
                  <SelectTrigger className="mt-1 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" aria-label="Selecciona un rol" id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border-gray-200 shadow-xl">
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="trabajador">Trabajador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Crear cuenta"}
                </Button>
              </div>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">O regístrate con</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Google
              </Button>

              <div className="text-center text-sm mt-2 text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">Inicia sesión</Link>
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
