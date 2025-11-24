import { Routes, Route, Navigate } from "react-router-dom";
import { RegisterPage } from "../../../modules/User/infrastructure/ui/pages/RegisterPage";
import { LoginPage } from "../../../modules/User/infrastructure/ui/pages/LoginPage";
import { ForgotPasswordPage } from "../../../modules/User/infrastructure/ui/pages/ForgotPasswordPage";
import { VerifyCodePage } from "../../../modules/User/infrastructure/ui/pages/VerifyCodePage";
import { SetPasswordPage } from "../../../modules/User/infrastructure/ui/pages/SetPasswordPage";
import { WorkerRegisterPage } from "../../../modules/Worker/infrastructure/ui/pages/WorkerRegisterPage";
import { useAppSelector } from "../store/hooks";

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Página de dashboard temporal (reemplazar cuando tengas la real)
function DashboardPage() {
  const user = useAppSelector((state) => state.user.user);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">Bienvenido, {user?.name}!</p>
        <p className="text-gray-600">Email: {user?.email}</p>
        <p className="text-gray-600">Rol: {user?.role}</p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      
      {/* Rutas de trabajadores */}
      <Route path="/worker/register" element={<WorkerRegisterPage />} />
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

