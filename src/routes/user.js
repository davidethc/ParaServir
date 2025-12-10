import { Router } from "express";
import { list, watch, deleteUser, createUser, update} from "../controllers/user.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Ruta pública para crear un nuevo usuario (registro)
router.post('/new', createUser);

// Rutas protegidas que requieren autenticación
router.get('/list', auth, list);
router.get('/watch/:id', auth, watch);
router.delete('/delete/:id', auth, deleteUser);
router.put('/edit/:id', auth, update);

export default router;