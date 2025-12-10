import { Router } from "express";
import { createRequest, listRequests, getRequest, updateRequest, deleteRequest } from "../controllers/serviceRequest.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.post('/', auth, createRequest);
router.get('/', auth, listRequests);
router.get('/:id', auth, getRequest);
router.put('/:id', auth, updateRequest);
router.delete('/:id', auth, deleteRequest);

export default router;
