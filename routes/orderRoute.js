import express from 'express'
import { verifyRazorpay, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, requestReturn, cancelRazorpayOrder, userCancelOrder } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const orderRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management system
 */

// Admin Features
/**
 * @swagger
 * /api/order/list:
 *   post:
 *     summary: List all orders (Admin)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 */
orderRouter.post('/list', adminAuth, allOrders)

/**
 * @swagger
 * /api/order/status:
 *   post:
 *     summary: Update order status (Admin)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order status updated
 */
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
/**
 * @swagger
 * /api/order/place:
 *   post:
 *     summary: Place an order (COD)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order placed
 */
orderRouter.post('/place', authUser, placeOrder)

/**
 * @swagger
 * /api/order/stripe:
 *   post:
 *     summary: Place order with Stripe
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Stripe session created
 */
orderRouter.post('/stripe', authUser, placeOrderStripe)

/**
 * @swagger
 * /api/order/razorpay:
 *   post:
 *     summary: Place order with Razorpay
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Razorpay order created
 */
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

/**
 * @swagger
 * /api/order/verifyRazorpay:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Payment verified
 */
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

/**
 * @swagger
 * /api/order/cancel-razorpay:
 *   post:
 *     summary: Cancel Razorpay sequence
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Payment canceled
 */
orderRouter.post('/cancel-razorpay', authUser, cancelRazorpayOrder)

// User Features
/**
 * @swagger
 * /api/order/userorders:
 *   post:
 *     summary: Get user orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of user orders
 */
orderRouter.post('/userorders', authUser, userOrders)

/**
 * @swagger
 * /api/order/request-return:
 *   post:
 *     summary: Request order return
 *     tags: [Orders]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               returnReason:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               returnReason:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Return requested
 */
orderRouter.post('/request-return', upload.array('images', 4), authUser, requestReturn)

/**
 * @swagger
 * /api/order/cancel:
 *   post:
 *     summary: Cancel order (User)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order canceled
 */
orderRouter.post('/cancel', authUser, userCancelOrder)

export default orderRouter