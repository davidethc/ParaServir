import validator from "validator";

export function validateUserData(data) {
  // Sanitizar datos (evita problemas por espacios u otros caracteres)
  const name = (data.name || "").trim();
  const surname = (data.surname || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const password = data.password || "";
  const role = (data.role || "").trim().toLowerCase();

  // Validaciones detalladas
  if (validator.isEmpty(name)) {
    throw new Error("El nombre no puede estar vacío.");
  }

  if(validator.isEmpty(surname)){
    throw new Error("Debe ingresar apellidos");
  }

  if (validator.isEmpty(email)) {
    throw new Error("El email no puede estar vacío.");
  }

  if (!validator.isEmail(email)) {
    throw new Error("El formato del correo electrónico no es válido.");
  }

  if (validator.isEmpty(password)) {
    throw new Error("La contraseña no puede estar vacía.");
  }

  if (!validator.isLength(password, { min: 8 })) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  if(validator.isEmpty(role)){
    throw new Error("Debemos saber quén es usted.")
  }

  // (Opcional) Exigir combinación de letras, números y símbolos
  if (!validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/)) {
    throw new Error("La contraseña debe incluir letras, números y un símbolo especial.");
  }

  return { name, surname, email, password, role };
}
