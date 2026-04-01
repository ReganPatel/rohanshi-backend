import express from 'express';
import { addToWishlist, removeFromWishlist, getUserWishlist } from '../controllers/wishlistController.js';
import authUser from '../middleware/auth.js';

const wishlistRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: User wishlist management
 */

/**
 * @swagger
 * /api/wishlist/add:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to wishlist
 */
wishlistRouter.post('/add', authUser, addToWishlist);

/**
 * @swagger
 * /api/wishlist/remove:
 *   post:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 */
wishlistRouter.post('/remove', authUser, removeFromWishlist);

/**
 * @swagger
 * /api/wishlist/get:
 *   post:
 *     summary: Get user wishlist
 *     tags: [Wishlist]
 *     responses:
 *       200:
 *         description: User wishlist retrieved
 */
wishlistRouter.post('/get', authUser, getUserWishlist);

export default wishlistRouter;
