import { Router } from "express";
import { list, watch, deleteUser, createUser, update, getMe } from "../controllers/user.js";
import { auth } from "../middlewares/auth.js";
import {verifyEmail} from "../controllers/logger.js";

const router = Router();

// Ruta pública para crear un nuevo usuario (registro)
router.post('/new', createUser);

// Rutas protegidas que requieren autenticación
router.get('/me', auth, getMe);
router.get('/list', auth, list);
router.get('/watch/:id', auth, watch);
router.delete('/delete/:id', auth, deleteUser);
router.put('/edit/:id', auth, update);

export default router;