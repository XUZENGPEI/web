const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// 允许接收大体积 base64 图标数据
app.use(express.json({ limit: '10mb' }));

// 静态文件服务（直接渲染 index.html）
app.use(express.static(__dirname));

// ---------- API ----------

// 读取数据
app.get('/api/data', (req, res) => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            return res.json(JSON.parse(raw));
        }
        res.json({ navData: [], taskData: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 保存数据
app.post('/api/data', (req, res) => {
    try {
        const { navData, taskData } = req.body;
        if (!Array.isArray(navData) || !Array.isArray(taskData)) {
            return res.status(400).json({ error: '数据格式错误' });
        }
        const data = { navData, taskData, updatedAt: new Date().toISOString() };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------- 启动 ----------
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  网址导航 + 任务管理 服务器已启动');
    console.log('  http://localhost:' + PORT);
    console.log('  局域网访问: http://' + getLocalIP() + ':' + PORT);
    console.log('========================================');
});

function getLocalIP() {
    const os = require('os');
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}
