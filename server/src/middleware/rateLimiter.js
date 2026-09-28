import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const createRateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || config.rateLimit.windowMs,
        max: options.max || config.rateLimit.max,
        message: {
            status: 'error',
            message: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            // Use user ID if available, otherwise IP
            return req.user?.id || req.ip;
        },
        ...options
    });
};

// Strict limiter for auth routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // 20 requests per window
});

// General API limiter
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});