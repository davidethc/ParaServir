import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "@/modules/Home/presentation/HomePage";
import { RegisterForm } from "@/modules/Auth/presentation/RegisterForm";
import { LoginForm } from "@/modules/Auth/presentation/LoginForm";
import { ForgotPasswordForm } from "@/modules/Auth/presentation/ForgotPasswordForm";
import { VerifyCodeForm } from "@/modules/Auth/presentation/VerifyCodeForm";
import { ResetPasswordForm } from "@/modules/Auth/presentation/ResetPasswordForm";
import { SuccessResetForm } from "@/modules/Auth/presentation/SuccessResetForm";
import { VerifyEmailPage } from "@/modules/Auth/presentation/VerifyEmailPage";
import { CompleteWorkerProfileForm } from "@/modules/workers/presentation/CompleteWorkerProfileForm";
import { CreateBasicServiceForm } from "@/modules/Services/presentation/CreateBasicServiceForm";

// Dashboard
import { DashboardLayout } from "@/modules/Dashboard/infra/layouts/DashboardLayout";
import { DashboardHomePage } from "@/modules/Dashboard/presentation/pages/DashboardHomePage";
import { DashboardCategoriesPage } from "@/modules/Dashboard/presentation/pages/DashboardCategoriesPage";
import { DashboardCategoryDetailPage } from "@/modules/Dashboard/presentation/pages/DashboardCategoryDetailPage";
import { DashboardRequestsPage } from "@/modules/Dashboard/presentation/pages/DashboardRequestsPage";
import { DashboardChatsPage } from "@/modules/Dashboard/presentation/pages/DashboardChatsPage";
import { DashboardHelpPage } from "@/modules/Dashboard/presentation/pages/DashboardHelpPage";
import { DashboardSettingsPage } from "@/modules/Dashboard/presentation/pages/DashboardSettingsPage";
import { ClientCreateRequestForm } from "@/modules/ServiceRequests/presentation/ClientCreateRequestForm";

// Guards
import { ProtectedRoute } from "@/shared/infra/guards/ProtectedRoute";
import { PublicRoute } from "@/shared/infra/guards/PublicRoute";
import { RoleProtectedRoute } from "@/shared/infra/guards/RoleProtectedRoute";

// Constantes de rutas
import { ROUTES } from "@/shared/constants/routes.constants";
import { DashboardServiceEditPage } from "@/modules/Dashboard/presentation/pages/DashboardServiceEditPage";
import { DashboardServicesPage } from "@/modules/Dashboard/presentation/pages/DashboardServicesPage";
import { DashboardRequestDetailPage } from "@/modules/Dashboard/presentation/pages/DashboardRequestDetailPage";
import { WorkerProfilePage } from "@/modules/workers/presentation/pages/WorkerProfilePage";
import { WorkersListPage } from "@/modules/workers/presentation/pages/WorkersListPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - accesibles sin autenticación */}
        <Route path={ROUTES.PUBLIC.HOME} element={<HomePage />} />
        <Route path="/workers" element={<WorkersListPage />} />
        <Route path="/worker/:id" element={<WorkerProfilePage />} />

        {/* Rutas de autenticación - redirigen si ya estás logueado */}
        <Route
          path={ROUTES.PUBLIC.LOGIN}
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.PUBLIC.REGISTER}
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />

        {/* Rutas de recuperación de contraseña - públicas pero pueden requerir token */}
        <Route path={ROUTES.PUBLIC.FORGOT_PASSWORD} element={<ForgotPasswordForm />} />
        <Route path={ROUTES.PUBLIC.VERIFY_CODE} element={<VerifyCodeForm />} />
        <Route path={ROUTES.PUBLIC.RESET_PASSWORD} element={<ResetPasswordForm />} />
        <Route path={ROUTES.PUBLIC.RESET_SUCCESS} element={<SuccessResetForm />} />
        
        {/* Verificación de email */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Rutas protegidas del Dashboard */}
        <Route
          path={ROUTES.DASHBOARD.HOME}
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="categories" element={<DashboardCategoriesPage />} />
          <Route path="categories/:id" element={<DashboardCategoryDetailPage />} />
          <Route path="requests" element={<DashboardRequestsPage />} />
          <Route path="requests/:id" element={<DashboardRequestDetailPage />} />
          <Route
            path="requests/new"
            element={
              <RoleProtectedRoute requiredRole="usuario">
                <ClientCreateRequestForm />
              </RoleProtectedRoute>
            }
          />
          <Route path="chats" element={<DashboardChatsPage />} />
          <Route path="help" element={<DashboardHelpPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
          <Route
            path="services"
            element={
              <RoleProtectedRoute requiredRole="trabajador">
                <DashboardServicesPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="services/new"
            element={
              <RoleProtectedRoute requiredRole="trabajador">
                <CreateBasicServiceForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="services/:id/edit"
            element={
              <RoleProtectedRoute requiredRole="trabajador">
                <DashboardServiceEditPage />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Rutas protegidas por rol - solo para trabajadores */}
        <Route
          path={ROUTES.WORKER.CREATE_SERVICE}
          element={
            <RoleProtectedRoute requiredRole="trabajador">
              <CreateBasicServiceForm />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WORKER.COMPLETE_PROFILE}
          element={
            <RoleProtectedRoute requiredRole="trabajador">
              <CompleteWorkerProfileForm />
            </RoleProtectedRoute>
          }
        />

        {/* Ruta por defecto - redirige a home */}
        <Route path="*" element={<Navigate to={ROUTES.PUBLIC.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
