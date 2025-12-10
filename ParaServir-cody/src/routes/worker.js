import {Router} from "express";
import { list, watch, upsertProfile, createServices, getWorkerServices, updateService, deleteService } from "../controllers/worker.js";
import { auth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get('/list', auth, list);
router.get('/watch/:id', auth,  watch);

// Onboarding/actualización del perfil de trabajador
router.post('/profile', auth, requireRole('trabajador'), upsertProfile);

// Servicios de trabajador
router.get('/:id/services', auth, getWorkerServices);
router.post('/services', auth, requireRole('trabajador'), createServices);
router.put('/services/:id', auth, requireRole('trabajador'), updateService);
router.delete('/services/:id', auth, requireRole('trabajador'), deleteService);

export default router;