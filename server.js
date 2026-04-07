import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import adminRouter from './routes/adminRoute.js'
import siteConfigRouter from './routes/siteConfigRoute.js'
import wishlistRouter from './routes/wishlistRoute.js'
import couponRouter from './routes/couponRoute.js'
import { swaggerDocs } from './config/swagger.js'

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

//middleware
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/admin', adminRouter)
app.use('/api/siteConfig', siteConfigRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/coupon', couponRouter)

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health Check Endpoint
 *     description: Returns a simple message to confirm the API is running smoothly.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: API Working
 */
app.get('/', (req, res) => {
   res.send("API Working")
})

// Initialize Swagger Docs
swaggerDocs(app);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global error handler caught:", err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

app.listen(port, () => console.log('Server started on PORT : ' + port))