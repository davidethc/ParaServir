import { validateUserData } from "./validateUser.js";
import { validateEmployeeData } from "./validateEmployee.js";

export function normalizeUserInput(body) {
  // 1. Validar usuario
  const userData = validateUserData(body);

  // 2. Si no es empleado, devuelves solo user
  if (userData.role !== "employee") {
    return {
      user: userData,
      employee: null
    };
  }

  // 3. Si es empleado, validas la info extra
  const employeeData = validateEmployeeData(body);

  return {
    user: userData,
    employee: employeeData
  };
}
