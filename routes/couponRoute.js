import express from 'express';
import { addCoupon, listCoupons, removeCoupon, validateCoupon, toggleActive, getAvailableCoupons } from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

// Admin functionality
couponRouter.post('/add', adminAuth, addCoupon);
couponRouter.post('/remove', adminAuth, removeCoupon);
couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.post('/toggle', adminAuth, toggleActive);

// User functionality (verifying coupons at checkout)
// Note: Can optionally require authUser, or be public. Using authUser here to prevent guest spamming.
couponRouter.post('/validate', authUser, validateCoupon);
couponRouter.get('/available', getAvailableCoupons);

export default couponRouter;
