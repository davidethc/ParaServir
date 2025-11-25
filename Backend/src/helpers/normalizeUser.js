import { validateUserData } from "./validateUser.js";
import { validateWorkerData } from "./validateWorker.js";

export function normalizeUserInput(body) {
  // 1. Validar usuario
  const userData = validateUserData(body);

  // 2. Si no es empleado, devuelves solo user
  if (userData.role !== "worker") {
    return {
      user: userData,
      employee: null
    };
  }

  // 3. Si es empleado, validas la info extra
  const workerData = validateWorkerData(body);

  return {
    user: userData,
    worker: workerData
  };
}
