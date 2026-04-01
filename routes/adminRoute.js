import express from 'express';
import { getDashboardData, listUsers, toggleUserStatus, getRevenueStats } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and management operations
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard overview metrics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
adminRouter.get('/dashboard', adminAuth, getDashboardData);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
adminRouter.get('/users', adminAuth, listUsers);

/**
 * @swagger
 * /api/admin/user/status:
 *   post:
 *     summary: Toggle user active status
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status toggled
 */
adminRouter.post('/user/status', adminAuth, toggleUserStatus);

/**
 * @swagger
 * /api/admin/revenue-stats:
 *   get:
 *     summary: Get revenue statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Revenue stats retrieved
 */
adminRouter.get('/revenue-stats', adminAuth, getRevenueStats);

export default adminRouter;
