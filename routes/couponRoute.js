import express from 'express';
import { addCoupon, listCoupons, removeCoupon, validateCoupon, toggleActive, getAvailableCoupons } from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

// Admin functionality
/**
 * @swagger
 * /api/coupon/add:
 *   post:
 *     summary: Add a coupon
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discountValue:
 *                 type: number
 *               discountType:
 *                 type: string
 *               minimumOrderValue:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *               usageLimit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coupon added
 */
couponRouter.post('/add', adminAuth, addCoupon);

/**
 * @swagger
 * /api/coupon/remove:
 *   post:
 *     summary: Remove a coupon
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon removed
 */
couponRouter.post('/remove', adminAuth, removeCoupon);

/**
 * @swagger
 * /api/coupon/list:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: List of coupons
 */
couponRouter.get('/list', adminAuth, listCoupons);

/**
 * @swagger
 * /api/coupon/toggle:
 *   post:
 *     summary: Toggle coupon active status
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: Coupon toggled
 */
couponRouter.post('/toggle', adminAuth, toggleActive);

// User functionality (verifying coupons at checkout)
// Note: Can optionally require authUser, or be public. Using authUser here to prevent guest spamming.
/**
 * @swagger
 * /api/coupon/validate:
 *   post:
 *     summary: Validate a coupon
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               orderValue:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coupon validated
 */
couponRouter.post('/validate', authUser, validateCoupon);

/**
 * @swagger
 * /api/coupon/available:
 *   get:
 *     summary: Get available coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: List of available coupons
 */
couponRouter.get('/available', getAvailableCoupons);

export default couponRouter;
