"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultAddress = exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddressById = exports.getUserAddresses = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get all addresses for a user
 */
const getUserAddresses = async (userId) => {
    const addresses = await database_1.default.address.findMany({
        where: { userId },
        orderBy: [
            { isDefault: 'desc' }, // Default address first
            { createdAt: 'desc' },
        ],
    });
    return addresses;
};
exports.getUserAddresses = getUserAddresses;
/**
 * Get single address by ID
 */
const getAddressById = async (addressId, userId) => {
    const address = await database_1.default.address.findUnique({
        where: { id: addressId },
    });
    if (!address) {
        throw new errorHandler_1.AppError('Address not found', 404);
    }
    // Verify address belongs to user
    if (address.userId !== userId) {
        throw new errorHandler_1.AppError('Unauthorized to access this address', 403);
    }
    return address;
};
exports.getAddressById = getAddressById;
/**
 * Create new address
 */
const createAddress = async (userId, data) => {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
        await database_1.default.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }
    // If user has no addresses, make this one default
    const addressCount = await database_1.default.address.count({
        where: { userId },
    });
    const address = await database_1.default.address.create({
        data: {
            userId,
            fullName: data.fullName,
            phone: data.phone,
            addressLine: data.addressLine,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country || 'India',
            isDefault: data.isDefault || addressCount === 0,
        },
    });
    return address;
};
exports.createAddress = createAddress;
/**
 * Update address
 */
const updateAddress = async (addressId, userId, data) => {
    // Check if address exists and belongs to user
    const existingAddress = await (0, exports.getAddressById)(addressId, userId);
    // If setting as default, unset other defaults
    if (data.isDefault) {
        await database_1.default.address.updateMany({
            where: {
                userId,
                isDefault: true,
                id: { not: addressId }
            },
            data: { isDefault: false },
        });
    }
    const address = await database_1.default.address.update({
        where: { id: addressId },
        data,
    });
    return address;
};
exports.updateAddress = updateAddress;
/**
 * Delete address
 */
const deleteAddress = async (addressId, userId) => {
    // Check if address exists and belongs to user
    const address = await (0, exports.getAddressById)(addressId, userId);
    // If deleting default address, set another one as default
    if (address.isDefault) {
        const otherAddress = await database_1.default.address.findFirst({
            where: {
                userId,
                id: { not: addressId }
            },
        });
        if (otherAddress) {
            await database_1.default.address.update({
                where: { id: otherAddress.id },
                data: { isDefault: true },
            });
        }
    }
    await database_1.default.address.delete({
        where: { id: addressId },
    });
    return address;
};
exports.deleteAddress = deleteAddress;
/**
 * Set address as default
 */
const setDefaultAddress = async (addressId, userId) => {
    // Check if address exists and belongs to user
    await (0, exports.getAddressById)(addressId, userId);
    // Unset all other defaults
    await database_1.default.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
    });
    // Set this address as default
    const address = await database_1.default.address.update({
        where: { id: addressId },
        data: { isDefault: true },
    });
    return address;
};
exports.setDefaultAddress = setDefaultAddress;
/**
 * Get default address
 */
const getDefaultAddress = async (userId) => {
    const address = await database_1.default.address.findFirst({
        where: { userId, isDefault: true },
    });
    return address;
};
exports.getDefaultAddress = getDefaultAddress;
