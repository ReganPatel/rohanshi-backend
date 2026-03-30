import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    wishlist: { type: Array, default: [] },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: "" },
    otpExpiresAt: { type: Date },
    addresses: { type: Array, default: [] },
    adminRole: { type: String, default: 'viewer' },
    profilePhoto: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel