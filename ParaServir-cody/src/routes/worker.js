import {Router} from "express";
import { 
    list, 
    watch, 
    upsertProfile, 
    createServices, 
    getWorkerServices, 
    updateService, 
    deleteService,
    updateLocation,
    findNearbyWorkers,
    searchWorkersByLocation
} from "../controllers/worker.js";
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

// Geolocalización
router.put('/location', auth, updateLocation); // Actualizar ubicación (cualquier usuario autenticado)
router.get('/nearby', findNearbyWorkers); // Buscar trabajadores cercanos (público o autenticado)
router.get('/search', searchWorkersByLocation); // Buscar por ubicación textual (público o autenticado)

export default router;