import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import { RegisterForm } from "@/modules/Auth/presentation/RegisterForm";
import { LoginForm } from "@/modules/Auth/presentation/LoginForm";
import { ForgotPasswordForm } from "@/modules/Auth/presentation/ForgotPasswordForm";
import { VerifyCodeForm } from "@/modules/Auth/presentation/VerifyCodeForm";
import { ResetPasswordForm } from "@/modules/Auth/presentation/ResetPasswordForm";
import { SuccessResetForm } from "@/modules/Auth/presentation/SuccessResetForm";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-code" element={<VerifyCodeForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/reset-success" element={<SuccessResetForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
