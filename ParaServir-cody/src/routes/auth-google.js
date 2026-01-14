import { Router } from "express";
import { googleAuth } from "../controllers/auth-google.js";

const router = Router();

router.post('/google', googleAuth);

export default router;
