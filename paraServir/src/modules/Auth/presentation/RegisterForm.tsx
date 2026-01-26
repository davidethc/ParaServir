import { useState } from "react";
import { FloatingInput } from "@/shared/components/ui/floating-input";
import { FloatingSelect } from "@/shared/components/ui/floating-select";
import { PasswordStrength } from "@/shared/components/ui/password-strength";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Alert } from "@/shared/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES, getPostRegisterRoute } from "@/shared/constants/routes.constants";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import { AuthController } from "@/modules/Auth/infra/http/controllers/auth.controller";
import { useDispatch } from "react-redux";
import { login } from "@/Store/slices/authSlice";
import { AuthFooter } from "@/shared/components/layout/AuthFooter";
import { GoogleAuthButton } from "./components/GoogleAuthButton";
import { Navigation, Loader2 } from "lucide-react";

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
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    cedula?: string;
    email?: string;
    phone?: string;
    location?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authController = new AuthController();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd: string): boolean => {
    const long = pwd.length >= 8;
    const upper = /[A-Z]/.test(pwd);
    const number = /[0-9]/.test(pwd);
    const special = /[@$!%*?&]/.test(pwd);
    return long && upper && number && special;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Función para reverse geocoding: convertir coordenadas a dirección
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ParaServir-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener la dirección');
      }

      const data = await response.json();
      
      if (data && data.address) {
        // Construir dirección legible con calle, ciudad, etc.
        const address = data.address;
        let formattedAddress = '';
        
        // Priorizar: calle > ciudad > estado > país
        if (address.road || address.street) {
          formattedAddress += (address.road || address.street) + ', ';
        }
        if (address.neighbourhood || address.suburb) {
          formattedAddress += (address.neighbourhood || address.suburb) + ', ';
        }
        if (address.city || address.town || address.village) {
          formattedAddress += (address.city || address.town || address.village);
        } else if (address.state) {
          formattedAddress += address.state;
        }
        if (address.country) {
          if (formattedAddress) formattedAddress += ', ';
          formattedAddress += address.country;
        }

        // Si no hay dirección formateada, usar display_name completo
        return formattedAddress.trim() || data.display_name || null;
      }
      
      return null;
    } catch (err) {
      console.error('Error en reverse geocoding:', err);
      return null;
    }
  };

  // Obtener ubicación actual del usuario
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    setGettingLocation(true);
    setError(null);

    try {
      // Obtener coordenadas GPS
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Convertir coordenadas a dirección (calles)
          const address = await reverseGeocode(latitude, longitude);
          
          if (address) {
            setLocation(address);
          } else {
            setError("No se pudo obtener la dirección. Puedes escribirla manualmente.");
          }
          
          setGettingLocation(false);
        },
        (err) => {
          // Manejar errores de manera más amigable
          const errorMessage = err.code === 1 
            ? "Permisos de ubicación denegados. Puedes escribirla manualmente."
            : err.code === 3
            ? "Tiempo de espera agotado. Puedes escribirla manualmente."
            : `Error al obtener ubicación: ${err.message}. Puedes escribirla manualmente.`;
          setError(errorMessage);
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch {
      setError("Error al obtener la ubicación. Puedes escribirla manualmente.");
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validaciones por campo
    const errors: typeof fieldErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "El nombre es obligatorio";
    }

    if (!lastName.trim()) {
      errors.lastName = "El apellido es obligatorio";
    }

    if (!cedula.trim()) {
      errors.cedula = "La cédula es obligatoria";
    } else if (!/^[0-9]{10}$/.test(cedula.replace(/\s/g, ""))) {
      errors.cedula = "La cédula debe tener exactamente 10 dígitos";
    }

    if (!email) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!validateEmail(email)) {
      errors.email = "El formato del correo electrónico no es válido";
    }

    if (!phone) {
      errors.phone = "El teléfono es obligatorio";
    } else if (!validatePhone(phone)) {
      errors.phone = "El teléfono debe tener 10 dígitos";
    }

    if (!location.trim()) {
      errors.location = "La ubicación es obligatoria";
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria";
    } else if (!validatePassword(password)) {
      errors.password = "La contraseña no cumple con los requisitos";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!role) {
      errors.role = "Debes seleccionar un rol";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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

      // Guardar token y datos del usuario usando servicio centralizado
      if (response.token) {
        AuthStorageService.saveAuthData({
          token: response.token,
          userId: response.userId,
          userEmail: response.email,
          userRole: response.role,
        });
      }

      // Actualizar Redux primero
      dispatch(login({
        id: response.userId,
        email: response.email,
        role: response.role,
      }));

      // Redirigir según el rol del usuario (registro)
      const redirectRoute = getPostRegisterRoute(response.role);
      // Registro exitoso, redirigir según rol
      
      // Usar setTimeout para asegurar que Redux se actualice antes de navegar
      // Esto evita conflictos con PublicRoute que podría estar verificando el estado
      setTimeout(() => {
        // Asegurar que tenemos token antes de redirigir
        const tokenToPass = response.token || AuthStorageService.getToken() || "";
        if (!tokenToPass || !response.userId) {
          setError("Error al obtener token. Por favor inicia sesión.");
          navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
          return;
        }

        if (response.role === "trabajador") {
          // Trabajador va directo a crear su primer servicio
          navigate(redirectRoute, { 
            state: { 
              userId: response.userId, 
              token: tokenToPass 
            },
            replace: true 
          });
        } else {
          // Usuario normal va a categorías (dashboard categorías)
          navigate(redirectRoute, { replace: true });
        }
      }, 100);
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
    <div className="min-h-screen flex bg-background">
      {/* Izquierda: Formulario */}
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-xl mx-auto">
        <div>
          <div className="mb-6 mt-6">
            <div className="mb-1 text-2xl font-semibold text-foreground leading-snug">
              Crea tu cuenta en ParaServir
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Regístrate gratis en menos de un minuto
            </div>
          </div>
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
              
              {/* Sección: Información Personal */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    label="Nombre"
                    value={firstName}
                    onChange={e => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName) {
                        setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                      }
                    }}
                    error={fieldErrors.firstName}
                    required
                    autoComplete="given-name"
                  />
                  <FloatingInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    label="Apellido"
                    value={lastName}
                    onChange={e => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName) {
                        setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                      }
                    }}
                    error={fieldErrors.lastName}
                    required
                    autoComplete="family-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    helperText={!fieldErrors.cedula ? "10 dígitos" : undefined}
                    required
                    maxLength={10}
                    autoComplete="off"
                  />
                  <FloatingInput
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Teléfono"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      if (fieldErrors.phone) {
                        setFieldErrors(prev => ({ ...prev, phone: undefined }));
                      }
                    }}
                    error={fieldErrors.phone}
                    helperText={!fieldErrors.phone ? "10 dígitos" : undefined}
                    required
                    maxLength={10}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Sección: Contacto */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Información de Contacto</h3>
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

                <div className="relative">
                  <FloatingInput
                    id="location"
                    name="location"
                    type="text"
                    label="Ubicación"
                    value={location}
                    onChange={e => {
                      setLocation(e.target.value);
                      if (fieldErrors.location) {
                        setFieldErrors(prev => ({ ...prev, location: undefined }));
                      }
                    }}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text');
                      if (pastedText) {
                        setLocation(pastedText);
                      }
                    }}
                    error={fieldErrors.location}
                    helperText={!fieldErrors.location ? "Haz clic en el icono para obtener tu ubicación automáticamente" : undefined}
                    required
                    autoComplete="street-address"
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 hover:bg-primary/10"
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    title="Obtener mi ubicación automáticamente"
                    aria-label="Obtener ubicación actual"
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Navigation className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </div>
                <FloatingInput
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  label="URL del Avatar (Opcional)"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  autoComplete="photo"
                />
              </div>

              {/* Sección: Seguridad */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Seguridad</h3>
                <div className="grid grid-cols-2 gap-4">
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
                        autoComplete="new-password"
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
                    {password && (
                      <PasswordStrength password={password} className="mt-2" />
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <FloatingInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        label="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={e => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) {
                            setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                          }
                        }}
                        error={fieldErrors.confirmPassword}
                        required
                        autoComplete="new-password"
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
                    {confirmPassword && password && (
                      <div className="mt-2">
                        {password === confirmPassword ? (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Las contraseñas coinciden
                          </p>
                        ) : (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Las contraseñas no coinciden
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección: Tipo de Cuenta */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tipo de Cuenta</h3>
                <FloatingSelect
                  id="role"
                  label="Rol"
                  value={role}
                  onValueChange={(value) => {
                    setRole(value as "usuario" | "trabajador");
                    if (fieldErrors.role) {
                      setFieldErrors(prev => ({ ...prev, role: undefined }));
                    }
                  }}
                  options={[
                    { value: "usuario", label: "Usuario" },
                    { value: "trabajador", label: "Trabajador" }
                  ]}
                  error={fieldErrors.role}
                  required
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full font-medium py-2.5 text-base"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Crear cuenta"}
                </Button>
              </div>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground text-xs">O regístrate con</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <GoogleAuthButton />

              <div className="text-center text-sm mt-2 text-text-secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link to={ROUTES.PUBLIC.LOGIN} className="text-primary hover:text-primary-hover hover:underline font-medium">Inicia sesión</Link>
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
