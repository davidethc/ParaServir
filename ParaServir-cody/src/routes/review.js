import { Router } from "express";
import { createReview, getWorkerReviews, getRequestReview, updateReview, deleteReview } from "../controllers/review.js";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

// Crear reseña (requiere auth)
router.post('/', auth, createReview);

// Obtener reseñas de un trabajador (público)
router.get('/worker/:workerId', getWorkerReviews);

// Obtener reseña de una solicitud (público)
router.get('/request/:requestId', getRequestReview);

// Actualizar y eliminar reseña (requiere auth)
router.put('/:id', auth, verifyOwnership('reviews', 'id', 'user_id'), updateReview);
router.delete('/:id', auth, verifyOwnership('reviews', 'id', 'user_id'), deleteReview);

export default router;
