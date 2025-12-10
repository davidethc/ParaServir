import { Router } from "express";
import { createUser } from "../controllers/user.js";
import { login, logout, verifyEmail, changePassword } from "../controllers/logger.js";
import {auth} from "../middlewares/auth.js";

const router = Router();

router.post('/login', login);
router.post('/register', createUser);
router.post('/logout', auth, logout); 
router.get('/verify-email', auth, verifyEmail);
router.put('/change-password', auth, changePassword);

export default router;