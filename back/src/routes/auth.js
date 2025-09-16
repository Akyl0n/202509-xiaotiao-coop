const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateSendCode, validateResetPassword, validateForgotPassword } = require('../middlewares/validator.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

// 发送验证码
router.post('/send-code', validateSendCode, authController.sendVerificationCode);

// 注册
router.post('/register', validateRegister, authController.register);

// 登录
router.post('/login', validateLogin, authController.login);

// 请求重置密码
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// 重置密码
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;