import validator from "validator";

export function validateUserData(body) {
  // Sanitizar y normalizar
  const rawFull = (body.full_name || body.first_name || body.name || "").trim();
  const phoneRaw = String(body.phone || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const roleRaw = (body.role || "").trim().toLowerCase();
  // Normalizar alias de rol
  const role = roleRaw === "client" ? "usuario"
             : roleRaw === "worker" ? "trabajador"
             : roleRaw;
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
  if (!["usuario", "trabajador", "admin"].includes(role)) {
    throw new Error("Rol inválido. Use usuario, trabajador o admin.");
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
}

/**
 * Valida datos de usuario para actualización
 * NO requiere password (es opcional)
 * NO requiere role (se mantiene el existente)
 */
export function validateUserUpdateData(body) {
  // Sanitizar y normalizar
  const rawFull = (body.full_name || body.first_name || body.name || "").trim();
  const phoneRaw = String(body.phone || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || ""; // Opcional en actualización
  const location = (body.location || "").trim();
  const cedula = (body.cedula || "").trim();
  const avatar_url = (body.avatar_url || body.avatar || "").trim();

  // Validar nombre (puede venir como full_name o first_name + last_name)
  if (rawFull) {
    const parts = rawFull.split(/\s+/);
    var first_name = parts.shift();
    var last_name = parts.join(" ") || "";
  } else {
    // Si viene separado
    first_name = (body.first_name || "").trim();
    last_name = (body.last_name || "").trim();
  }

  if (!first_name || validator.isEmpty(first_name)) {
    throw new Error("El nombre no puede estar vacío.");
  }

  // teléfono: admitir solo dígitos (sin +)
  const digitsOnly = phoneRaw.replace(/[^\d]/g, "");
  if (digitsOnly && !validator.isLength(digitsOnly, { min: 8, max: 15 })) {
    throw new Error("El número de teléfono debe tener entre 8 y 15 dígitos.");
  }
  if (digitsOnly && !validator.isInt(digitsOnly)) {
    throw new Error("El número de teléfono debe ser numérico.");
  }

  if (!email || validator.isEmpty(email)) {
    throw new Error("El email no puede estar vacío.");
  }
  if (!validator.isEmail(email)) {
    throw new Error("El formato del correo electrónico no es válido.");
  }

  // Password es OPCIONAL en actualización, pero si se envía, debe ser válida
  if (password && password.length > 0) {
    if (!validator.isLength(password, { min: 8 })) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }
    if (!validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/)) {
      throw new Error("La contraseña debe incluir letras, números y un símbolo especial.");
    }
  }

  return {
    first_name,
    last_name: last_name || "",
    cedula: cedula || null,
    phone: digitsOnly || null,
    email,
    password: password || null, // null si no se envía
    location: location || null,
    avatar_url: avatar_url || null,
  };
}