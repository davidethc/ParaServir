import { Router } from "express";
import { createUser } from "../controllers/user.js";
import { login } from "../controllers/logger.js";

const router = Router();

router.post('/login', login);
router.post('/register', createUser);
// router.post('/logout', logout); // logout no está definido
// router.get('/protected', protect); // protect no está definido

export default router;