import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, requred: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    paymentId: { type: String, default: "" },
    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    couponCode: { type: String, default: "" },
    date: { type: Number, required: true },
    deliveryDate: { type: Number },
    returnReason: { type: String },
    returnImages: { type: Array, default: [] },
    statusHistory: { type: Array, default: [] }
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)

export default orderModel;