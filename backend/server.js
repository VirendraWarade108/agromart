const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error catching middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.message);
	res.status(500).json({ success: false, message: 'Server error' });
});

// Products data
const products = [
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
const categories = [
	{ id: '1', name: 'Seeds', icon: '🌾', description: 'High-quality seeds' },
	{ id: '2', name: 'Fertilizers', icon: '🌱', description: 'Organic and chemical fertilizers' },
	{ id: '3', name: 'Tools', icon: '🛠️', description: 'Farm tools and equipment' },
];

// Blog data
const blogPosts = [
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
let cartItems = [];
let cartCoupon = null;
let orders = [];

// Helper
const ok = (res, data) => res.json({ success: true, data });

// Root endpoint
app.get('/api', (_req, res) => {
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

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Products
app.get('/api/products', async (_req, res) => {
	try {
		const products = await prisma.product.findMany();
		return ok(res, products);
	} catch (err) {
		console.error('Error fetching products:', err);
		return ok(res, products); // Fallback to mock data
	}
});

app.get('/api/products/:id', async (req, res) => {
	try {
		const p = await prisma.product.findFirst({
			where: { OR: [{ id: req.params.id }, { slug: req.params.id }] }
		});
		if (!p) return res.status(404).json({ success: false, message: 'Not found' });
		return ok(res, p);
	} catch (err) {
		console.error('Error fetching product:', err);
		// Fallback to mock
		const p = products.find((x) => x.id === req.params.id || x.slug === req.params.id);
		if (!p) return res.status(404).json({ success: false, message: 'Not found' });
		return ok(res, p);
	}
});

// Categories
app.get('/api/categories', async (_req, res) => {
	try {
		const cats = await prisma.category.findMany();
		return ok(res, cats);
	} catch (err) {
		console.error('Error fetching categories:', err);
		return ok(res, categories); // Fallback
	}
});

app.post('/api/admin/categories', async (req, res) => {
	try {
		const { name, description, icon } = req.body;
		const cat = await prisma.category.create({
			data: { name, description, icon }
		});
		return ok(res, cat);
	} catch (err) {
		console.error('Error creating category:', err);
		const cat = { id: String(Date.now()), name: req.body.name, description: req.body.description, icon: req.body.icon };
		categories.push(cat);
		return ok(res, cat);
	}
});

app.put('/api/admin/categories/:id', async (req, res) => {
	try {
		const cat = await prisma.category.update({
			where: { id: req.params.id },
			data: req.body
		});
		return ok(res, cat);
	} catch (err) {
		console.error('Error updating category:', err);
		const idx = categories.findIndex((c) => c.id === req.params.id);
		if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
		categories[idx] = { ...categories[idx], ...req.body };
		return ok(res, categories[idx]);
	}
});

app.delete('/api/admin/categories/:id', async (req, res) => {
	try {
		const deleted = await prisma.category.delete({
			where: { id: req.params.id }
		});
		return ok(res, deleted);
	} catch (err) {
		console.error('Error deleting category:', err);
		const idx = categories.findIndex((c) => c.id === req.params.id);
		if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
		const deleted = categories.splice(idx, 1)[0];
		return ok(res, deleted);
	}
});

// Blog
app.get('/api/blog', (_req, res) => ok(res, blogPosts));

app.get('/api/blog/:slug', (req, res) => {
	const post = blogPosts.find((p) => p.slug === req.params.slug);
	if (!post) return res.status(404).json({ success: false, message: 'Not found' });
	return ok(res, post);
});

// Cart endpoints
app.get('/api/cart', (_req, res) => ok(res, { items: cartItems, coupon: cartCoupon }));

app.post('/api/cart/add', (req, res) => {
	const { id, name, price, image, quantity = 1 } = req.body;
	const existing = cartItems.find((i) => i.id === id);
	if (existing) {
		existing.quantity += quantity;
	} else {
		cartItems.push({ id, name, price, quantity, image });
	}
	return ok(res, { items: cartItems, coupon: cartCoupon });
});

app.put('/api/cart/items/:id', (req, res) => {
	const { quantity } = req.body;
	const item = cartItems.find((i) => i.id === req.params.id);
	if (!item) return res.status(404).json({ success: false, message: 'Not found' });
	if (quantity !== undefined) item.quantity = quantity;
	return ok(res, { items: cartItems, coupon: cartCoupon });
});

app.delete('/api/cart/items/:id', (req, res) => {
	const idx = cartItems.findIndex((i) => i.id === req.params.id);
	if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
	cartItems.splice(idx, 1);
	return ok(res, { items: cartItems, coupon: cartCoupon });
});

// Coupon
const VALID_COUPONS = { SAVE20: 20, SAVE10: 10, WELCOME5: 5 };

app.post('/api/cart/coupon', (req, res) => {
	const { code } = req.body;
	const discount = VALID_COUPONS[code?.toUpperCase()];
	if (!discount) return res.status(400).json({ success: false, message: 'Invalid coupon' });
	cartCoupon = { code: code.toUpperCase(), discount };
	return ok(res, { items: cartItems, coupon: cartCoupon });
});

app.delete('/api/cart/coupon', (_req, res) => {
	cartCoupon = null;
	return ok(res, { items: cartItems, coupon: cartCoupon });
});

// Checkout
app.post('/api/checkout', (req, res) => {
	if (!cartItems.length) return res.status(400).json({ success: false, message: 'Cart empty' });

	let subtotal = 0;
	cartItems.forEach((item) => {
		subtotal += item.price * item.quantity;
	});

	const discount = cartCoupon ? (subtotal * cartCoupon.discount) / 100 : 0;
	const total = subtotal - discount;

	const order = {
		id: 'ORDER-' + Date.now(),
		items: [...cartItems],
		subtotal,
		discount,
		total,
		coupon: cartCoupon?.code || null,
		paymentMethod: req.body?.paymentMethod || 'mock',
		shippingAddress: req.body?.shippingAddress || null,
		status: 'pending',
		createdAt: new Date().toISOString(),
	};

	orders.push(order);
	cartItems = [];
	cartCoupon = null;

	return ok(res, { order, success: true });
});

// Orders
app.get('/api/orders', (_req, res) => ok(res, orders));

app.get('/api/orders/:id', (req, res) => {
	const o = orders.find((x) => x.id === req.params.id);
	if (!o) return res.status(404).json({ success: false, message: 'Not found' });
	return ok(res, o);
});

// Auth refresh
app.post('/api/auth/refresh', (req, res) => {
	const { refreshToken } = req.body;
	if (!refreshToken) return res.status(401).json({ success: false, message: 'No token' });
	return ok(res, { accessToken: 'mock-access-token-' + Date.now() });
});

// Customer Register
app.post('/api/auth/register', async (req, res) => {
	try {
		const { fullName, email, phone, password } = req.body;

		if (!fullName || !email || !password) {
			return res.status(400).json({ success: false, message: 'Missing required fields' });
		}

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(400).json({ success: false, message: 'Email already registered' });
		}

		const user = await prisma.user.create({
			data: {
				fullName,
				email,
				phone: phone || null,
				password, // In production, hash this!
				isAdmin: false,
			},
		});

		const token = 'mock-token-' + Date.now();
		return ok(res, {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			accessToken: token,
			refreshToken: token,
		});
	} catch (err) {
		console.error('Registration error:', err);
		return res.status(500).json({ success: false, message: 'Registration failed' });
	}
});

// Customer Login
app.post('/api/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ success: false, message: 'Email and password required' });
		}

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || user.password !== password) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}

		const token = 'mock-token-' + Date.now();
		return ok(res, {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			isAdmin: user.isAdmin,
			accessToken: token,
			refreshToken: token,
		});
	} catch (err) {
		console.error('Login error:', err);
		return res.status(500).json({ success: false, message: 'Login failed' });
	}
});

