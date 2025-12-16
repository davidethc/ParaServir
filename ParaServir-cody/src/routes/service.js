import { Router } from "express";
import { createServices, listService, watchService, deleteService, updateService, available } from "../controllers/service.js";
import { auth } from "../middlewares/auth.js";
import { requireWorker } from "../middlewares/requireWorker.js";
import { validateService } from "../middlewares/validateService.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

router.post(
    '/create', 
    auth, 
    requireWorker, 
    validateService, 
    createServices
);
router.get('/list', auth, listService);
router.get('/watch/:id', auth, watchService);
router.delete(
    '/delete/:id', 
    auth, 
    verifyOwnership('worker_services', 'worker_id'), 
    requireWorker, 
    deleteService
);
router.put(
    '/update/:id', 
    auth, 
    verifyOwnership('worker_services', 'id', 'worker_id'),
    requireWorker, 
    validateService, 
    updateService
);
router.put(
    '/change_status/:id', 
    auth,
    verifyOwnership('worker_services', 'id', 'worker_id'),
    requireWorker, 
    available);

export default router; 