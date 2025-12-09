export function validateService(req, res, next) {
    const { category_id, title, description, base_price } = req.body;

    const errors = [];

    // category_id es OBLIGATORIO y debe ser string
    if (!category_id) {
        return res.status(400).json({
            status: "error",
            message: "category_id es obligatorio (nombre de la categoría)."
        });
    }

    if (typeof category_id !== 'string' || category_id.trim().length === 0) {
        return res.status(400).json({
            status: "error",
            message: "category_id debe ser un string con el nombre de la categoría (ej: 'electricidad', 'plomería')."
        });
    }

    // title es OBLIGATORIO
    if (!title || title.trim().length === 0) {
        errors.push("El título es obligatorio.");
    } else if (title.length < 3) {
        errors.push("El título debe tener al menos 3 caracteres.");
    }

    // description es OPCIONAL, pero si viene validar longitud
    if (description && description.trim().length > 0 && description.length < 10) {
        errors.push("La descripción debe tener al menos 10 caracteres si se proporciona.");
    }

    // base_price es OPCIONAL, pero si viene validar que sea número positivo
    if (base_price !== undefined && base_price !== null && base_price !== '') {
        if (isNaN(base_price) || Number(base_price) <= 0) {
            errors.push("El precio base debe ser un número mayor que 0.");
        }
    }

    // Si hay errores, detener la ejecución
    if (errors.length > 0) {
        return res.status(400).json({ 
            status: "error",
            errors 
        });
    }

    next();
}
