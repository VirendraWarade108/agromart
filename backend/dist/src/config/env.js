"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
/**
 * Validates that required environment variables are set
 */
const validateEnv = () => {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file.');
    }
};
// Validate on import
validateEnv();
/**
 * Environment configuration
 * All environment variables accessed through this object
 */
exports.env = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    // Email (optional - for future use)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    // Helpers
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
};
exports.default = exports.env;
