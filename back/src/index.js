const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 导入路由
const authRoutes = require('./routes/auth');

// 配置环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});