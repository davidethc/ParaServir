import type { CreateServiceRequestDTO } from "../../application/dto/create-service-request.dto";
import { createServiceRequestUseCase } from "../../application/use-cases/create-service-request.use-case";


export function CreateServiceRequestForm() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data: CreateServiceRequestDTO = {
      // ⚠️ temporal, luego lo conectas a inputs reales
      service_id: "uuid-del-servicio",
      category_id: "uuid-de-la-categoria",
      description: "Descripción de prueba",
      address: "Dirección de prueba",
    };

    await createServiceRequestUseCase(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* inputs */}
      <button type="submit">Crear solicitud</button>
    </form>
  );
}
