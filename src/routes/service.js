import { Router } from "express";
import { createService, listServices, watchService } from "../controllers/service.js";
import { auth } from "../middlewares/auth.js";
import { requireWorker } from "../middlewares/requireWorker.js";
import { validateService } from "../middlewares/validateService.js";

const router = Router();

// Ruta protegida para crear un nuevo servicio
router.post('/create', auth, requireWorker, validateService, createService);
router.get('/list', auth, listServices);
router.get('/watch/:id', auth, watchService);

export default router; 