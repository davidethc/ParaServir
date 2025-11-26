import validator from "validator";

export function validateUserData(body) {
  // Sanitizar datos
  const full_name = (body.full_name || "").trim();
  const phone = String(body.phone || "");
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const role = (body.role || "").trim().toLowerCase();
  const location = (body.location || "").trim().toLowerCase();

  // Validaciones detalladas
  if (validator.isEmpty(full_name)) {
    throw new Error("El nombre no puede estar vacío.");
  }

  // Teléfono debe ser número y con 10 dígitos
  if (!validator.isLength(phone, { min: 10, max: 10 })) {
    throw new Error("El número de teléfono debe tener 10 dígitos.");
  }

  if (!validator.isInt(phone)) {
    throw new Error("El número de teléfono debe ser numérico.");
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

  if (!validator.isLength(password, { min: 8, max: 15 })) {
    throw new Error("La contraseña debe tener entre 8 y 15 caracteres.");
  }

  if (validator.isEmpty(role)) {
    throw new Error("Debemos saber quién es usted.");
  }

  if (validator.isEmpty(location)) {
    throw new Error("Debe ingresar una ubicación.");
  }

  // Contraseña debe tener: letras + números + un símbolo
  if (!validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/)) {
    throw new Error("La contraseña debe incluir letras, números y un símbolo especial.");
  }

  return { full_name, phone, email, password, role, location };
};