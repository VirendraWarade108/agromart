"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController = __importStar(require("../controllers/blogController"));
const router = (0, express_1.Router)();
/**
 * All blog routes are public (no authentication required)
 */
/**
 * Get all blog posts
 * GET /api/blog
 */
router.get('/', blogController.getAllPosts);
/**
 * Get blog categories
 * GET /api/blog/categories
 */
router.get('/categories', blogController.getCategories);
/**
 * Get featured blog posts
 * GET /api/blog/featured
 */
router.get('/featured', blogController.getFeaturedPosts);
/**
 * Search blog posts
 * GET /api/blog/search?q=query
 */
router.get('/search', blogController.searchPosts);
/**
 * Get blog post by slug
 * GET /api/blog/slug/:slug
 */
router.get('/slug/:slug', blogController.getPostBySlug);
/**
 * Get blog post by ID
 * GET /api/blog/:id
 */
router.get('/:id', blogController.getPostById);
exports.default = router;
