import { Router } from "express";
import { createRequest, listRequests, getRequest, updateRequest, deleteRequest } from "../controllers/serviceRequest.js";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

// Todas las rutas requieren autenticación
router.post('/create', auth, createRequest);
router.get('/', auth, listRequests);
router.get('/:id', auth, getRequest);
router.put(
    '/:id', 
    auth, 
    verifyOwnership('service_requests', 'id', 'user_id'), 
    updateRequest);
router.delete(
    '/:id', 
    auth, 
    verifyOwnership('service_requests', 'id', 'user_id'), 
    deleteRequest
);

export default router;
