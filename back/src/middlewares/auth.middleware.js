const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// 验证 JWT token 的中间件
const verifyToken = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    try {
      // 验证 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 从数据库获取用户信息
      const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [decoded.userId]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: '用户不存在' });
      }

      // 将用户信息添加到请求对象中
      req.user = result.rows[0];
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: '无效的认证令牌' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: '认证令牌已过期' });
      }
      throw error;
    }
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 可选的 JWT token 验证中间件（不强制要求认证）
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [decoded.userId]);
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    } catch (error) {
      // 如果token无效，继续处理请求但不设置用户信息
      console.error('可选认证失败:', error);
    }
    
    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};