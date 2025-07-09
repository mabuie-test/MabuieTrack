const express = require('express');
const router = express.Router();
const { createCommand, getCommands } = require('../controllers/commandController');
const authenticate = require('../middlewares/authenticateJWT');

router.post('/', authenticate, createCommand);
router.get('/', authenticate, getCommands);

module.exports = router;
