import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { RegisterForm } from "@/modules/Auth/presentation/RegisterForm";
import { LoginForm } from "@/modules/Auth/presentation/LoginForm";
import { ForgotPasswordForm } from "@/modules/Auth/presentation/ForgotPasswordForm";
import { VerifyCodeForm } from "@/modules/Auth/presentation/VerifyCodeForm";
import { ResetPasswordForm } from "@/modules/Auth/presentation/ResetPasswordForm";
import { SuccessResetForm } from "@/modules/Auth/presentation/SuccessResetForm";
import { HomePage } from "@/modules/Auth/presentation/HomePage";
import type { RootState } from "@/Store";

export function AppRouter() {
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

  const requireAuth = (element: React.ReactElement) =>
    isAuth ? element : <Navigate to="/login" replace />;

  const redirectIfAuth = (element: React.ReactElement) =>
    isAuth ? <Navigate to="/" replace /> : element;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={requireAuth(<HomePage />)} />
        <Route path="/login" element={redirectIfAuth(<LoginForm />)} />
        <Route path="/register" element={redirectIfAuth(<RegisterForm />)} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-code" element={<VerifyCodeForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/reset-success" element={<SuccessResetForm />} />
        <Route path="*" element={<Navigate to={isAuth ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
