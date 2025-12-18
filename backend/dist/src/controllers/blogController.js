"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPosts = exports.getFeaturedPosts = exports.getCategories = exports.getPostBySlug = exports.getPostById = exports.getAllPosts = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const errorHandler_2 = require("../middleware/errorHandler");
/**
 * BLOG CONTROLLER
 *
 * NOTE: This is a simple in-memory implementation for demonstration.
 * In production, you would store blog posts in a database (Prisma BlogPost model).
 *
 * For now, we're using mock data to match the frontend expectations.
 */
// Mock blog posts data
const mockBlogPosts = [
    {
        id: '1',
        title: 'Complete Guide to Organic Farming in 2025',
        slug: 'organic-farming-guide-2025',
        excerpt: 'Learn everything you need to know about sustainable organic farming practices in the modern era.',
        content: `
      <h2>Introduction to Organic Farming</h2>
      <p>Organic farming is a method of crop and livestock production that involves much more than choosing not to use pesticides, fertilizers, genetically modified organisms, antibiotics and growth hormones.</p>
      
      <h2>Benefits of Organic Farming</h2>
      <ul>
        <li>Healthier soil and plants</li>
        <li>Better for the environment</li>
        <li>Higher quality produce</li>
        <li>Sustainable long-term practices</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Starting an organic farm requires careful planning, dedication, and knowledge of sustainable farming practices. Here are the key steps...</p>
      
      <h2>Best Practices</h2>
      <p>Implementing crop rotation, composting, and natural pest control are essential elements of successful organic farming.</p>
    `,
        author: 'Dr. Rajesh Kumar',
        featured_image: '/images/blog/organic-farming.jpg',
        category: 'Farming Tips',
        tags: ['organic', 'sustainable', 'farming'],
        likes: 245,
        comments: 32,
        views: 1280,
        published_at: '2025-01-15T10:00:00Z',
        reading_time: 8,
        featured: true,
    },
    {
        id: '2',
        title: 'Top 10 Seeds for Monsoon Season',
        slug: 'top-10-seeds-monsoon-season',
        excerpt: 'Discover the best seeds to plant during the monsoon season for maximum yield.',
        content: `
      <h2>Best Seeds for Monsoon</h2>
      <p>The monsoon season provides ideal conditions for many crops. Here are the top 10 seeds you should consider planting...</p>
      
      <ol>
        <li>Rice - The staple crop</li>
        <li>Maize - Quick growing</li>
        <li>Cotton - High demand</li>
        <li>Soybean - Protein rich</li>
        <li>Groundnut - Profitable crop</li>
      </ol>
    `,
        author: 'Priya Sharma',
        featured_image: '/images/blog/monsoon-seeds.jpg',
        category: 'Seeds & Plants',
        tags: ['seeds', 'monsoon', 'planting'],
        likes: 189,
        comments: 24,
        views: 980,
        published_at: '2025-01-10T14:30:00Z',
        reading_time: 6,
        featured: true,
    },
    {
        id: '3',
        title: 'Understanding Soil Health and Fertility',
        slug: 'understanding-soil-health-fertility',
        excerpt: 'A comprehensive guide to maintaining and improving soil health for better crop yields.',
        content: `
      <h2>What is Soil Health?</h2>
      <p>Soil health is the continued capacity of soil to function as a vital living ecosystem that sustains plants, animals, and humans.</p>
      
      <h2>Indicators of Healthy Soil</h2>
      <p>Good soil structure, adequate nutrients, proper pH levels, and beneficial microorganisms are key indicators.</p>
    `,
        author: 'Dr. Anil Patel',
        featured_image: '/images/blog/soil-health.jpg',
        category: 'Soil & Fertilizers',
        tags: ['soil', 'fertility', 'health'],
        likes: 156,
        comments: 18,
        views: 750,
        published_at: '2025-01-05T09:15:00Z',
        reading_time: 10,
        featured: false,
    },
    {
        id: '4',
        title: 'Modern Irrigation Techniques for Small Farms',
        slug: 'modern-irrigation-techniques-small-farms',
        excerpt: 'Explore efficient and cost-effective irrigation methods suitable for small-scale farmers.',
        content: `
      <h2>Why Modern Irrigation Matters</h2>
      <p>Water conservation and efficient irrigation are crucial for sustainable farming.</p>
      
      <h2>Drip Irrigation</h2>
      <p>One of the most efficient methods, delivering water directly to plant roots.</p>
      
      <h2>Sprinkler Systems</h2>
      <p>Suitable for various crop types and terrain conditions.</p>
    `,
        author: 'Vikram Singh',
        featured_image: '/images/blog/irrigation.jpg',
        category: 'Farming Tips',
        tags: ['irrigation', 'water', 'efficiency'],
        likes: 203,
        comments: 27,
        views: 1150,
        published_at: '2025-01-12T16:45:00Z',
        reading_time: 7,
        featured: true,
    },
];
/**
 * Get all blog posts
 * GET /api/blog
 */
exports.getAllPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, category } = req.query;
    let filteredPosts = [...mockBlogPosts];
    // Filter by category if provided
    if (category) {
        filteredPosts = filteredPosts.filter((post) => post.category.toLowerCase() === category.toLowerCase());
    }
    // Simple pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    res.json({
        success: true,
        data: paginatedPosts,
        pagination: {
            total: filteredPosts.length,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(filteredPosts.length / Number(limit)),
        },
    });
});
/**
 * Get blog post by ID
 * GET /api/blog/:id
 */
exports.getPostById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const post = mockBlogPosts.find((p) => p.id === id);
    if (!post) {
        throw new errorHandler_2.AppError('Blog post not found', 404);
    }
    // Increment views (in real app, update in database)
    post.views += 1;
    res.json({
        success: true,
        data: post,
    });
});
/**
 * Get blog post by slug
 * GET /api/blog/slug/:slug
 */
exports.getPostBySlug = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { slug } = req.params;
    const post = mockBlogPosts.find((p) => p.slug === slug);
    if (!post) {
        throw new errorHandler_2.AppError('Blog post not found', 404);
    }
    // Increment views
    post.views += 1;
    res.json({
        success: true,
        data: post,
    });
});
/**
 * Get blog categories
 * GET /api/blog/categories
 */
exports.getCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Extract unique categories
    const categories = Array.from(new Set(mockBlogPosts.map((post) => post.category))).map((category) => {
        const count = mockBlogPosts.filter((p) => p.category === category).length;
        return { name: category, count };
    });
    res.json({
        success: true,
        data: categories,
    });
});
/**
 * Get featured blog posts
 * GET /api/blog/featured
 */
exports.getFeaturedPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const featuredPosts = mockBlogPosts
        .filter((post) => post.featured)
        .slice(0, 4);
    res.json({
        success: true,
        data: featuredPosts,
    });
});
/**
 * Search blog posts
 * GET /api/blog/search?q=query
 */
exports.searchPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Search query is required',
        });
    }
    const query = q.toLowerCase();
    const results = mockBlogPosts.filter((post) => post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        post.category.toLowerCase().includes(query));
    res.json({
        success: true,
        data: results,
        count: results.length,
    });
});
