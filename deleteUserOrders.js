import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from './models/userModel.js';
import orderModel from './models/orderModel.js';

dotenv.config();

const deleteOrders = async () => {
    try {
        const email = "reganpatel20@gmail.com";
        console.log(`Connecting to database...`);
        
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        console.log("DB Connected");

        // Find the user by email
        const user = await userModel.findOne({ email });
        
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(0);
        }

        const userId = user._id.toString();
        console.log(`Found user: ${user.name} (ID: ${userId})`);

        // Find and delete all orders for this user
        const result = await orderModel.deleteMany({ userId });
        
        console.log(`Successfully deleted ${result.deletedCount} orders for user ${email}.`);
        
        process.exit(0);
    } catch (error) {
        console.error("Error deleting orders:", error);
        process.exit(1);
    }
};

deleteOrders();
