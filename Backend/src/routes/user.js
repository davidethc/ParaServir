import { Router } from "express";
import { list, watch, deleteUser, createUser, update } from "../controllers/user.js";

const router = Router();

router.get('/list', list);
router.get('/watch/:id', watch);
router.delete('/delete/:id', deleteUser);
router.post('/new', createUser);
router.put('/edit/:id', update);

export default router;