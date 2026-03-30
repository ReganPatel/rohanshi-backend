import couponModel from "../models/couponModel.js"
import orderModel from "../models/orderModel.js"

// Add a new coupon
const addCoupon = async (req, res) => {
    try {
        const { code, discountType, discountAmount, minimumPurchase, expirationDate, isActive } = req.body;

        // Check if code already exists
        const existingCoupon = await couponModel.findOne({ code });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const couponData = {
            code,
            discountType,
            discountAmount: Number(discountAmount),
            minimumPurchase: Number(minimumPurchase) || 0,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
            isActive: isActive !== undefined ? isActive : true
        }

        const coupon = new couponModel(couponData);
        await coupon.save();

        res.json({ success: true, message: "Coupon Added" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// List all coupons
const listCoupons = async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Deactivate expired coupons automatically
        await couponModel.updateMany(
            { isActive: true, expirationDate: { $lt: currentDate } },
            { isActive: false }
        );

        const coupons = await couponModel.find({});
        res.json({ success: true, coupons })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Remove previously saved coupon
const removeCoupon = async (req, res) => {
    try {
        await couponModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Coupon Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Validate a coupon and calculate discount against purchase
const validateCoupon = async (req, res) => {
    try {
        const { code, cartAmount, userId } = req.body;

        if (code === 'NEWUSER20') {
            // Check if user has any previous orders
            const userOrders = await orderModel.find({ userId });
            if (userOrders.length > 0) {
                return res.json({ success: false, message: "This coupon is only valid for your first order" });
            }
            
            // Return fixed 20% discount for first order
            const discount = (cartAmount * 20) / 100;
            return res.json({ success: true, discount, message: "Welcome! 20% first order discount applied" });
        }

        const coupon = await couponModel.findOne({ code, isActive: true });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid or inactive coupon code" });
        }

        if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
            // Mark as inactive if expired
            coupon.isActive = false;
            await coupon.save();
            return res.json({ success: false, message: "Coupon code has expired" });
        }

        if (cartAmount < coupon.minimumPurchase) {
            return res.json({ success: false, message: `Minimum purchase amount of ₹ ${coupon.minimumPurchase} required` });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (cartAmount * coupon.discountAmount) / 100;
        } else if (coupon.discountType === 'fixed') {
            discount = coupon.discountAmount;
        }

        // Ensure discount doesn't exceed total purchase
        discount = Math.min(discount, cartAmount);

        res.json({ success: true, discount, message: "Coupon applied successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Toggle active status
const toggleActive = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        await couponModel.findByIdAndUpdate(id, { isActive });
        res.json({ success: true, message: "Coupon status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get available coupons for users
const getAvailableCoupons = async (req, res) => {
    try {
        const currentDate = new Date();
        const coupons = await couponModel.find({
            isActive: true,
            $or: [
                { expirationDate: { $gt: currentDate } },
                { expirationDate: null }
            ]
        });
        res.json({ success: true, coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addCoupon, listCoupons, removeCoupon, validateCoupon, toggleActive, getAvailableCoupons }
