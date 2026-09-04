import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: join(__dirname, '../../', envFile) });

// Validate required environment variables
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const config = {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',

    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
        host: process.env.HOST || '0.0.0.0'
    },

    database: {
        uri: process.env.MONGODB_URI,
        options: process.env.MONGODB_OPTIONS ? JSON.parse(process.env.MONGODB_OPTIONS) : {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000
        }
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },

    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
        optionsSuccessStatus: 200
    },

    rateLimit: {
        windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15) * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
    },

    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/combined.log',
        errorFile: process.env.ERROR_LOG_FILE || 'logs/error.log'
    },

    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.FROM_EMAIL || 'noreply@flocksapp.com'
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
};

export default config;