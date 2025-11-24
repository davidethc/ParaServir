import { SetPasswordForm } from "../components/SetPasswordForm";
import loginRecuperatePasswordImage from "@/shared/assets/login_recuperate_password.png";

export function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header con Logo */}
        <div className="flex justify-start p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="text-gray-900 font-semibold">Your Logo</span>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Columna izquierda - Formulario */}
          <div className="p-8 sm:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Set a password
                </h2>
                <p className="text-gray-600 text-base">
                  Your previous password has been reseted. Please set a new password for your account.
                </p>
              </div>

              <SetPasswordForm />
            </div>
          </div>

          {/* Columna derecha - Ilustración */}
          <div className="p-8 flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
              <img 
                src={loginRecuperatePasswordImage} 
                alt="Set password illustration" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

