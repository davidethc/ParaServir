import { WorkerRegisterForm } from "../components/WorkerRegisterForm";
import loginRecuperatePasswordImage from "@/shared/assets/login_recuperate_password.png";
import logoServir from "@/shared/assets/logo_servir.png";
import { useAppSelector } from "@/shared/infrastructure/store/hooks";
import { Navigate } from "react-router-dom";

export function WorkerRegisterPage() {
  const user = useAppSelector((state) => state.user.user);

  // Si no hay usuario autenticado o no es trabajador, redirigir al registro
  if (!user || user.role !== "trabajador") {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Header con Logo */}
      <div className="flex justify-start p-6 flex-shrink-0">
        <img 
          src={logoServir} 
          alt="Para Servir Logo" 
          className="h-24 w-auto"
        />
      </div>

      {/* Layout de dos columnas */}
      <div className="grid md:grid-cols-2 gap-0 flex-1 overflow-hidden">
        {/* Columna izquierda - Ilustración */}
        <div className="p-6 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-md h-full flex items-center">
            <img 
              src={loginRecuperatePasswordImage} 
              alt="Worker registration illustration" 
              className="w-full h-auto object-contain max-h-full"
            />
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="p-6 sm:p-8 flex items-center justify-center overflow-y-auto">
          <div className="max-w-md w-full">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Completa tu Perfil de Trabajador
              </h2>
              <p className="text-gray-600 text-sm">
                ¡Bienvenido! Ahora completa la información de tu perfil de trabajador para comenzar a ofrecer tus servicios.
              </p>
            </div>

            <WorkerRegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}

