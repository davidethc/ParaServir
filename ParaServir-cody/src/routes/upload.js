import { Router } from "express";
import { uploadCertification, uploadAvatar, upload } from "../controllers/upload.js";
import { auth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Subir certificación (solo trabajadores)
router.post('/certification', auth, requireRole('trabajador'), upload.single('file'), uploadCertification);

// Subir avatar (cualquier usuario autenticado)
router.post('/avatar', auth, upload.single('file'), uploadAvatar);

export default router;
