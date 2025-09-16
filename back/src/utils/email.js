const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 生成验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送验证码邮件
const sendVerificationEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '验证码 - 小跳账号注册',
      html: `
        <h1>您好！</h1>
        <p>您的验证码是：<strong>${code}</strong></p>
        <p>验证码有效期为5分钟，请尽快使用。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
};

// 发送密码重置邮件
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '密码重置 - 小跳',
      html: `
        <h1>密码重置请求</h1>
        <p>您收到此邮件是因为您（或其他人）请求重置您的账户密码。</p>
        <p>请点击以下链接重置密码：</p>
        <p><a href="http://您的前端域名/reset-password?token=${resetToken}">重置密码</a></p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('发送重置密码邮件失败:', error);
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
};