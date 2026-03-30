import express from 'express';
import { getDashboardData, listUsers, toggleUserStatus, getRevenueStats } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminRouter = express.Router();

adminRouter.get('/dashboard', adminAuth, getDashboardData);
adminRouter.get('/users', adminAuth, listUsers);
adminRouter.post('/user/status', adminAuth, toggleUserStatus);
adminRouter.get('/revenue-stats', adminAuth, getRevenueStats);

export default adminRouter;
