import { Router } from "express";
import { list, getById } from "../controllers/category.js";

const router = Router();

// Público: listado de categorías de servicio
// Query param: ?include_workers=true para incluir conteo de trabajadores
router.get("/", list);

// Público: detalle de una categoría con trabajadores asociados
router.get("/:id", getById);

export default router;

