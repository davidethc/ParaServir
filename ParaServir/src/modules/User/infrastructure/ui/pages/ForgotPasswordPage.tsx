import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import loginRecuperatePasswordImage from "@/shared/assets/login_recuperate_password.png";
import logoServir from "@/shared/assets/logo_servir.png";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
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
        {/* Columna izquierda - Formulario */}
        <div className="p-6 sm:p-8 flex items-center justify-center overflow-y-auto">
          <div className="max-w-md w-full">
            <div className="mb-4">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800 mb-3 inline-block">
                &lt; Back to login
              </Link>
            </div>
            
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot your password?
              </h2>
              <p className="text-gray-600 text-sm">
                Don't worry, happens to all of us. Enter your email below to recover your password
              </p>
            </div>

            <ForgotPasswordForm />
          </div>
        </div>

        {/* Columna derecha - Ilustración */}
        <div className="p-6 flex items-center justify-center bg-white overflow-hidden">
          <div className="w-full max-w-md h-full flex items-center">
            <img 
              src={loginRecuperatePasswordImage} 
              alt="Forgot password illustration" 
              className="w-full h-auto object-contain max-h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

