"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldFiles = exports.getUploadStats = exports.uploadMultipleImages = exports.uploadSingleImage = exports.deleteFile = exports.getFileUrl = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("../middleware/errorHandler");
const crypto_1 = __importDefault(require("crypto"));
// Ensure upload directories exist
const uploadDir = path_1.default.join(__dirname, '../../uploads');
const productImagesDir = path_1.default.join(uploadDir, 'products');
const reviewImagesDir = path_1.default.join(uploadDir, 'reviews');
const profileImagesDir = path_1.default.join(uploadDir, 'profiles');
[uploadDir, productImagesDir, reviewImagesDir, profileImagesDir].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
/**
 * Generate unique filename
 */
const generateFileName = (originalName) => {
    const ext = path_1.default.extname(originalName);
    const randomString = crypto_1.default.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${randomString}${ext}`;
};
/**
 * Multer storage configuration
 */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let dest = uploadDir;
        // Determine destination based on upload type
        if (req.path.includes('/products')) {
            dest = productImagesDir;
        }
        else if (req.path.includes('/reviews')) {
            dest = reviewImagesDir;
        }
        else if (req.path.includes('/profile')) {
            dest = profileImagesDir;
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const fileName = generateFileName(file.originalname);
        cb(null, fileName);
    },
});
/**
 * File filter - only images
 */
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errorHandler_1.AppError('Only image files are allowed (jpg, jpeg, png, gif, webp)', 400));
    }
};
/**
 * Multer upload middleware
 */
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});
/**
 * Get file URL
 */
const getFileUrl = (filename, type) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
};
exports.getFileUrl = getFileUrl;
/**
 * Delete file from disk
 */
const deleteFile = async (filename, type) => {
    const filePath = path_1.default.join(uploadDir, type, filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.deleteFile = deleteFile;
/**
 * Upload single image
 */
const uploadSingleImage = async (file, type) => {
    if (!file) {
        throw new errorHandler_1.AppError('No file provided', 400);
    }
    return {
        filename: file.filename,
        url: (0, exports.getFileUrl)(file.filename, type),
        size: file.size,
    };
};
exports.uploadSingleImage = uploadSingleImage;
/**
 * Upload multiple images
 */
const uploadMultipleImages = async (files, type) => {
    if (!files || files.length === 0) {
        throw new errorHandler_1.AppError('No files provided', 400);
    }
    return files.map((file) => ({
        filename: file.filename,
        url: (0, exports.getFileUrl)(file.filename, type),
        size: file.size,
    }));
};
exports.uploadMultipleImages = uploadMultipleImages;
/**
 * Get upload statistics
 */
const getUploadStats = async () => {
    const getDirectoryStats = (dir) => {
        if (!fs_1.default.existsSync(dir))
            return { count: 0, size: 0 };
        const files = fs_1.default.readdirSync(dir);
        const size = files.reduce((total, file) => {
            const filePath = path_1.default.join(dir, file);
            const stats = fs_1.default.statSync(filePath);
            return total + stats.size;
        }, 0);
        return { count: files.length, size };
    };
    const productsStats = getDirectoryStats(productImagesDir);
    const reviewsStats = getDirectoryStats(reviewImagesDir);
    const profilesStats = getDirectoryStats(profileImagesDir);
    return {
        totalFiles: productsStats.count + reviewsStats.count + profilesStats.count,
        totalSize: productsStats.size + reviewsStats.size + profilesStats.size,
        filesByType: {
            products: productsStats.count,
            reviews: reviewsStats.count,
            profiles: profilesStats.count,
        },
    };
};
exports.getUploadStats = getUploadStats;
/**
 * Clean up old files (optional - for maintenance)
 */
const cleanupOldFiles = async (daysOld = 30) => {
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    const cleanDirectory = (dir) => {
        if (!fs_1.default.existsSync(dir))
            return;
        const files = fs_1.default.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path_1.default.join(dir, file);
            const stats = fs_1.default.statSync(filePath);
            const age = now - stats.mtimeMs;
            if (age > maxAge) {
                fs_1.default.unlinkSync(filePath);
                deletedCount++;
            }
        });
    };
    cleanDirectory(productImagesDir);
    cleanDirectory(reviewImagesDir);
    cleanDirectory(profileImagesDir);
    return deletedCount;
};
exports.cleanupOldFiles = cleanupOldFiles;
