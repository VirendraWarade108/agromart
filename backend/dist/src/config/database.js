"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
/**
 * Prisma Client Instance
 *
 * This is the main database connection used throughout the app.
 * We create a single instance and reuse it to avoid too many connections.
 */
const prisma = new client_1.PrismaClient({
    log: env_1.env.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
});
/**
 * Connect to database
 * Call this when server starts
 */
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1); // Exit if database connection fails
    }
};
exports.connectDatabase = connectDatabase;
/**
 * Disconnect from database
 * Call this when server shuts down
 */
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected');
    }
    catch (error) {
        console.error('❌ Error disconnecting database:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
    await (0, exports.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await (0, exports.disconnectDatabase)();
    process.exit(0);
});
exports.default = prisma;
