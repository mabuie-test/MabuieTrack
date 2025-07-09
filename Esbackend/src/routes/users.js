const express = require('express');
const router = express.Router();
const { getUsers, getUserById } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticateJWT');
const authorize = require('../middlewares/authorizeRoles');

router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);

module.exports = router;
