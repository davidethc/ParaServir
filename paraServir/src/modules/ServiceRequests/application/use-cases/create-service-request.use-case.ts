import type { CreateServiceRequestDTO } from "../dto/create-service-request.dto.ts";
import { ServiceRequestsAPI } from "../../infra/http/service-requests.api";

export const createServiceRequestUseCase = async (
  data: CreateServiceRequestDTO
) => {
  const response = await ServiceRequestsAPI.create(data);
  return response.data;
};
