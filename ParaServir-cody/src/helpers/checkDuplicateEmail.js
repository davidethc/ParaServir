import { pool } from "../db.js";

/**
 * Verifica si ya existe un usuario con el email proporcionado
 * @param {string} email - El email a verificar
 * @returns {Promise<boolean>} - true si existe, false si no
 */
export async function checkDuplicateEmail(email) {
  try {
    const query = `
      SELECT 1 FROM users 
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows.length > 0; // true si ya existe
  } catch (error) {
    console.error("Error al verificar duplicado de email:", error.message);
    throw new Error("Error en la verificación de email");
  }
}