// Get User Profile
app.get('/api/auth/profile', async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ success: false, message: 'No token' });
		}

		// In production, verify JWT token
		// For now, just return mock data
		return ok(res, {
			id: 'user-123',
			fullName: 'John Doe',
			email: 'john@example.com',
			isAdmin: false,
		});
	} catch (err) {
		console.error('Profile error:', err);
		return res.status(500).json({ success: false, message: 'Error fetching profile' });
	}
});

// ============================================
// VENDOR ENDPOINTS
// ============================================

// Vendor Register
app.post('/api/vendor/register', async (req, res) => {
	try {
		const { businessName, email, phone, password, website, city, state, country } = req.body;

		const existing = await prisma.vendor.findUnique({ where: { email } });
		if (existing) {
			return res.status(400).json({ success: false, message: 'Email already registered' });
		}

		const vendor = await prisma.vendor.create({
			data: {
				businessName,
				email,
				phone,
				password, // In production, hash this!
				website: website || null,
				city: city || null,
				state: state || null,
				country: country || null,
			},
		});

		return ok(res, { id: vendor.id, message: 'Registration successful' });
	} catch (err) {
		console.error('Vendor registration error:', err);
		return res.status(500).json({ success: false, message: 'Registration failed' });
	}
});

// Vendor Login
app.post('/api/vendor/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		const vendor = await prisma.vendor.findUnique({ where: { email } });
		if (!vendor || vendor.password !== password) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}

		return ok(res, {
			id: vendor.id,
			businessName: vendor.businessName,
			token: 'mock-token-' + Date.now(),
		});
	} catch (err) {
		console.error('Vendor login error:', err);
		return res.status(500).json({ success: false, message: 'Login failed' });
	}
});

// Get Vendor Products
app.get('/api/vendor/:vendorId/products', async (req, res) => {
	try {
		const products = await prisma.product.findMany({
			where: { vendorId: req.params.vendorId },
		});
		return ok(res, products);
	} catch (err) {
		console.error('Error fetching vendor products:', err);
		return res.status(500).json({ success: false, message: 'Error fetching products' });
	}
});

// Add Vendor Product
app.post('/api/vendor/:vendorId/products', async (req, res) => {
	try {
		const { name, slug, price, originalPrice, description, image, stock } = req.body;

		const product = await prisma.product.create({
			data: {
				name,
				slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
				price,
				originalPrice: originalPrice || null,
				description: description || null,
				image: image || null,
				stock: stock || 0,
				vendorId: req.params.vendorId,
			},
		});

		return ok(res, product);
	} catch (err) {
		console.error('Error creating product:', err);
		return res.status(500).json({ success: false, message: 'Failed to create product' });
	}
});

// Delete Vendor Product
app.delete('/api/vendor/:vendorId/products/:productId', async (req, res) => {
	try {
		const product = await prisma.product.delete({
			where: { id: req.params.productId },
		});
		return ok(res, product);
	} catch (err) {
		console.error('Error deleting product:', err);
		return res.status(500).json({ success: false, message: 'Failed to delete product' });
	}
});

// Start
const server = app.listen(PORT, async () => {
	try {
		await prisma.$connect();
		console.log(`Server running on http://localhost:${PORT}/api`);
		console.log('Database connected via Prisma');
	} catch (err) {
		console.error('Database connection error:', err);
		console.log('Falling back to mock in-memory data');
	}
});

// Global error handlers
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
	console.log('Shutting down gracefully...');
	await prisma.$disconnect();
	process.exit(0);
});
