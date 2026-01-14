import { Router } from "express";
import { 
    getConversations, 
    getMessages, 
    sendMessage, 
    startConversation 
} from "../controllers/chat.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get('/conversations', auth, getConversations);
router.get('/:requestId/messages', auth, getMessages);
router.post('/:requestId/messages', auth, sendMessage);
router.post('/start', auth, startConversation);

export default router;

