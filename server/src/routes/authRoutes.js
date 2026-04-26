const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/login',    AuthController.login);
router.post('/signup',   AuthController.signup);
router.post('/session',  AuthController.setSession);
router.get('/me',        authMiddleware, AuthController.me);
router.post('/logout',   AuthController.logout);
router.delete('/account', authMiddleware, AuthController.deleteAccount);

module.exports = router;
