import validator from "validator";

export function validateUserData(body) {
  // Sanitizar y normalizar
  const rawFull = (body.full_name || body.first_name || body.name || "").trim();
  const phoneRaw = String(body.phone || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const role = (body.role || "").trim().toLowerCase();
  const location = (body.location || "").trim();
  const cedula = (body.cedula || "").trim();
  const avatar_url = (body.avatar_url || body.avatar || "").trim();

  if (validator.isEmpty(rawFull)) {
    throw new Error("El nombre no puede estar vacío.");
  }

  // split nombre/apellidos
  const parts = rawFull.split(/\s+/);
  const first_name = parts.shift();
  const last_name = parts.join(" ") || "";

  // teléfono: admitir solo dígitos (sin +)
  const digitsOnly = phoneRaw.replace(/[^\d]/g, "");
  if (!validator.isLength(digitsOnly, { min: 8, max: 15 })) {
    throw new Error("El número de teléfono debe tener entre 8 y 15 dígitos.");
  }
  if (!validator.isInt(digitsOnly)) {
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
  if (!validator.isLength(password, { min: 8 })) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }
  if (!validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/)) {
    throw new Error("La contraseña debe incluir letras, números y un símbolo especial.");
  }

  if (validator.isEmpty(role)) {
    throw new Error("Debemos saber quién es usted.");
  }

  return {
    first_name,
    last_name,
    cedula: cedula || null,
    phone: digitsOnly,
    email,
    password,
    role,
    location: location || null,
    avatar_url: avatar_url || null,
  };
};