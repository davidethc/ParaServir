import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "@/modules/Home/presentation/HomePage";
import { RegisterForm } from "@/modules/Auth/presentation/RegisterForm";
import { LoginForm } from "@/modules/Auth/presentation/LoginForm";
import { ForgotPasswordForm } from "@/modules/Auth/presentation/ForgotPasswordForm";
import { VerifyCodeForm } from "@/modules/Auth/presentation/VerifyCodeForm";
import { ResetPasswordForm } from "@/modules/Auth/presentation/ResetPasswordForm";
import { SuccessResetForm } from "@/modules/Auth/presentation/SuccessResetForm";
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

// Guards
import { ProtectedRoute } from "@/shared/infra/guards/ProtectedRoute";
import { PublicRoute } from "@/shared/infra/guards/PublicRoute";
import { RoleProtectedRoute } from "@/shared/infra/guards/RoleProtectedRoute";

// Constantes de rutas
import { ROUTES } from "@/shared/constants/routes.constants";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - accesibles sin autenticación */}
        <Route path={ROUTES.PUBLIC.HOME} element={<HomePage />} />

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
          <Route path="chats" element={<DashboardChatsPage />} />
          <Route path="help" element={<DashboardHelpPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
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
