import { RegisterForm } from "../components/RegisterForm";
import loginRegisterImage from "@/shared/assets/login_register.png";

export function RegisterPage() {
  const handleSuccess = () => {
    // Redirigir o mostrar mensaje de éxito
    console.log("Registro exitoso");
    // Ejemplo: navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header con Logo */}
        <div className="flex justify-end p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="text-gray-900 font-semibold">Your Logo</span>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Columna izquierda - Ilustración */}
          <div className=" p-8 flex items-center justify-center">
            <div className="w-full max-w-md">
              <img 
                src={loginRegisterImage} 
                alt="Login illustration" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="p-8 sm:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Sign up
                </h2>
                <p className="text-gray-600 text-base">
                  Let's get you all set up so you can access your personal account.
                </p>
              </div>

              <RegisterForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

