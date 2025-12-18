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
const addressController = __importStar(require("../controllers/addressController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * All address routes require authentication
 */
// Get default address (must be before /:id to avoid route conflict)
router.get('/default', auth_1.authenticate, addressController.getDefaultAddress);
// Get all user addresses
router.get('/', auth_1.authenticate, addressController.getUserAddresses);
// Get single address
router.get('/:id', auth_1.authenticate, addressController.getAddressById);
// Create new address
router.post('/', auth_1.authenticate, addressController.createAddress);
// Update address
router.put('/:id', auth_1.authenticate, addressController.updateAddress);
// Set address as default
router.put('/:id/default', auth_1.authenticate, addressController.setDefaultAddress);
// Delete address
router.delete('/:id', auth_1.authenticate, addressController.deleteAddress);
exports.default = router;
