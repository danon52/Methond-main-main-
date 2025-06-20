require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async initialize() {
        try {
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    phone VARCHAR(20) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    async createUser(email, phone, password, username) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await this.pool.query(
                'INSERT INTO users (email, phone, password, username) VALUES (?, ?, ?, ?)',
                [email, phone, hashedPassword, username]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const [rows] = await this.pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    async getUserByPhone(phone) {
        try {
            const [rows] = await this.pool.query(
                'SELECT * FROM users WHERE phone = ?',
                [phone]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user by phone:', error);
            throw error;
        }
    }

    async verifyUser(email, password) {
        try {
            const user = await this.getUserByEmail(email);
            if (!user) return false;
            const isMatch = await bcrypt.compare(password, user.password);
            return isMatch ? user : false;
        } catch (error) {
            console.error('Error verifying user:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}

// Создаем экземпляр базы данных
const db = new Database();

// Настройка Express сервера
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// API Endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { email, phone, password, username } = req.body;
        const userId = await db.createUser(email, phone, password, username);
        res.json({ success: true, userId });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.verifyUser(email, password);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Тестовый endpoint для проверки работы сервера
app.get('/api/test', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Функция для тестирования БД (может быть вызвана при необходимости)
async function testDatabase() {
    try {
        await db.initialize();

        const userId = await db.createUser(
            'test@example.com',
            '+1234567890',
            'securepassword123',
            'Test User'
        );
        console.log('Created user with ID:', userId);

        const userByEmail = await db.getUserByEmail('test@example.com');
        console.log('User by email:', userByEmail);

        const userByPhone = await db.getUserByPhone('+1234567890');
        console.log('User by phone:', userByPhone);

        const verifiedUser = await db.verifyUser('test@example.com', 'securepassword123');
        console.log('Verified user:', verifiedUser ? 'Success' : 'Failed');

        const failedVerification = await db.verifyUser('test@example.com', 'wrongpassword');
        console.log('Failed verification:', failedVerification ? 'Success' : 'Failed');

    } catch (error) {
        console.error('Error in test:', error);
    }
}

// Запуск сервера
(async () => {
    try {
        await db.initialize();

        // Раскомментируйте для выполнения тестов при запуске
        // await testDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        // Обработка graceful shutdown
        process.on('SIGTERM', async () => {
            await db.close();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();