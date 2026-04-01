import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, updateProduct, addProductReview } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and viewing
 */

/**
 * @swagger
 * /api/product/add:
 *   post:
 *     summary: Add a new product (Admin)
 *     tags: [Products]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               sizes:
 *                 type: string
 *               bestseller:
 *                 type: boolean
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product added
 */
productRouter.post('/add', adminAuth, upload.array('images', 10), addProduct);

/**
 * @swagger
 * /api/product/remove:
 *   post:
 *     summary: Remove a product (Admin)
 *     tags: [Products]
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
 *         description: Product removed
 */
productRouter.post('/remove', adminAuth, removeProduct);

/**
 * @swagger
 * /api/product/update:
 *   post:
 *     summary: Update a product (Admin)
 *     tags: [Products]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated
 */
productRouter.post('/update', adminAuth, upload.array('images', 10), updateProduct);

/**
 * @swagger
 * /api/product/single:
 *   post:
 *     summary: Get single product
 *     tags: [Products]
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
 *         description: Single product detail
 */
productRouter.post('/single', singleProduct);

/**
 * @swagger
 * /api/product/list:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
productRouter.get('/list', listProducts);

/**
 * @swagger
 * /api/product/review:
 *   post:
 *     summary: Add product review
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review added
 */
productRouter.post('/review', authUser, addProductReview);

export default productRouter