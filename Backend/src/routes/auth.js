import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const r = Router();
r.post('/register', authenticateJWT, authorizeRoles('admin'), register);
r.post('/login', login);
export default r;
