import { useState, type FormEvent } from "react";
import { useWorkerRegister } from "../hooks/useWorkerRegister";
import { cn } from "@/shared/lib/utils";
import { useAppSelector } from "@/shared/infrastructure/store/hooks";

interface WorkerRegisterFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function WorkerRegisterForm({ className, onSuccess }: WorkerRegisterFormProps) {
  const { register, isLoading, error, success } = useWorkerRegister();
  const user = useAppSelector((state) => state.user.user);
  
  const [formData, setFormData] = useState({
    serviceDescription: "",
    yearsExperience: 0,
    certificationUrl: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.id) {
      return;
    }

    // Generar ID único
    const id = crypto.randomUUID();

    await register({
      id,
      user_id: user.id,
      service_description: formData.serviceDescription,
      years_experience: formData.yearsExperience,
      certification_url: formData.certificationUrl || undefined,
      is_active: true,
      verification_status: 'pending',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'yearsExperience' ? parseInt(value) || 0 : value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del servicio
        </label>
        <textarea
          id="serviceDescription"
          name="serviceDescription"
          required
          rows={4}
          value={formData.serviceDescription}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe tu experiencia y los servicios que ofreces..."
        />
      </div>

      <div>
        <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
          Años de experiencia
        </label>
        <input
          id="yearsExperience"
          name="yearsExperience"
          type="number"
          required
          min="0"
          value={formData.yearsExperience}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="certificationUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL de certificación (opcional)
        </label>
        <input
          id="certificationUrl"
          name="certificationUrl"
          type="url"
          value={formData.certificationUrl}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">¡Registro exitoso! Redirigiendo...</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
      >
        {isLoading ? "Registrando..." : "Registrarse como Trabajador"}
      </button>
    </form>
  );
}

