import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "@/modules/Home/presentation/HomePage";
import { RegisterForm } from "@/modules/Auth/presentation/RegisterForm";
import { LoginForm } from "@/modules/Auth/presentation/LoginForm";
import { ForgotPasswordForm } from "@/modules/Auth/presentation/ForgotPasswordForm";
import { VerifyCodeForm } from "@/modules/Auth/presentation/VerifyCodeForm";
import { ResetPasswordForm } from "@/modules/Auth/presentation/ResetPasswordForm";
import { SuccessResetForm } from "@/modules/Auth/presentation/SuccessResetForm";
import { CompleteWorkerProfileForm } from "@/modules/workers/presentation/CompleteWorkerProfileForm";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/complete-worker-profile" element={<CompleteWorkerProfileForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-code" element={<VerifyCodeForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/reset-success" element={<SuccessResetForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
