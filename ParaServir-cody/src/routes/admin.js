import { Router } from "express";
import { getPendingWorkers, verifyWorker, getAdminDashboard } from "../controllers/admin.js";
import { auth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas requieren autenticación y rol admin
router.get('/dashboard', auth, requireRole('admin'), getAdminDashboard);
router.get('/workers/pending', auth, requireRole('admin'), getPendingWorkers);
router.put('/workers/:id/verify', auth, requireRole('admin'), verifyWorker);

export default router;
