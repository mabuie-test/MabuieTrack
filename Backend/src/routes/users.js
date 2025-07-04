import { Router } from 'express';
import {
  listUsers, getUser, updateUser, deleteUser
} from '../controllers/userController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }    from '../middlewares/authorizeRoles.js';

const r = Router();
r.use(authenticateJWT, authorizeRoles('admin'));
r.get('/', listUsers);
r.get('/:id', getUser);
r.put('/:id', updateUser);
r.delete('/:id', deleteUser);
export default r;
