import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const r = Router();

// 1) Adicione temporariamente esta rota PÚBLICA para registar o primeiro admin:
// r.post('/register', register);

// 2) Comente (ou remova) a rota protegida abaixo:
// habilitei
r.post('/register', authenticateJWT, authorizeRoles('admin'), register);

r.post('/login', login);
export default r;
