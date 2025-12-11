import { Router } from "express";
import { createReview, getWorkerReviews, getRequestReview, updateReview, deleteReview } from "../controllers/review.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Crear reseña (requiere auth)
router.post('/', auth, createReview);

// Obtener reseñas de un trabajador (público)
router.get('/worker/:workerId', getWorkerReviews);

// Obtener reseña de una solicitud (público)
router.get('/request/:requestId', getRequestReview);

// Actualizar y eliminar reseña (requiere auth)
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

export default router;
