import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    deliveryDate: { type: Number }, // To track when it was delivered 
    returnImages: { type: Array, default: [] }, // Images provided for return
    returnReason: { type: String, default: "" }, // Reason provided for return
    statusHistory: { 
        type: [{
            status: { type: String, required: true },
            date: { type: Number, required: true },
            details: { type: String, default: "" }
        }], 
        default: [] 
    }
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)

const connectDB = async () => {
    mongoose.connection.on('connected',() =>{
        console.log("DB Connected");
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)
}

const runMigration = async () => {
    try {
        await connectDB();
        
        console.log("Looking for orders with status 'Out For Delivery'...");
        
        const orders = await orderModel.find({ status: 'Out For Delivery' });
        
        console.log(`Found ${orders.length} orders to update.`);
        
        for (const order of orders) {
            order.status = 'Out for delivery';
            // Also fix the status history if it's there
            if (order.statusHistory && order.statusHistory.length > 0) {
                order.statusHistory.forEach(historyItem => {
                    if (historyItem.status === 'Out For Delivery') {
                        historyItem.status = 'Out for delivery';
                    }
                });
            }
            await order.save();
        }
        
        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
