import { findCategoryId } from "./categoryMapper.js";

export async function insertService(client, workerId, serviceData) {
    if (!serviceData) {
        throw new Error("No se proporcionaron datos de servicio");
    }

    const { category_id, title, description, base_price } = serviceData || {};

    const categoryId = await findCategoryId(category_id);

    if (!categoryId) {
        throw new Error(`Categoría no encontrada: '${category_id}'`);
    }

    // Insertar servicio dentro de la transacción
    const result = await client.query(
        `INSERT INTO worker_services 
        (worker_id, category_id, title, description, base_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
            workerId,
            categoryId,
            title,
            description || null,
            base_price || null
        ]
    );

    if (result.rowCount === 0) {
        throw new Error("No se pudo insertar el servicio");
    }

    return result.rows[0];
}
