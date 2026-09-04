import mongoose from 'mongoose';
import { config } from './index.js';
import { log } from '../utils/logger.js';

class Database {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) {
            log.info('Database already connected');
            return this.connection;
        }

        try {
        log.info('Connecting to MongoDB...');

        const options = {
            ...config.database.options,
            autoIndex: config.isDevelopment,
            autoCreate: config.isDevelopment
        };

        this.connection = await mongoose.connect(config.database.uri, options);

        this.isConnected = true;

        // Set up connection event listeners
        mongoose.connection.on('connected', () => {
            log.info('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            log.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            log.warn('MongoDB disconnected');
            this.isConnected = false;
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });

        return this.connection;
        } catch (error) {
            log.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        if (!this.isConnected) {
            return;
        }

        try {
            log.info('Disconnecting from MongoDB...');
            await mongoose.disconnect();
            this.isConnected = false;
            log.info('MongoDB disconnected successfully');
        } catch (error) {
            log.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getConnection() {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        return this.connection;
    }

    isConnectedToDb() {
        return this.isConnected;
    }

  // Health check
    async healthCheck() {
        if (!this.isConnected) {
            return { status: 'disconnected', error: 'Database not connected' };
        }

        try {
            await mongoose.connection.db.admin().ping();
            return { status: 'connected' };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
}

// Singleton instance
const database = new Database();
export default database;