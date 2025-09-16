// 验证邮箱格式
const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
};

// 验证密码强度
const validatePassword = (password) => {
  // 密码至少8位，包含数字和字母
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
};

// 注册请求验证
const validateRegister = (req, res, next) => {
  const { email, password, code } = req.body;

  if (!email || !password || !code) {
    return res.status(400).json({ message: '请提供所有必需的字段' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: '邮箱格式无效' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: '密码必须至少8位，且包含数字和字母' });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: '验证码必须是6位数字' });
  }

  next();
};

// 登录请求验证
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '请提供邮箱和密码' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: '邮箱格式无效' });
  }

  next();
};

// 发送验证码请求验证
const validateSendCode = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '请提供邮箱地址' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: '邮箱格式无效' });
  }

  next();
};

// 重置密码请求验证
const validateResetPassword = (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: '请提供所有必需的字段' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ message: '新密码必须至少8位，且包含数字和字母' });
  }

  next();
};

// 发送重置密码邮件请求验证
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '请提供邮箱地址' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: '邮箱格式无效' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSendCode,
  validateResetPassword,
  validateForgotPassword
};