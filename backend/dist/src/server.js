"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const PORT = env_1.env.PORT;
/**
 * Start server
 */
const server = app_1.default.listen(PORT, () => {
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${env_1.env.NODE_ENV}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Frontend URL: ${env_1.env.FRONTEND_URL}`);
    console.log('=================================');
});
/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});
exports.default = server;
