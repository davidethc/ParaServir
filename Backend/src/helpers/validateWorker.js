import validator from "validator";

export function validateWorkerData(data){
    const service_description = (data.service_description || "").trim()
    const years_experience = (data.years_experience)
    const certification_url = (data.certification_url || "").trim()
    if(validator.isEmpty(service_description)){
        throw new Error("Faltan ingresar sus detalles de servicio");
    }
    if (!validator.isInt(String(years_experience))) {
        throw new Error("Falta ingresar su experiencia en años");
    }

    if (validator.isEmpty(certification_url)) {
        throw new Error("La URL de certificación es obligatoria");
    }

    return{
        service_description, years_experience, certification_url
    };
}