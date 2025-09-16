const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5分钟后过期
    
    // 检查邮箱是否已注册
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: '该邮箱已注册' });
    }
    
    // 存储验证码
    await pool.query(
      'INSERT INTO users (email, verification_code, verification_code_expires_at, password) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET verification_code = $2, verification_code_expires_at = $3',
      [email, code, expiresAt, 'temporary']
    );
    
    // 发送验证码邮件
    const sent = await sendVerificationEmail(email, code);
    if (!sent) {
      return res.status(500).json({ message: '发送验证码失败' });
    }
    
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, code } = req.body;
    
    // 验证验证码
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND verification_code = $2 AND verification_code_expires_at > NOW()',
      [email, code]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 更新用户信息
    await pool.query(
      'UPDATE users SET password = $1, is_verified = true, verification_code = null WHERE email = $2',
      [hashedPassword, email]
    );
    
    res.json({ message: '注册成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || !user.is_verified) {
      return res.status(401).json({ message: '用户不存在或未验证' });
    }
    
    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '密码错误' });
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 请求重置密码
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 查找用户
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 生成重置token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // 存储重置token
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires_at = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, user.id]
    );
    
    // 发送重置密码邮件
    const sent = await sendPasswordResetEmail(email, resetToken);
    if (!sent) {
      return res.status(500).json({ message: '发送重置邮件失败' });
    }
    
    res.json({ message: '重置密码邮件已发送' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 重置密码
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires_at > NOW()',
      [decoded.userId, token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await pool.query(
      'UPDATE users SET password = $1, reset_token = null, reset_token_expires_at = null WHERE id = $2',
      [hashedPassword, decoded.userId]
    );
    
    res.json({ message: '密码重置成功' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: '无效的重置链接' });
    }
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;