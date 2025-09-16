const pool = require('./db');
const fs = require('fs');
const path = require('path');

const initDB = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('数据库表创建成功');
  } catch (error) {
    console.error('初始化数据库失败:', error);
  }
};

initDB();