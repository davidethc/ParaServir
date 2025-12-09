import { Router } from "express";
import { list } from "../controllers/category.js";

const router = Router();

// Público: listado de categorías de servicio
router.get("/", list);

export default router;

