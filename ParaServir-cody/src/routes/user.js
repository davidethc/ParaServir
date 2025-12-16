import { Router } from "express";
import { list, watch, deleteUser, createUser, update, getMe } from "../controllers/user.js";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

// Ruta pública para crear un nuevo usuario (registro)
router.post('/new', createUser);

// Rutas protegidas que requieren autenticación
router.get('/me', auth, getMe);
router.get('/list', auth, list);
router.get('/watch/:id', auth, watch);
router.delete(
    '/delete/:id', 
    auth, 
    verifyOwnership('users', 'id'),
    deleteUser
);
router.put('/edit/:id', 
    auth,
    verifyOwnership('users', 'id'), 
    update
);

export default router;