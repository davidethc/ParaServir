import {Router} from "express";
import { list, watch } from "../controllers/worker.js";

const router = Router();

router.get('/list', list);
router.get('/watch/:id', watch);

export default router;