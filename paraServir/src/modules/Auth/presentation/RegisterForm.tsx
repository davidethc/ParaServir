import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert } from "@/shared/components/ui/alert";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !role) {
      setError("Todos los campos son obligatorios");
      return;
    }
    alert("Registro simulado: " + email + ", rol: " + role);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Regístrate gratis hoy</h2>
          {error && <Alert variant="destructive">{error}</Alert>}
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ejemplo@company.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <Input
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Ej: trabajador, empresa"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Crear cuenta
          </Button>
        </form>
      </Card>
    </div>
  );
}
