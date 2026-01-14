import { Router } from "express";
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} from "../controllers/notification.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get('/', auth, getUserNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);

export default router;
