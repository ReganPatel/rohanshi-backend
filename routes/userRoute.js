import express from 'express';
import { loginUser, registerUser, adminLogin, verifyAdminOTP, adminForgotPassword, adminResetPassword, verifyOTP, resendOTP, forgotPassword, resetPassword, getUserProfile, updateUserProfile, addUserAddress, removeUserAddress, updateUserAddress } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', upload.single('image'), registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin);
userRouter.post('/admin/verify', verifyAdminOTP);
userRouter.post('/admin/forgot-password', adminForgotPassword);
userRouter.post('/admin/reset-password', adminResetPassword);
userRouter.post('/verify-otp', verifyOTP);
userRouter.post('/resend-otp', resendOTP);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

userRouter.get('/profile', authUser, getUserProfile);
userRouter.post('/update-profile', authUser, updateUserProfile);
userRouter.post('/add-address', authUser, addUserAddress);
userRouter.post('/remove-address', authUser, removeUserAddress);
userRouter.post('/update-address', authUser, updateUserAddress);

export default userRouter;