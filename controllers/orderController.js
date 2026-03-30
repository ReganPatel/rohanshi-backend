import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import couponModel from "../models/couponModel.js";
import razorpay from 'razorpay'
import { v2 as cloudinary } from 'cloudinary'

// Gateway initialize
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Placing orders using COD Method
const placeOrder = async (req, res) => {

    try {
        const { userId, items, amount, address, couponCode } = req.body;

        // Calculate subtotal and discount even if no coupon to ensure consistency
        let subtotal = 0;
        for (const item of items) {
            const prod = await productModel.findById(item._id);
            if (prod) subtotal += prod.price * item.quantity;
        }

        let discountAmount = 0;
        if (couponCode) {
            if (couponCode === 'NEWUSER20') {
                const userOrders = await orderModel.find({ userId });
                if (userOrders.length === 0) {
                    discountAmount = (subtotal * 20) / 100;
                }
            } else {
                const coupon = await couponModel.findOne({ code: couponCode, isActive: true });
                if (coupon && subtotal >= coupon.minimumPurchase) {
                    discountAmount = coupon.discountType === 'percentage' ? (subtotal * coupon.discountAmount) / 100 : coupon.discountAmount;
                }
            }
        }
        discountAmount = Math.min(discountAmount, subtotal);
        const deliveryFee = 50;

        const orderData = {
            userId,
            items,
            amount,
            address,
            subtotal,
            discount: discountAmount,
            deliveryFee,
            couponCode: couponCode || "",
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
            statusHistory: [{ status: 'Order Placed', date: Date.now(), details: 'Your order has been placed successfully.' }]
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Decrement stock for each item ordered
        for (const item of items) {
            let color = 'N/A';
            if (item.size && item.size.includes('_')) {
                color = item.size.split('_')[1];
            }

            const updateOperation = { $inc: { stock: -item.quantity } };

            // If a specific color was ordered, decrement its precise stock as well
            if (color !== 'N/A') {
                updateOperation.$inc[`colorStock.${color}`] = -item.quantity;
            }

            await productModel.findByIdAndUpdate(item._id, updateOperation)
        }

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address, couponCode } = req.body;

        // Calculate subtotal and discount even if no coupon
        let subtotal = 0;
        for (const item of items) {
            const prod = await productModel.findById(item._id);
            if (prod) subtotal += prod.price * item.quantity;
        }

        let discountAmount = 0;
        if (couponCode) {
            if (couponCode === 'NEWUSER20') {
                const userOrders = await orderModel.find({ userId });
                if (userOrders.length === 0) {
                    discountAmount = (subtotal * 20) / 100;
                }
            } else {
                const coupon = await couponModel.findOne({ code: couponCode, isActive: true });
                if (coupon && subtotal >= coupon.minimumPurchase) {
                    discountAmount = coupon.discountType === 'percentage' ? (subtotal * coupon.discountAmount) / 100 : coupon.discountAmount;
                }
            }
        }
        discountAmount = Math.min(discountAmount, subtotal);
        const deliveryFee = 50;

        const orderData = {
            userId,
            items,
            amount,
            address,
            subtotal,
            discount: discountAmount,
            deliveryFee,
            couponCode: couponCode || "",
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now(),
            statusHistory: [{ status: 'Order Placed', date: Date.now(), details: 'Your order has been placed successfully.' }]
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error)
                return res.json({ success: false, message: error })
            }
            res.json({ success: true, order })
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id } = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            const orderDoc = await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true, paymentId: razorpay_payment_id }, { new: true })

            // Decrement stock for each item ordered
            if (orderDoc && orderDoc.items) {
                for (const item of orderDoc.items) {
                    let color = 'N/A';
                    if (item.size && item.size.includes('_')) {
                        color = item.size.split('_')[1];
                    }

                    const updateOperation = { $inc: { stock: -item.quantity } };

                    if (color !== 'N/A') {
                        updateOperation.$inc[`colorStock.${color}`] = -item.quantity;
                    }

                    await productModel.findByIdAndUpdate(item._id, updateOperation)
                }
            }

            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true, message: "Payment Successful" })
        } else {
            // Delete the order if payment failed
            await orderModel.findByIdAndDelete(orderInfo.receipt)
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel Razorpay Order
const cancelRazorpayOrder = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        
        if (orderInfo && orderInfo.receipt) {
            await orderModel.findByIdAndDelete(orderInfo.receipt)
            res.json({ success: true, message: "Order cancelled and removed" })
        } else {
            res.json({ success: false, message: "Order not found" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// All Orders data for admin panel
const allOrders = async (req, res) => {

    try {

        const orders = await orderModel.find({})
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//User Order Data For Forntend
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {

        let { orderId, status } = req.body
        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.json({ success: false, message: 'Order not found' })
        }

        // If the admin is marking the order as Returned, restock the physical items

        let updateData = { status };
        let historyEntry = { status, date: Date.now(), details: 'Status updated by store.' };
        if (status === 'Packing') {
            historyEntry.details = 'Your order is being packed.';
        } else if (status === 'Shipped') {
            historyEntry.details = 'Your item has been shipped.';
        } else if (status === 'Out for delivery') {
            historyEntry.details = 'Your item is out for delivery.';
        } else if (status === 'Delivered') {
            updateData.deliveryDate = Date.now();
            historyEntry.details = 'Your item has been delivered.';
        } else if (status === 'Return Requested') {
            historyEntry.details = 'Return request was initiated.';
        } else if (status === 'Returned' || status === 'Initiated') {
            historyEntry.details = status === 'Initiated' ? 'Return initiated.' : 'Return request approved and processed.';
        } else if (status === 'Dropped off') {
            historyEntry.details = 'Item dropped off at collection point.';
        } else if (status === 'Received') {
            historyEntry.details = 'Item received and inspected.';
            // Restock items when physically received
            for (const item of order.items) {
                let color = 'N/A';
                if (item.size && item.size.includes('_')) {
                    color = item.size.split('_')[1];
                }
                const updateOperation = { $inc: { stock: item.quantity } };
                if (color !== 'N/A') {
                    updateOperation.$inc[`colorStock.${color}`] = item.quantity;
                }
                await productModel.findByIdAndUpdate(item._id, updateOperation)
            }
        } else if (status === 'Refund Issued') {
            historyEntry.details = 'Refund process started.';
            // Trigger automatic refund for Razorpay orders
            if (order.paymentMethod === 'Razorpay') {
                if (!order.paymentId) {
                    return res.json({ success: false, message: 'Refund failed: Payment ID is missing for this order.' });
                }
                try {
                    const refundAmount = Math.round(order.amount * 100);
                    console.log(`Initiating Razorpay refund for Order ${orderId}, Payment ${order.paymentId}, Amount ${refundAmount}`);
                    
                    const refund = await razorpayInstance.payments.refund(order.paymentId, {
                        amount: refundAmount
                    });
                    
                    console.log('Refund successful:', refund.id);

                    // If refund call succeeds, we proceed to 'Refund Credited' automatically
                    status = 'Refund Credited';
                    historyEntry.status = status;
                    historyEntry.details = 'Refund credited to your original payment method. Refund ID: ' + refund.id;
                    updateData.status = status;
                } catch (refundError) {
                    console.log('Razorpay Refund API Error:', refundError);
                    const errorMsg = refundError.description || refundError.error?.description || refundError.message;
                    return res.json({ success: false, message: 'Razorpay Refund failed: ' + errorMsg });
                }
            } else {
                // If COD, just mark as refund issued
                status = 'Refund Credited';
                historyEntry.status = status;
                historyEntry.details = 'Refund processed successfully.';
                updateData.status = status;
            }
        } else if (status === 'Return Canceled') {
            historyEntry.details = 'Return request was reviewed and rejected by admin.';
        }

        updateData.$push = { statusHistory: historyEntry };
        await orderModel.findByIdAndUpdate(orderId, updateData)
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Request a Return (User Frontend)
const requestReturn = async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        const returnReason = req.body.returnReason;

        const order = await orderModel.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'Delivered') {
            return res.json({ success: false, message: 'Only Delivered orders can be returned' });
        }

        // 7-day restriction check
        const deliveryTime = order.deliveryDate || order.date;
        const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;

        if (Date.now() - deliveryTime > sevenDaysInMillis) {
            return res.json({ success: false, message: 'Return period has expired (7 days after delivery)' });
        }

        // Handle images
        const images = req.files; // Array of files from multer
        const uploadedImagesUrls = [];

        if (images && images.length > 0) {
            for (const file of images) {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
                uploadedImagesUrls.push(result.secure_url);
            }
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Return Requested',
            returnReason: returnReason || '',
            returnImages: uploadedImagesUrls,
            $push: { statusHistory: { status: 'Return Requested', date: Date.now(), details: 'Return request was initiated by customer.' } }
        });

        res.json({ success: true, message: 'Return request submitted successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// User Cancel Order
const userCancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        const order = await orderModel.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        // Check if order is cancellable (Statuses: Order Placed, Packing)
        if (!['Order Placed', 'Packing'].includes(order.status)) {
            return res.json({ success: false, message: 'Order cannot be cancelled as it is already ' + order.status });
        }

        let historyEntry = { status: 'Cancelled', date: Date.now(), details: 'Order was cancelled by customer.' };

        // Handle Razorpay Refund if already paid
        if (order.paymentMethod === 'Razorpay' && order.payment) {
            if (order.paymentId) {
                try {
                    const refundAmount = Math.round(order.amount * 100);
                    const refund = await razorpayInstance.payments.refund(order.paymentId, {
                        amount: refundAmount
                    });
                    historyEntry.details += ` Automatic refund initiated. (ID: ${refund.id})`;
                } catch (refundError) {
                    console.log('Razorpay Refund Error during cancellation:', refundError);
                    return res.json({ success: false, message: 'Cancellation failed: Refund could not be processed automatically. ' + (refundError.description || refundError.message) });
                }
            } else {
                 return res.json({ success: false, message: 'Cancellation failed: Payment ID missing for refund. Please contact support.' });
            }
        }

        // Restocking logic
        for (const item of order.items) {
            let color = 'N/A';
            if (item.size && item.size.includes('_')) {
                color = item.size.split('_')[1];
            }
            const updateOperation = { $inc: { stock: item.quantity } };
            if (color !== 'N/A') {
                updateOperation.$inc[`colorStock.${color}`] = item.quantity;
            }
            await productModel.findByIdAndUpdate(item._id, updateOperation)
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Cancelled',
            $push: { statusHistory: historyEntry }
        });

        res.json({ success: true, message: 'Order cancelled successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { verifyRazorpay, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, requestReturn, cancelRazorpayOrder, userCancelOrder }