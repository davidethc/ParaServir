import {Router} from "express";
import { list, watch, upsertProfile } from "../controllers/worker.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get('/list', auth, list);
router.get('/watch/:id', auth,  watch);

// Onboarding/actualización del perfil de trabajador
router.post('/profile', auth, upsertProfile);

export default router;