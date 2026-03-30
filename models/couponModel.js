import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountAmount: { type: Number, required: true },
    minimumPurchase: { type: Number, default: 0 },
    expirationDate: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema);

export default couponModel;
