require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Разрешаем CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// API Endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = await db.createUser(username, email, password);
        res.json({ success: true, userId });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.getUserByEmail(email);

        if (user && user.password === password) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Запуск сервера
(async () => {
    try {
        await db.initialize();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();