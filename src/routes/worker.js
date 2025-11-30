import {Router} from "express";
import { list, watch } from "../controllers/worker.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get('/list', auth, list);
router.get('/watch/:id', auth,  watch);

export default router;