import { isWorker } from "../helpers/isWorker.js";

export const requireWorker = async (req, res, next) => {
    try {
        const userId = req.user?.id; // viene del middleware auth

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "No hay usuario autenticado."
            });
        }

        const worker = await isWorker(userId);

        if (!worker) {
            return res.status(403).json({
                status: "error",
                message: "Solo los trabajadores pueden realizar esta acción."
            });
        }

        next();
    } catch (error) {
        console.error("Error en requireWorker:", error);
        return res.status(500).json({
            status: "error",
            message: "Error verificando rol de trabajador."
        });
    }
};
