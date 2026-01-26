import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES, getPostLoginRoute } from "@/shared/constants/routes.constants";
import { FloatingInput } from "@/shared/components/ui/floating-input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Alert } from "@/shared/components/ui/alert";
import { useAuth } from "@/shared/hooks/useAuth";
import { AuthController } from "@/modules/Auth/infra/http/controllers/auth.controller";
import { AuthFooter } from "@/shared/components/layout/AuthFooter";
import { GoogleAuthButton } from "./components/GoogleAuthButton";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cedula, setCedula] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    cedula?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const { login: handleLogin } = useAuth();
  const navigate = useNavigate();
  const authController = new AuthController();

  const validateCedula = (cedula: string): boolean => {
    const cedulaRegex = /^[0-9]{10}$/;
    return cedulaRegex.test(cedula.replace(/\s/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    // Validación de campos
    const errors: typeof fieldErrors = {};
    
    if (!email) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Ingresa un correo electrónico válido";
    }
    
    if (!cedula) {
      errors.cedula = "La cédula es obligatoria";
    } else if (!validateCedula(cedula)) {
      errors.cedula = "La cédula debe tener exactamente 10 dígitos";
    }
    
    if (!password) {
      errors.password = "La contraseña es obligatoria";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await authController.login({ email, password });

      // Login usando hook unificado (actualiza Redux y localStorage automáticamente)
      if (response.token) {
        handleLogin({
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          token: response.token,
        });
      }

      // Redirigir según el rol del usuario
      const redirectRoute = getPostLoginRoute(response.user.role);
      // Login exitoso, redirigir según rol
      
      // Usar setTimeout para asegurar que Redux se actualice antes de navegar
      setTimeout(() => {
        navigate(redirectRoute, { replace: true });
      }, 100);
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
    <div className="min-h-screen flex bg-background">
      {/* Izquierda: Formulario */}

      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-xl mx-auto mt-8" >
        <div>
          <div className="mb-8 mt-8">
            <div className="mb-2 text-2xl font-semibold text-foreground">Inicia sesión en tu cuenta</div>
            <p className="text-sm text-muted-foreground leading-relaxed">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
              
              <FloatingInput
                id="email"
                name="email"
                type="email"
                label="Correo electrónico"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                error={fieldErrors.email}
                required
                autoComplete="email"
              />
              
              <FloatingInput
                id="cedula"
                name="cedula"
                type="text"
                label="Cédula"
                value={cedula}
                onChange={e => {
                  setCedula(e.target.value.replace(/\D/g, ""));
                  if (fieldErrors.cedula) {
                    setFieldErrors(prev => ({ ...prev, cedula: undefined }));
                  }
                }}
                error={fieldErrors.cedula}
                helperText={!fieldErrors.cedula ? "Debe tener exactamente 10 dígitos" : undefined}
                required
                maxLength={10}
                autoComplete="off"
              />
              
              <div>
                <div className="relative">
                  <FloatingInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Contraseña"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    error={fieldErrors.password}
                    required
                    autoComplete="current-password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded p-1"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929m14.142-14.142A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-primary cursor-pointer" 
                    />
                    Recuérdame
                  </label>
                  <Link 
                    to={ROUTES.PUBLIC.FORGOT_PASSWORD} 
                    className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full font-medium py-2"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground text-xs">O ingresa con</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <GoogleAuthButton />
              <div className="text-center text-sm mt-2 text-text-secondary">
                ¿No tienes cuenta?{' '}
                <Link to={ROUTES.PUBLIC.REGISTER} className="text-primary hover:text-primary-hover hover:underline font-medium">Regístrate</Link>
              </div>
            </form>
          </Card>
        </div>
        <AuthFooter />
      </div>
      {/* Derecha: Logo */}
      <div className="hidden md:flex flex-1 bg-secondary items-start justify-start pt-0">
        <img 
          src="/src/shared/Assets/logo_servir.png" 
          alt="Logo ParaServir" 
          className="w-full h-full object-contain object-top"
        />
      </div>
    </div>
  );
}
