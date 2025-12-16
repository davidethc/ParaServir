import { Router } from "express";
import { createUser } from "../controllers/user.js";
import { changePassword, login, logout, verifyEmail } from "../controllers/logger.js";
import { auth } from "../middlewares/auth.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

router.post('/login', login);
router.post('/register', createUser);
router.post('/logout', auth, logout); 
router.get('/verify-email', auth, verifyEmail);
router.put(
    '/change-password', 
    auth, 
    verifyOwnership('users', 'id', 'id'),
    changePassword
);

export default router;