const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } = require('./email.interface');

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

/**
 * 实现生成验证码接口
 * @implements {generateVerificationCode}
 */
function generateVerificationCodeImpl() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 实现发送验证码邮件接口
 * @implements {sendVerificationEmail}
 */
async function sendVerificationEmailImpl(email, code) {
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
}

/**
 * 实现发送密码重置邮件接口
 * @implements {sendPasswordResetEmail}
 */
async function sendPasswordResetEmailImpl(email, resetToken) {
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
}

module.exports = {
  generateVerificationCode: generateVerificationCodeImpl,
  sendVerificationEmail: sendVerificationEmailImpl,
  sendPasswordResetEmail: sendPasswordResetEmailImpl,
};