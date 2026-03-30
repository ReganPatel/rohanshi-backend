import express from 'express'
import { verifyRazorpay, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, requestReturn, cancelRazorpayOrder, userCancelOrder } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const orderRouter = express.Router()

// Amin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)
orderRouter.post('/cancel-razorpay', authUser, cancelRazorpayOrder)

// User Features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/request-return', upload.array('images', 4), authUser, requestReturn)
orderRouter.post('/cancel', authUser, userCancelOrder)

export default orderRouter