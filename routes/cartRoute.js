import express from 'express'
import { addToCart, getUserCart, updateCart } from '../controllers/cartController.js'
import authUser from '../middleware/auth.js'

const cartRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

/**
 * @swagger
 * /api/cart/get:
 *   post:
 *     summary: Get user cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: User cart retrieved
 */
cartRouter.post('/get',authUser, getUserCart)

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               size:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added
 */
cartRouter.post('/add',authUser, addToCart)

/**
 * @swagger
 * /api/cart/update:
 *   post:
 *     summary: Update cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               size:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated
 */
cartRouter.post('/update',authUser, updateCart)

export default cartRouter