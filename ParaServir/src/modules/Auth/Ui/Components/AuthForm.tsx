import { FC } from "react";
import { Card, CardContent } from "@/shared/Components/ui/card";
import { Form, FormField } from "@/shared/Components/ui/form";
import { Input } from "@/shared/Components/ui/input";
import { Button } from "@/shared/Components/ui/button";
import { Label } from "@/shared/Components/ui/label";

interface AuthFormProps {
  type: "login" | "register";
  onSubmit: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
}

export const AuthForm: FC<AuthFormProps> = ({ type, onSubmit, loading, error }) => {
  // Aquí puedes usar react-hook-form o tu lógica preferida
  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardContent>
        <Form>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" required className="mt-1" />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" name="password" required className="mt-1" />
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cargando..." : type === "login" ? "Iniciar sesión" : "Registrarse"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};
