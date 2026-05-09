const express = require('express');
const { register, login, googleAuth } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

module.exports = router;
