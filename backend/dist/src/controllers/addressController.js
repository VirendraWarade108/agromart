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
exports.getDefaultAddress = exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddressById = exports.getUserAddresses = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const addressService = __importStar(require("../services/addressService"));
/**
 * Get all user addresses
 * GET /api/users/addresses
 */
exports.getUserAddresses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const addresses = await addressService.getUserAddresses(userId);
    res.json({
        success: true,
        data: addresses,
    });
});
/**
 * Get single address by ID
 * GET /api/users/addresses/:id
 */
exports.getAddressById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const address = await addressService.getAddressById(id, userId);
    res.json({
        success: true,
        data: address,
    });
});
/**
 * Create new address
 * POST /api/users/addresses
 */
exports.createAddress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { fullName, phone, addressLine, city, state, pincode, country, isDefault } = req.body;
    // Validation
    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
        });
    }
    const address = await addressService.createAddress(userId, {
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode,
        country,
        isDefault,
    });
    res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: address,
    });
});
/**
 * Update address
 * PUT /api/users/addresses/:id
 */
exports.updateAddress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const { fullName, phone, addressLine, city, state, pincode, country, isDefault } = req.body;
    const address = await addressService.updateAddress(id, userId, {
        fullName,
        phone,
        addressLine,
        city,
        state,
        pincode,
        country,
        isDefault,
    });
    res.json({
        success: true,
        message: 'Address updated successfully',
        data: address,
    });
});
/**
 * Delete address
 * DELETE /api/users/addresses/:id
 */
exports.deleteAddress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const address = await addressService.deleteAddress(id, userId);
    res.json({
        success: true,
        message: 'Address deleted successfully',
        data: address,
    });
});
/**
 * Set address as default
 * PUT /api/users/addresses/:id/default
 */
exports.setDefaultAddress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const address = await addressService.setDefaultAddress(id, userId);
    res.json({
        success: true,
        message: 'Default address updated',
        data: address,
    });
});
/**
 * Get default address
 * GET /api/users/addresses/default
 */
exports.getDefaultAddress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const address = await addressService.getDefaultAddress(userId);
    if (!address) {
        return res.status(404).json({
            success: false,
            message: 'No default address found',
        });
    }
    res.json({
        success: true,
        data: address,
    });
});
