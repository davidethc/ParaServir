import validator from "validator";

export function validateEmployeeData(data){
    const titles = (data.titles || "").trim()
    const description = (data.description || "").trim()
    const ocupation = (data.ocupation || "").trim()
    const documentation = (data.documentation || "").trim()
    if(validator.isEmpty(titles)){
        throw new Error("Falta ingresar su título profesional");
    }
    if(validator.isEmpty(ocupation)){
        throw new Error("Falta ingresar su ocupación principal (almenos 1)");
    }
    if(validator.isEmpty(documentation)){
        throw new Error("Es obligatorio saber su experiencia");
    }
    return{
        titles,
        description: description|| null,
        ocupation,
        documentation
    };
}