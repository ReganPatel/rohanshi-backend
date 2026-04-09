import mongoose from 'mongoose';
import dotenv from 'dotenv';
import orderModel from './models/orderModel.js';
import productModel from './models/productModel.js';
import userModel from './models/userModel.js';
import fs from 'fs';

dotenv.config();

const generateData = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        console.log("Connected to MongoDB successfully.");

        const users = await userModel.find({});
        const products = await productModel.find({});

        fs.writeFileSync('debug.txt', `Initial lookup: Found ${users.length} users and ${products.length} products.`);

        if (users.length === 0 || products.length === 0) {
            console.log("Not enough users or products in the database. Please add some first.");
            process.exit(1);
        }

        console.log(`Found ${users.length} users and ${products.length} products.`);

        let productIndex = 0;

        for (let u = 0; u < users.length; u++) {
            const user = users[u];
            console.log(`Generating orders for user ${u + 1}/${users.length}: ${user.name}`);
             
            // Generate 5 distinct orders per user
            for (let i = 0; i < 5; i++) {
                 // Select different product for each order. Wrap around using modulo.
                 // This ensures that eventually all products get covered if there are enough users.
                 const product = products[productIndex % products.length];
                 productIndex++;

                 // Create an Order
                 const orderData = {
                    userId: user._id.toString(),
                    items: [{
                        ...product.toObject(),
                        quantity: 1,
                        size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'N/A' // default size
                    }],
                    amount: product.price + 50, // price + delivery fee
                    address: {
                        firstName: user.name,
                        lastName: "Doe",
                        email: user.email,
                        street: "123 Test Street",
                        city: "TestCity",
                        state: "TestState",
                        zipcode: "12345",
                        country: "TestCountry",
                        phone: "1234567890"
                    },
                    subtotal: product.price,
                    discount: 0,
                    deliveryFee: 50,
                    status: 'Delivered', // Explicitly requested delivered
                    paymentMethod: "COD",
                    payment: true, 
                    date: Date.now() - Math.floor(Math.random() * 10000000000), // Random past date
                    deliveryDate: Date.now(), // set delivery date
                    statusHistory: [
                        { status: 'Order Placed', date: Date.now() - 100000, details: 'Your order has been placed successfully.' },
                        { status: 'Delivered', date: Date.now(), details: 'Your item has been delivered.' }
                    ]
                 }

                 const newOrder = new orderModel(orderData);
                 await newOrder.save();

                 // Add Review for this product by this user
                 const review = {
                     userId: user._id.toString(),
                     name: user.name,
                     rating: 4 + Math.round(Math.random()), // either 4 or 5 stars
                     comment: "This is an auto-generated review for product testing.",
                     date: Date.now()
                 };

                 // Update Product
                 // Push the new review, calculate fake new rating/numReviews
                 await productModel.findByIdAndUpdate(product._id, {
                     $push: { reviews: review },
                     $inc: { numReviews: 1 },
                     rating: 4.5 // Using static rating 4.5
                 });
             }
        }

        console.log("Data generation completed effectively! 5 Orders + 5 Reviews added per user.");
        process.exit(0);

    } catch (error) {
         console.log("Error:", error);
         process.exit(1);
    }
}

generateData();
