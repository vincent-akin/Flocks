import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { log } from '../utils/logger.js';

/**
 * Generate access token
 */
export const generateAccessToken = (userId, organizationId) => {
    try {
        return jwt.sign(
            { userId, organizationId, type: 'access' },
            config.jwt.secret,
            { expiresIn: config.jwt.accessExpiry }
        );
    } catch (error) {
        log.error('Error generating access token:', error);
        throw error;
    }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId, organizationId) => {
    try {
        return jwt.sign(
            { userId, organizationId, type: 'refresh' },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiry }
        );
    } catch (error) {
        log.error('Error generating refresh token:', error);
        throw error;
    }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
    try {
            const decoded = jwt.verify(token, config.jwt.secret);
            if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            log.debug('Access token expired');
        } else {
            log.debug('Invalid access token:', error.message);
        }
        return null;
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwt.refreshSecret);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            log.debug('Refresh token expired');
        } else {
            log.debug('Invalid refresh token:', error.message);
        }
        return null;
    }
};

/**
 * Get token from authorization header
 */
export const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
};

/**
 * Get token from cookie
 */
export const getTokenFromCookie = (req) => {
    return req.cookies?.refreshToken || null;
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getTokenFromHeader,
    getTokenFromCookie
};