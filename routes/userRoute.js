import express from 'express';
import { loginUser, registerUser, adminLogin, verifyAdminOTP, adminForgotPassword, adminResetPassword, verifyOTP, resendOTP, forgotPassword, resetPassword, getUserProfile, updateUserProfile, addUserAddress, removeUserAddress, updateUserAddress } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and management
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User registered successfully
 */
userRouter.post('/register', upload.single('image'), registerUser)

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in
 */
userRouter.post('/login', loginUser)

/**
 * @swagger
 * /api/user/admin:
 *   post:
 *     summary: Admin login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin logged in
 */
userRouter.post('/admin', adminLogin);

/**
 * @swagger
 * /api/user/admin/verify:
 *   post:
 *     summary: Verify admin OTP
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Verified
 */
userRouter.post('/admin/verify', verifyAdminOTP);

/**
 * @swagger
 * /api/user/admin/forgot-password:
 *   post:
 *     summary: Admin forgot password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Email sent
 */
userRouter.post('/admin/forgot-password', adminForgotPassword);

/**
 * @swagger
 * /api/user/admin/reset-password:
 *   post:
 *     summary: Admin reset password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password reset
 */
userRouter.post('/admin/reset-password', adminResetPassword);

/**
 * @swagger
 * /api/user/verify-otp:
 *   post:
 *     summary: Verify User OTP
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Verified
 */
userRouter.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/user/resend-otp:
 *   post:
 *     summary: Resend User OTP
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OTP Resent
 */
userRouter.post('/resend-otp', resendOTP);

/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Email sent
 */
userRouter.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Password reset
 */
userRouter.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile details
 */
userRouter.get('/profile', authUser, getUserProfile);

/**
 * @swagger
 * /api/user/update-profile:
 *   post:
 *     summary: Update user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile updated
 */
userRouter.post('/update-profile', authUser, updateUserProfile);

/**
 * @swagger
 * /api/user/add-address:
 *   post:
 *     summary: Add user address
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Address added
 */
userRouter.post('/add-address', authUser, addUserAddress);

/**
 * @swagger
 * /api/user/remove-address:
 *   post:
 *     summary: Remove user address
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Address removed
 */
userRouter.post('/remove-address', authUser, removeUserAddress);

/**
 * @swagger
 * /api/user/update-address:
 *   post:
 *     summary: Update user address
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Address updated
 */
userRouter.post('/update-address', authUser, updateUserAddress);

export default userRouter;