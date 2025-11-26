import {Router} from "Router";
import { createUser } from "../controllers/user";

const router = Router();
app.post('/login', login);
app.post('/register', createUser);
app.post('/logout', logout);
app.get('/protected', protect);

export default router;