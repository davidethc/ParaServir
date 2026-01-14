import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { AuthFooter } from "@/shared/components/layout/AuthFooter";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Validaciones simples para demo
  const isLong = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || !confirm) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!(isLong && hasUpper && hasLower && hasNumber)) {
      setError("La contraseña no cumple los requisitos");
      return;
    }
    navigate(ROUTES.PUBLIC.RESET_SUCCESS);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center w-full mt-12">
        <img src="src/shared/Assets/logo_servir.png" alt="Logo ParaServir" className="w-32 h-32 object-contain mb-2" />
        <h2 className="text-2xl font-bold text-center mb-2">Actualizar contraseña</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Crea tu nueva contraseña con un mínimo de 8 caracteres y una combinación de letras y números.
        </p>
        <Card className="w-full max-w-md p-8 shadow-none border-none">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <Label htmlFor="password" className="font-medium">Nueva contraseña <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929m14.142-14.142A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929" /></svg>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <span className={isLong ? "text-[hsl(var(--color-success))]" : "text-muted-foreground"}>● 8 caracteres</span>
                <span className={hasUpper ? "text-[hsl(var(--color-success))]" : "text-muted-foreground"}>● Letra mayúscula (A-Z)</span>
                <span className={hasNumber ? "text-[hsl(var(--color-success))]" : "text-muted-foreground"}>● Números (0-9)</span>
                <span className={hasLower ? "text-[hsl(var(--color-success))]" : "text-muted-foreground"}>● Letra minúscula (a-z)</span>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm" className="font-medium">Confirmar nueva contraseña <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Vuelve a escribir tu nueva contraseña"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929m14.142-14.142A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929" /></svg>
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </form>
        </Card>
      </div>
      <AuthFooter />
    </div>
  );
}
