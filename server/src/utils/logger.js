import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: []
});

// Add console transport
if (config.isDevelopment || config.isTest) {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat
        })
    );
} else {
  // Production - log to files
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    );

  // Also log to files in production
    logger.add(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );

    logger.add(
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );

  // Also log to JSON format for structured logging
    logger.add(
        new winston.transports.File({
            filename: path.join(logDir, 'combined.json'),
            format: winston.format.json(),
            maxsize: 5242880,
            maxFiles: 5
        })
    );
}

// Create stream for morgan
export const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Helper methods
export const log = {
    info: (message, meta = {}) => {
        logger.info(message, meta);
    },
    error: (message, meta = {}) => {
        logger.error(message, meta);
    },
    warn: (message, meta = {}) => {
        logger.warn(message, meta);
    },
    debug: (message, meta = {}) => {
        logger.debug(message, meta);
    },
    verbose: (message, meta = {}) => {
        logger.verbose(message, meta);
    },
  // Log API requests with performance data
    api: (req, res, responseTime) => {
        logger.info('API Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?._id
        });
    },
  // Log database operations
    db: (operation, collection, query, duration) => {
        logger.debug('Database Operation', {
            operation,
            collection,
            query,
            duration: `${duration}ms`
        });
    }
};

export default logger;