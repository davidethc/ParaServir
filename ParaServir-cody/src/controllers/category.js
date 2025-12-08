import { pool } from "../db.js";

export async function list(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, icon
       FROM service_categories
       ORDER BY name ASC`
    );

    return res.status(200).json({
      status: "success",
      rows,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "No se pudieron obtener las categorías",
      error: error.message,
    });
  }
}

