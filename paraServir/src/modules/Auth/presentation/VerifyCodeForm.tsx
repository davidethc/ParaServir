import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Alert } from "@/shared/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { Input } from "@/shared/components/ui/input";

export function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    // Auto-focus next
    if (value && idx < 3) {
      const next = document.getElementById(`code-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.some((c) => c === "")) {
      setError("Debes ingresar el código completo");
      return;
    }
    navigate(ROUTES.PUBLIC.RESET_PASSWORD);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center w-full mt-12">
        <img src="src/shared/Assets/logo_servir.png" alt="Logo ParaServir" className="w-32 h-32 object-contain mb-2" />
        <h2 className="text-2xl font-bold text-center mb-2">Verificación de código</h2>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Te hemos enviado un código de verificación al correo <span className="font-medium">usuario@correo.com</span>. <Link to="#" className="text-red-500">¿Correo incorrecto?</Link>
        </p>
        <Card className="w-full max-w-md p-8 shadow-none border-none flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div className="flex gap-2 mb-2" role="group" aria-label="Código de verificación">
              {code.map((c, i) => (
                <div key={i}>
                  <label htmlFor={`code-${i}`} className="sr-only">
                    Dígito {i + 1} del código de verificación
                  </label>
                  <Input
                    id={`code-${i}`}
                    name={`code-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={c}
                    onChange={e => handleChange(i, e.target.value)}
                    className={`w-14 h-14 text-center text-xl border-2 ${c ? 'border-green-500' : 'border-gray-200'}`}
                    aria-label={`Dígito ${i + 1} del código`}
                  />
                </div>
              ))}
            </div>
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" type="submit">
              Verificar
            </Button>
          </form>
        </Card>
      </div>
      <footer className="text-xs text-gray-400 text-center mt-8 mb-2 w-full">
        © 2025 Todos los derechos reservados. <span className="mx-1">·</span>
        <Link to="#" className="hover:underline">Términos y Condiciones</Link> <span className="mx-1">·</span>
        <Link to="#" className="hover:underline">Política de Privacidad</Link>
      </footer>
    </div>
  );
}
