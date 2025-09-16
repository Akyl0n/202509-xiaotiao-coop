/**
 * 生成6位数字验证码
 * @returns {string} 6位数字验证码
 */
function generateVerificationCode() {}

/**
 * 发送验证码邮件
 * @param {string} email - 接收验证码的邮箱地址
 * @param {string} code - 验证码
 * @returns {Promise<boolean>} 发送是否成功
 */
async function sendVerificationEmail(email, code) {}

/**
 * 发送密码重置邮件
 * @param {string} email - 接收重置链接的邮箱地址
 * @param {string} resetToken - 重置密码的token
 * @returns {Promise<boolean>} 发送是否成功
 */
async function sendPasswordResetEmail(email, resetToken) {}

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail
};