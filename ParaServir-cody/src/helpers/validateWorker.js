import validator from "validator";

export function validateWorkerData(data) {
    const years_experience = data.years_experience != null ? Number(data.years_experience) : 0;
    const certification_url = (data.certification_url || "").trim();
    const verification_status = (data.verification_status || "").trim();
    const is_active = data.is_active == null ? true : Boolean(data.is_active);

    if (!Number.isInteger(years_experience) || years_experience < 0) {
        throw new Error("La experiencia en años debe ser un número entero no negativo");
    }

    // certification_url puede ser opcional, pero si viene validar formato básico
    if (certification_url && !validator.isURL(certification_url)) {
        throw new Error("La URL de certificación no es válida");
    }

    return {
        years_experience,
        certification_url: certification_url || null,
        verification_status: verification_status || "pending",
        is_active
    };
}