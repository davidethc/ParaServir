import validator from "validator";

export function validateWorkerData(data) {
    const years_experience = data.years_experience != null ? Number(data.years_experience) : 0;
    const certification_url = (data.certification_url || "").trim();
    const verification_status = (data.verification_status || "").trim();
    const is_active = data.is_active == null ? true : Boolean(data.is_active);

    // Opcional: datos del servicio que ofrece el trabajador
    const service_title = (data.service_title || data.title || "").trim();
    const service_description = (data.service_description || data.description || "").trim();
    const category_id = (data.category_id || "").trim(); // Nombre de categoría (string)
    const base_price = data.base_price != null ? Number(data.base_price) : null;

    if (!Number.isInteger(years_experience) || years_experience < 0) {
        throw new Error("La experiencia en años debe ser un número entero no negativo");
    }

    // certification_url puede ser opcional, pero si viene validar formato básico
    if (certification_url && !validator.isURL(certification_url)) {
        throw new Error("La URL de certificación no es válida");
    }

    // Validación opcional del servicio
    if (service_title && service_title.length < 3) {
        throw new Error("El título del servicio es demasiado corto");
    }

    if (service_description && service_description.length < 10) {
        throw new Error("La descripción del servicio es demasiado corta");
    }

    if (category_id && typeof category_id !== 'string') {
        throw new Error("El category_id debe ser un string con el nombre de la categoría");
    }

    if (base_price != null && (isNaN(base_price) || base_price < 0)) {
        throw new Error("El precio base del servicio no es válido");
    }

    return {
        years_experience,
        certification_url: certification_url || null,
        verification_status: verification_status || "pending",
        is_active,
        // datos opcionales del servicio
        service: service_title || service_description || category_id || base_price ? {
            title: service_title || null,
            description: service_description || null,
            category_id: category_id || null,
            base_price: base_price,
        } : null,
    };
}