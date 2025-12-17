import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useProfileSettings } from "../../Hoks/useProfileSettings";


export function ProfileSettingsPage() {
  const { submit, loading, error, success, user } = useProfileSettings();

  const [form, setForm] = useState({
    email: user?.email || "",
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <Input name="first_name" onChange={handleChange} placeholder="Nombre" />
      <Input name="last_name" onChange={handleChange} placeholder="Apellido" />
      <Input name="phone" onChange={handleChange} placeholder="Teléfono" />
      <Input name="location" onChange={handleChange} placeholder="Ubicación" />
      <Input name="password" type="password" onChange={handleChange} placeholder="Nueva contraseña (opcional)" />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Perfil actualizado</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
