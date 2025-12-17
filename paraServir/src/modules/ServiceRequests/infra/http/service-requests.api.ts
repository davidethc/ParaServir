import { http } from "./api";
import type { CreateServiceRequestDTO } from "../../application/dto/create-service-request.dto";

export const ServiceRequestsAPI = {
  create: (data: CreateServiceRequestDTO) =>
    http.post("/service-requests/create", data),

  getMyRequests: () =>
    http.get("/service-requests/my"),
};
