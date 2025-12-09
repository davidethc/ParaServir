import {Router} from "express";
import { list, watch, upsertProfile, createServices } from "../controllers/worker.js";
import { auth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get('/list', auth, list);
router.get('/watch/:id', auth,  watch);

// Onboarding/actualización del perfil de trabajador
router.post('/profile', auth, requireRole('trabajador'), upsertProfile);

// Crear servicios (máx 3 en total por trabajador)
router.post('/services', auth, requireRole('trabajador'), createServices);

export default router;