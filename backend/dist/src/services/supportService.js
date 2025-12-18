"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFAQCategories = exports.deleteFAQ = exports.updateFAQ = exports.createFAQ = exports.getFAQById = exports.getAllFAQs = exports.getNewsletterStats = exports.getAllSubscribers = exports.unsubscribeFromNewsletter = exports.subscribeToNewsletter = exports.deleteContactMessage = exports.updateMessageStatus = exports.getAllContactMessages = exports.submitContactMessage = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
// ============================================
// CONTACT MESSAGE FUNCTIONS
// ============================================
/**
 * Submit contact message
 */
const submitContactMessage = async (messageData) => {
    const contactMessage = await database_1.default.contactMessage.create({
        data: messageData,
    });
    return contactMessage;
};
exports.submitContactMessage = submitContactMessage;
/**
 * Get all contact messages (Admin)
 */
const getAllContactMessages = async (filters) => {
    const { status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    const [messages, total] = await Promise.all([
        database_1.default.contactMessage.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.contactMessage.count({ where }),
    ]);
    return {
        messages,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllContactMessages = getAllContactMessages;
/**
 * Update contact message status (Admin)
 */
const updateMessageStatus = async (messageId, status) => {
    const message = await database_1.default.contactMessage.update({
        where: { id: messageId },
        data: { status },
    });
    return message;
};
exports.updateMessageStatus = updateMessageStatus;
/**
 * Delete contact message (Admin)
 */
const deleteContactMessage = async (messageId) => {
    await database_1.default.contactMessage.delete({
        where: { id: messageId },
    });
    return { message: 'Contact message deleted successfully' };
};
exports.deleteContactMessage = deleteContactMessage;
// ============================================
// NEWSLETTER FUNCTIONS
// ============================================
/**
 * Subscribe to newsletter
 */
const subscribeToNewsletter = async (email) => {
    // Check if already subscribed
    const existing = await database_1.default.newsletter.findUnique({
        where: { email },
    });
    if (existing) {
        if (existing.isActive) {
            throw new errorHandler_1.AppError('Email already subscribed', 400);
        }
        else {
            // Reactivate subscription
            const updated = await database_1.default.newsletter.update({
                where: { email },
                data: {
                    isActive: true,
                    unsubscribedAt: null,
                },
            });
            return updated;
        }
    }
    // Create new subscription
    const subscription = await database_1.default.newsletter.create({
        data: { email },
    });
    return subscription;
};
exports.subscribeToNewsletter = subscribeToNewsletter;
/**
 * Unsubscribe from newsletter
 */
const unsubscribeFromNewsletter = async (email) => {
    const subscription = await database_1.default.newsletter.findUnique({
        where: { email },
    });
    if (!subscription) {
        throw new errorHandler_1.AppError('Email not found', 404);
    }
    const updated = await database_1.default.newsletter.update({
        where: { email },
        data: {
            isActive: false,
            unsubscribedAt: new Date(),
        },
    });
    return updated;
};
exports.unsubscribeFromNewsletter = unsubscribeFromNewsletter;
/**
 * Get all newsletter subscribers (Admin)
 */
const getAllSubscribers = async (filters) => {
    const { isActive, page = 1, limit = 50 } = filters || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (isActive !== undefined)
        where.isActive = isActive;
    const [subscribers, total] = await Promise.all([
        database_1.default.newsletter.findMany({
            where,
            skip,
            take: limit,
            orderBy: { subscribedAt: 'desc' },
        }),
        database_1.default.newsletter.count({ where }),
    ]);
    return {
        subscribers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllSubscribers = getAllSubscribers;
/**
 * Get newsletter statistics (Admin)
 */
const getNewsletterStats = async () => {
    const [totalSubscribers, activeSubscribers, unsubscribed] = await Promise.all([
        database_1.default.newsletter.count(),
        database_1.default.newsletter.count({ where: { isActive: true } }),
        database_1.default.newsletter.count({ where: { isActive: false } }),
    ]);
    return {
        totalSubscribers,
        activeSubscribers,
        unsubscribed,
    };
};
exports.getNewsletterStats = getNewsletterStats;
// ============================================
// FAQ FUNCTIONS
// ============================================
/**
 * Get all FAQs (Public)
 */
const getAllFAQs = async (category) => {
    const where = { isActive: true };
    if (category)
        where.category = category;
    const faqs = await database_1.default.fAQ.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return faqs;
};
exports.getAllFAQs = getAllFAQs;
/**
 * Get FAQ by ID (Public)
 */
const getFAQById = async (id) => {
    const faq = await database_1.default.fAQ.findUnique({
        where: { id },
    });
    if (!faq) {
        throw new errorHandler_1.AppError('FAQ not found', 404);
    }
    return faq;
};
exports.getFAQById = getFAQById;
/**
 * Create FAQ (Admin)
 */
const createFAQ = async (faqData) => {
    const faq = await database_1.default.fAQ.create({
        data: faqData,
    });
    return faq;
};
exports.createFAQ = createFAQ;
/**
 * Update FAQ (Admin)
 */
const updateFAQ = async (id, updateData) => {
    const faq = await database_1.default.fAQ.update({
        where: { id },
        data: updateData,
    });
    return faq;
};
exports.updateFAQ = updateFAQ;
/**
 * Delete FAQ (Admin)
 */
const deleteFAQ = async (id) => {
    await database_1.default.fAQ.delete({
        where: { id },
    });
    return { message: 'FAQ deleted successfully' };
};
exports.deleteFAQ = deleteFAQ;
/**
 * Get FAQ categories (Public)
 */
const getFAQCategories = async () => {
    const faqs = await database_1.default.fAQ.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
    });
    return faqs.map((f) => f.category);
};
exports.getFAQCategories = getFAQCategories;
