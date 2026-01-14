import { Router } from "express";
import { createUser } from "../controllers/user.js";
import { login } from "../controllers/logger.js";
import { logout } from "../controllers/logger.js";
import { verifyEmail } from "../controllers/logger.js";
import { googleAuth } from "../controllers/auth-google.js";

const router = Router();

router.post('/login', login);
router.post('/register', createUser);
router.post('/logout', logout); 
router.get('/verify-email', verifyEmail);
router.post('/google', googleAuth);

export default router;