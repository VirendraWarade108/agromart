"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Hash a plain text password
 *
 * Example: "mypassword123" → "$2a$10$N9qo8uLOickgx..."
 *
 * @param password - Plain text password
 * @returns Hashed password (safe to store in database)
 */
const hashPassword = async (password) => {
    const saltRounds = 10; // Higher = more secure but slower
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * Compare a plain text password with a hashed password
 *
 * Used during login to check if user entered correct password
 *
 * @param password - Plain text password (what user entered)
 * @param hashedPassword - Hashed password (from database)
 * @returns true if passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
