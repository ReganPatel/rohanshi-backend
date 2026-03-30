import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';

export const getDashboardData = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const products = await productModel.find({});
        const users = await userModel.find({});

        // Define non-revenue/non-active statuses
        const excludedStatuses = ['Cancelled', 'Returned'];

        // Calculate Totals
        const totalOrders = orders.filter(order => order.status !== 'Cancelled').length;
        const totalProducts = products.length;
        const totalCustomers = users.length;
        
        // Revenue only from paid orders that are not cancelled or returned
        const totalRevenue = orders.reduce((acc, order) => {
            if (order.payment && !excludedStatuses.includes(order.status)) return acc + order.amount;
            return acc;
        }, 0);

        const totalReturnProducts = orders.reduce((acc, order) => {
            if (order.status === 'Return Requested' || order.status === 'Returned') {
                return acc + order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
            }
            return acc;
        }, 0);

        // Rolling Time Windows
        const now = new Date();
        const last7DaysStart = new Date(now);
        last7DaysStart.setDate(last7DaysStart.getDate() - 7);

        const last30DaysStart = new Date(now);
        last30DaysStart.setDate(last30DaysStart.getDate() - 30);

        const last365DaysStart = new Date(now);
        last365DaysStart.setDate(last365DaysStart.getDate() - 365);

        const weeklyOrders = orders.filter(o => new Date(o.date) >= last7DaysStart);
        const monthlyOrders = orders.filter(o => new Date(o.date) >= last30DaysStart);
        const yearlyOrders = orders.filter(o => new Date(o.date) >= last365DaysStart);

        // Helper for Order Status
        const getOrderStatusCount = (filteredOrders) => {
            const counts = { 
                'Order Placed': 0, 
                'Packing': 0, 
                'Shipped': 0, 
                'Out for delivery': 0, 
                'Delivered': 0,
                'Cancelled': 0,
                'Return Requested': 0,
                'Returned': 0
            };
            filteredOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
            return counts;
        };

        const orderStatusData = {
            weekly: getOrderStatusCount(weeklyOrders),
            monthly: getOrderStatusCount(monthlyOrders),
            yearly: getOrderStatusCount(yearlyOrders),
        };

        // Helper for Top Selling Products - Only count from orders that weren't cancelled
        const getTopProducts = (filteredOrders) => {
            const productSales = {};
            filteredOrders.forEach(order => {
                if (!order.items || order.status === 'Cancelled') return;
                order.items.forEach(item => {
                    const id = item._id.toString();
                    if (!productSales[id]) {
                        productSales[id] = { name: item.name, count: 0 };
                    }
                    productSales[id].count += Number(item.quantity) || 1;
                });
            });
            return Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 5);
        };

        const topProductsData = {
            weekly: getTopProducts(weeklyOrders),
            monthly: getTopProducts(monthlyOrders),
            yearly: getTopProducts(yearlyOrders),
        };

        // Revenue Trend Logic
        const revenueWeekly = {};
        const revenueMonthly = {};
        const revenueYearly = {};

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayStr = d.toLocaleDateString('default', { weekday: 'short' });
            revenueWeekly[dayStr] = 0;
        }

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${d.toLocaleString('default', { month: 'short' })} ${d.toLocaleString('default', { year: '2-digit' })}`;
            revenueMonthly[monthStr] = 0;
        }

        for (let i = 4; i >= 0; i--) {
            const yearStr = (now.getFullYear() - i).toString();
            revenueYearly[yearStr] = 0;
        }

        orders.forEach(order => {
            // Only count paid and non-refunded/non-cancelled orders in revenue
            if (order.payment && !excludedStatuses.includes(order.status)) {
                const d = new Date(order.date);

                // Year
                const yearStr = d.getFullYear().toString();
                if (revenueYearly[yearStr] !== undefined) revenueYearly[yearStr] += order.amount;

                // Month
                const monthStr = `${d.toLocaleString('default', { month: 'short' })} ${d.toLocaleString('default', { year: '2-digit' })}`;
                if (revenueMonthly[monthStr] !== undefined) revenueMonthly[monthStr] += order.amount;

                // Day (if within last 7 days)
                if (d >= last7DaysStart) {
                    const dayStr = d.toLocaleDateString('default', { weekday: 'short' });
                    if (revenueWeekly[dayStr] !== undefined) revenueWeekly[dayStr] += order.amount;
                }
            }
        });

        const revenueData = {
            weekly: Object.entries(revenueWeekly).map(([label, revenue]) => ({ label, revenue })),
            monthly: Object.entries(revenueMonthly).map(([label, revenue]) => ({ label, revenue })),
            yearly: Object.entries(revenueYearly).map(([label, revenue]) => ({ label, revenue })),
        };

        res.json({
            success: true,
            dashboard: {
                totalOrders,
                totalProducts,
                totalCustomers,
                totalRevenue,
                totalReturnProducts,
                orderStatusData,
                topProductsData,
                revenueData
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password -otp -otpExpiresAt').sort({ date: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ success: true, message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const getRevenueStats = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const products = await productModel.find({});

        // Net Revenue is Gross - Refunds
        const excludedStatuses = ['Cancelled', 'Returned'];
        const refundedStatus = 'Refund Credited';

        const grossRevenue = orders.reduce((acc, order) => {
            if (order.payment && order.status !== 'Cancelled') return acc + order.amount;
            return acc;
        }, 0);

        const netRevenue = orders.reduce((acc, order) => {
            if (order.payment && !excludedStatuses.includes(order.status) && order.status !== refundedStatus) {
                return acc + order.amount;
            }
            return acc;
        }, 0);

        const totalRefunds = orders.reduce((acc, order) => {
            if (order.status === refundedStatus || (order.payment && order.status === 'Returned')) {
                return acc + order.amount;
            }
            return acc;
        }, 0);

        // Category-wise Sales Distribution
        const categoryStats = {};
        orders.forEach(order => {
            if (order.payment && !excludedStatuses.includes(order.status)) {
                order.items.forEach(item => {
                    const category = item.category || 'Uncategorized';
                    if (!categoryStats[category]) {
                        categoryStats[category] = 0;
                    }
                    categoryStats[category] += (item.price * item.quantity);
                });
            }
        });

        // Monthly Growth (Current Month vs Last Month)
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthRevenue = orders.reduce((acc, order) => {
            const d = new Date(order.date);
            if (order.payment && !excludedStatuses.includes(order.status) && d >= startOfCurrentMonth) {
                return acc + order.amount;
            }
            return acc;
        }, 0);

        const lastMonthRevenue = orders.reduce((acc, order) => {
            const d = new Date(order.date);
            if (order.payment && !excludedStatuses.includes(order.status) && d >= startOfLastMonth && d <= endOfLastMonth) {
                return acc + order.amount;
            }
            return acc;
        }, 0);

        const growth = lastMonthRevenue === 0 ? 100 : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        res.json({
            success: true,
            revenueStats: {
                grossRevenue,
                netRevenue,
                totalRefunds,
                categoryStats,
                monthlyGrowth: growth.toFixed(2),
                currentMonthRevenue,
                lastMonthRevenue
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
