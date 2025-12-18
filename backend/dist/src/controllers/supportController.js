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
exports.deleteFAQ = exports.updateFAQ = exports.createFAQ = exports.getFAQCategories = exports.getFAQById = exports.getAllFAQs = exports.getNewsletterStats = exports.getAllSubscribers = exports.unsubscribeFromNewsletter = exports.subscribeToNewsletter = exports.deleteContactMessage = exports.updateMessageStatus = exports.getAllContactMessages = exports.submitContactMessage = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const supportService = __importStar(require("../services/supportService"));
// ============================================
// CONTACT MESSAGE ENDPOINTS
// ============================================
/**
 * Submit contact message
 * POST /api/support/contact
 */
exports.submitContactMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    // Validate required fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, subject, and message are required',
        });
    }
    const contactMessage = await supportService.submitContactMessage({
        name,
        email,
        phone,
        subject,
        message,
    });
    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.',
        data: contactMessage,
    });
});
/**
 * Get all contact messages (Admin)
 * GET /api/admin/support/messages
 */
exports.getAllContactMessages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await supportService.getAllContactMessages({
        status: status,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
    });
});
/**
 * Update message status (Admin)
 * PUT /api/admin/support/messages/:id
 */
exports.updateMessageStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required',
        });
    }
    const message = await supportService.updateMessageStatus(id, status);
    res.json({
        success: true,
        message: 'Message status updated',
        data: message,
    });
});
/**
 * Delete message (Admin)
 * DELETE /api/admin/support/messages/:id
 */
exports.deleteContactMessage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await supportService.deleteContactMessage(id);
    res.json({
        success: true,
        message: result.message,
    });
});
// ============================================
// NEWSLETTER ENDPOINTS
// ============================================
/**
 * Subscribe to newsletter
 * POST /api/support/newsletter/subscribe
 */
exports.subscribeToNewsletter = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }
    const subscription = await supportService.subscribeToNewsletter(email);
    res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: subscription,
    });
});
/**
 * Unsubscribe from newsletter
 * POST /api/support/newsletter/unsubscribe
 */
exports.unsubscribeFromNewsletter = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }
    const subscription = await supportService.unsubscribeFromNewsletter(email);
    res.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: subscription,
    });
});
/**
 * Get all subscribers (Admin)
 * GET /api/admin/support/newsletter
 */
exports.getAllSubscribers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isActive, page, limit } = req.query;
    const result = await supportService.getAllSubscribers({
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.subscribers,
        pagination: result.pagination,
    });
});
/**
 * Get newsletter stats (Admin)
 * GET /api/admin/support/newsletter/stats
 */
exports.getNewsletterStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await supportService.getNewsletterStats();
    res.json({
        success: true,
        data: stats,
    });
});
// ============================================
// FAQ ENDPOINTS
// ============================================
/**
 * Get all FAQs
 * GET /api/support/faqs
 */
exports.getAllFAQs = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category } = req.query;
    const faqs = await supportService.getAllFAQs(category);
    res.json({
        success: true,
        count: faqs.length,
        data: faqs,
    });
});
/**
 * Get FAQ by ID
 * GET /api/support/faqs/:id
 */
exports.getFAQById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const faq = await supportService.getFAQById(id);
    res.json({
        success: true,
        data: faq,
    });
});
/**
 * Get FAQ categories
 * GET /api/support/faqs/categories
 */
exports.getFAQCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const categories = await supportService.getFAQCategories();
    res.json({
        success: true,
        data: categories,
    });
});
/**
 * Create FAQ (Admin)
 * POST /api/admin/support/faqs
 */
exports.createFAQ = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { question, answer, category, order, isActive } = req.body;
    if (!question || !answer || !category) {
        return res.status(400).json({
            success: false,
            message: 'Question, answer, and category are required',
        });
    }
    const faq = await supportService.createFAQ({
        question,
        answer,
        category,
        order,
        isActive,
    });
    res.status(201).json({
        success: true,
        message: 'FAQ created successfully',
        data: faq,
    });
});
/**
 * Update FAQ (Admin)
 * PUT /api/admin/support/faqs/:id
 */
exports.updateFAQ = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { question, answer, category, order, isActive } = req.body;
    const faq = await supportService.updateFAQ(id, {
        question,
        answer,
        category,
        order,
        isActive,
    });
    res.json({
        success: true,
        message: 'FAQ updated successfully',
        data: faq,
    });
});
/**
 * Delete FAQ (Admin)
 * DELETE /api/admin/support/faqs/:id
 */
exports.deleteFAQ = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await supportService.deleteFAQ(id);
    res.json({
        success: true,
        message: result.message,
    });
});
