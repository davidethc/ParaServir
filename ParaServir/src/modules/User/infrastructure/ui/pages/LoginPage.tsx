import { LoginForm } from "../components/LoginForm";

import logoServir from "@/shared/assets/logo_servir.png";

export function LoginPage() {
  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col">
      {/* Dashed Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e7e5e4 1px, transparent 1px),
            linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      {/* Layout de dos columnas */}
      <div className="grid md:grid-cols-2 gap-0 flex-1 overflow-hidden relative z-10">
        {/* Columna izquierda - Formulario */}
        <div className="p-8 sm:p-12 flex items-center justify-center overflow-y-auto">
          <div className="max-w-md w-full border-4 border-blue-800/50 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Login
              </h2>
              <p className="text-gray-600 text-sm">
                Login to access your travelwise account
              </p>
            </div>

            <LoginForm />
          </div>
        </div>

        {/* Columna derecha - Ilustración */}
        <div className="p-4 pl-0 flex items-center justify-start bg-white overflow-hidden">
          <div className="w-full h-full flex items-center justify-start">
            <img 
              src={logoServir} 
              alt="Para Servir Logo" 
              className="w-auto h-[75vh] max-w-full object-contain"
              style={{ marginBottom: '100px', marginLeft: '-60px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

