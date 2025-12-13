"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var body_parser_1 = require("body-parser");
var app = (0, express_1.default)();
var PORT = 5000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Products data
var products = [
    {
        id: 'p1',
        name: 'Premium Tomato Seeds',
        slug: 'premium-tomato-seeds',
        price: 199,
        originalPrice: 249,
        rating: 4.7,
        reviews: 34,
        image: '/images/products/tomato.jpg',
        images: ['/images/products/tomato.jpg'],
        description: 'High-yield hybrid tomato seeds.',
        stock: 150,
    },
    {
        id: 'p2',
        name: 'Organic Fertilizer 5kg',
        slug: 'organic-fertilizer-5kg',
        price: 499,
        originalPrice: 599,
        rating: 4.5,
        reviews: 18,
        image: '/images/products/fertilizer.jpg',
        images: ['/images/products/fertilizer.jpg'],
        description: 'Slow release organic fertilizer.',
        stock: 89,
    },
];
// Categories data
var categories = [
    { id: '1', name: 'Seeds', icon: '🌾', description: 'High-quality seeds' },
    { id: '2', name: 'Fertilizers', icon: '🌱', description: 'Organic and chemical fertilizers' },
    { id: '3', name: 'Tools', icon: '🛠️', description: 'Farm tools and equipment' },
];
// Blog data
var blogPosts = [
    {
        id: 'b1',
        title: 'Complete Guide to Organic Farming in 2025',
        slug: 'organic-farming-guide',
        excerpt: 'Learn everything you need to know about sustainable organic farming practices.',
        content: '<p>Full guide content...</p>',
        author: 'Dr. Rajesh Kumar',
        featured_image: '/images/blog/organic.jpg',
        category: 'Farming Tips',
        tags: ['organic', 'sustainable'],
        likes: 245,
        comments: 32,
        views: 1280,
        published_at: '2025-01-01T00:00:00Z',
        reading_time: 8,
    },
];
// Cart and orders
var cartItems = [];
var cartCoupon = null;
var orders = [];
// Helper
var ok = function (res, data) { return res.json({ success: true, data: data }); };
// Root endpoint
app.get('/api', function (_req, res) {
    res.json({
        status: 'ok',
        message: 'AgroMart API Server',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            categories: '/api/categories',
            blog: '/api/blog',
            cart: '/api/cart',
            checkout: '/api/checkout',
            orders: '/api/orders',
        },
    });
});
app.get('/api/health', function (_req, res) { return res.json({ status: 'ok' }); });
// Products
app.get('/api/products', function (_req, res) { return ok(res, products); });
app.get('/api/products/:id', function (req, res) {
    var p = products.find(function (x) { return x.id === req.params.id || x.slug === req.params.id; });
    if (!p)
        return res.status(404).json({ success: false, message: 'Not found' });
    return ok(res, p);
});
// Categories
app.get('/api/categories', function (_req, res) { return ok(res, categories); });
app.post('/api/admin/categories', function (req, res) {
    var _a = req.body, name = _a.name, description = _a.description, icon = _a.icon;
    var cat = { id: String(Date.now()), name: name, description: description, icon: icon };
    categories.push(cat);
    return ok(res, cat);
});
app.put('/api/admin/categories/:id', function (req, res) {
    var idx = categories.findIndex(function (c) { return c.id === req.params.id; });
    if (idx === -1)
        return res.status(404).json({ success: false, message: 'Not found' });
    categories[idx] = __assign(__assign({}, categories[idx]), req.body);
    return ok(res, categories[idx]);
});
app.delete('/api/admin/categories/:id', function (req, res) {
    var idx = categories.findIndex(function (c) { return c.id === req.params.id; });
    if (idx === -1)
        return res.status(404).json({ success: false, message: 'Not found' });
    var deleted = categories.splice(idx, 1)[0];
    return ok(res, deleted);
});
// Blog
app.get('/api/blog', function (_req, res) { return ok(res, blogPosts); });
app.get('/api/blog/:slug', function (req, res) {
    var post = blogPosts.find(function (p) { return p.slug === req.params.slug; });
    if (!post)
        return res.status(404).json({ success: false, message: 'Not found' });
    return ok(res, post);
});
// Cart endpoints
app.get('/api/cart', function (_req, res) { return ok(res, { items: cartItems, coupon: cartCoupon }); });
app.post('/api/cart/add', function (req, res) {
    var _a = req.body, id = _a.id, name = _a.name, price = _a.price, image = _a.image, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b;
    var existing = cartItems.find(function (i) { return i.id === id; });
    if (existing) {
        existing.quantity += quantity;
    }
    else {
        cartItems.push({ id: id, name: name, price: price, quantity: quantity, image: image });
    }
    return ok(res, { items: cartItems, coupon: cartCoupon });
});
app.put('/api/cart/items/:id', function (req, res) {
    var quantity = req.body.quantity;
    var item = cartItems.find(function (i) { return i.id === req.params.id; });
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    if (quantity !== undefined)
        item.quantity = quantity;
    return ok(res, { items: cartItems, coupon: cartCoupon });
});
app.delete('/api/cart/items/:id', function (req, res) {
    var idx = cartItems.findIndex(function (i) { return i.id === req.params.id; });
    if (idx === -1)
        return res.status(404).json({ success: false, message: 'Not found' });
    cartItems.splice(idx, 1);
    return ok(res, { items: cartItems, coupon: cartCoupon });
});
// Coupon
var VALID_COUPONS = { SAVE20: 20, SAVE10: 10, WELCOME5: 5 };
app.post('/api/cart/coupon', function (req, res) {
    var code = req.body.code;
    var discount = VALID_COUPONS[code === null || code === void 0 ? void 0 : code.toUpperCase()];
    if (!discount)
        return res.status(400).json({ success: false, message: 'Invalid coupon' });
    cartCoupon = { code: code.toUpperCase(), discount: discount };
    return ok(res, { items: cartItems, coupon: cartCoupon });
});
app.delete('/api/cart/coupon', function (_req, res) {
    cartCoupon = null;
    return ok(res, { items: cartItems, coupon: cartCoupon });
});
// Checkout
app.post('/api/checkout', function (req, res) {
    var _a, _b;
    if (!cartItems.length)
        return res.status(400).json({ success: false, message: 'Cart empty' });
    var subtotal = 0;
    cartItems.forEach(function (item) {
        subtotal += item.price * item.quantity;
    });
    var discount = cartCoupon ? (subtotal * cartCoupon.discount) / 100 : 0;
    var total = subtotal - discount;
    var order = {
        id: 'ORDER-' + Date.now(),
        items: __spreadArray([], cartItems, true),
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupon: (cartCoupon === null || cartCoupon === void 0 ? void 0 : cartCoupon.code) || null,
        paymentMethod: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.paymentMethod) || 'mock',
        shippingAddress: ((_b = req.body) === null || _b === void 0 ? void 0 : _b.shippingAddress) || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    orders.push(order);
    cartItems = [];
    cartCoupon = null;
    return ok(res, { order: order, success: true });
});
// Orders
app.get('/api/orders', function (_req, res) { return ok(res, orders); });
app.get('/api/orders/:id', function (req, res) {
    var o = orders.find(function (x) { return x.id === req.params.id; });
    if (!o)
        return res.status(404).json({ success: false, message: 'Not found' });
    return ok(res, o);
});
// Auth refresh
app.post('/api/auth/refresh', function (req, res) {
    var refreshToken = req.body.refreshToken;
    if (!refreshToken)
        return res.status(401).json({ success: false, message: 'No token' });
    return ok(res, { accessToken: 'mock-access-token-' + Date.now() });
});
// Start
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT, "/api"));
});
