"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStatistics = exports.getProductPerformance = exports.getSalesReport = exports.getDashboardStats = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * Get dashboard statistics
 * Overview stats for admin dashboard
 */
const getDashboardStats = async () => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    // Get all counts and aggregates in parallel
    const [totalUsers, totalProducts, totalOrders, totalRevenue, thisMonthRevenue, lastMonthRevenue, thisMonthOrders, lastMonthOrders, pendingOrders, lowStockProducts, recentOrders,] = await Promise.all([
        // Total users
        database_1.default.user.count(),
        // Total products
        database_1.default.product.count(),
        // Total orders
        database_1.default.order.count(),
        // Total revenue (all time)
        database_1.default.order.aggregate({
            _sum: { total: true },
            where: { status: { in: ['paid', 'delivered'] } },
        }),
        // This month revenue
        database_1.default.order.aggregate({
            _sum: { total: true },
            where: {
                status: { in: ['paid', 'delivered'] },
                createdAt: { gte: thisMonthStart },
            },
        }),
        // Last month revenue
        database_1.default.order.aggregate({
            _sum: { total: true },
            where: {
                status: { in: ['paid', 'delivered'] },
                createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
        }),
        // This month orders
        database_1.default.order.count({
            where: { createdAt: { gte: thisMonthStart } },
        }),
        // Last month orders
        database_1.default.order.count({
            where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        }),
        // Pending orders
        database_1.default.order.count({
            where: { status: 'pending' },
        }),
        // Low stock products
        database_1.default.product.count({
            where: { stock: { lte: 10, gt: 0 } },
        }),
        // Recent orders
        database_1.default.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        }),
    ]);
    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenue._sum.total
        ? ((thisMonthRevenue._sum.total || 0) - (lastMonthRevenue._sum.total || 0)) /
            (lastMonthRevenue._sum.total || 1) * 100
        : 0;
    const ordersGrowth = lastMonthOrders
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;
    return {
        overview: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            pendingOrders,
            lowStockProducts,
        },
        thisMonth: {
            revenue: thisMonthRevenue._sum.total || 0,
            orders: thisMonthOrders,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
            ordersGrowth: Math.round(ordersGrowth * 100) / 100,
        },
        recentOrders,
    };
};
exports.getDashboardStats = getDashboardStats;
/**
 * Get sales report
 * Detailed sales data for charts and analysis
 */
const getSalesReport = async (filters) => {
    const { startDate, endDate, groupBy = 'day' } = filters || {};
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
        ? new Date(startDate)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Get orders in date range
    const orders = await database_1.default.order.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end,
            },
            status: { in: ['paid', 'delivered'] },
        },
        select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
        },
        orderBy: { createdAt: 'asc' },
    });
    // Group data by time period
    const groupedData = {};
    orders.forEach((order) => {
        let key;
        const date = new Date(order.createdAt);
        if (groupBy === 'day') {
            key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        else if (groupBy === 'week') {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
        }
        else {
            // month
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        if (!groupedData[key]) {
            groupedData[key] = { date: key, revenue: 0, orders: 0 };
        }
        groupedData[key].revenue += order.total;
        groupedData[key].orders += 1;
    });
    // Convert to array and sort
    const salesData = Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return {
        summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue: Math.round(averageOrderValue * 100) / 100,
            period: {
                start: start.toISOString(),
                end: end.toISOString(),
            },
        },
        salesData,
    };
};
exports.getSalesReport = getSalesReport;
/**
 * Get product performance
 * Top selling products and categories
 */
const getProductPerformance = async (limit = 10) => {
    // Get top selling products
    const topProducts = await database_1.default.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true,
            price: true,
        },
        _count: {
            productId: true,
        },
        orderBy: {
            _sum: {
                quantity: 'desc',
            },
        },
        take: limit,
    });
    // Get product details
    const productsWithDetails = await Promise.all(topProducts.map(async (item) => {
        const product = await database_1.default.product.findUnique({
            where: { id: item.productId },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
                category: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        return {
            product,
            totalQuantitySold: item._sum.quantity || 0,
            totalRevenue: (item._sum.price || 0) * (item._sum.quantity || 0),
            orderCount: item._count.productId,
        };
    }));
    // Get category performance
    const categoryPerformance = await database_1.default.product.findMany({
        select: {
            categoryId: true,
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            orderItems: {
                select: {
                    quantity: true,
                    price: true,
                },
            },
        },
    });
    // Group by category
    const categoryStats = {};
    categoryPerformance.forEach((product) => {
        if (!product.category)
            return;
        const catId = product.category.id;
        if (!categoryStats[catId]) {
            categoryStats[catId] = {
                name: product.category.name,
                revenue: 0,
                items: 0,
            };
        }
        product.orderItems.forEach((item) => {
            categoryStats[catId].revenue += item.price * item.quantity;
            categoryStats[catId].items += item.quantity;
        });
    });
    const topCategories = Object.values(categoryStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    return {
        topProducts: productsWithDetails,
        topCategories,
    };
};
exports.getProductPerformance = getProductPerformance;
/**
 * Get user statistics
 * User growth and activity metrics
 */
const getUserStatistics = async () => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [totalUsers, newUsersThisMonth, newUsersLastMonth, activeUsers, topCustomers,] = await Promise.all([
        // Total users
        database_1.default.user.count(),
        // New users this month
        database_1.default.user.count({
            where: { createdAt: { gte: thisMonthStart } },
        }),
        // New users last month
        database_1.default.user.count({
            where: {
                createdAt: {
                    gte: lastMonthStart,
                    lt: thisMonthStart,
                },
            },
        }),
        // Active users (placed order in last 30 days)
        database_1.default.user.count({
            where: {
                orders: {
                    some: {
                        createdAt: {
                            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                },
            },
        }),
        // Top customers by order value
        database_1.default.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                _count: {
                    select: { orders: true },
                },
                orders: {
                    select: { total: true },
                    where: { status: { in: ['paid', 'delivered'] } },
                },
            },
            take: 10,
        }),
    ]);
    // Calculate total spent for each customer
    const topCustomersWithSpend = topCustomers
        .map((user) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        orderCount: user._count.orders,
        totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
    }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);
    const userGrowth = newUsersLastMonth
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : 0;
    return {
        totalUsers,
        newUsersThisMonth,
        userGrowth: Math.round(userGrowth * 100) / 100,
        activeUsers,
        topCustomers: topCustomersWithSpend,
    };
};
exports.getUserStatistics = getUserStatistics;
