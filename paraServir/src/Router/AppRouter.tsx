import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { RegisterForm } from "@/modules/Auth/presentation/RegisterForm";
import { LoginForm } from "@/modules/Auth/presentation/LoginForm";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
