import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    colors: { type: Array, default: [] },
    colorStock: { type: Object, default: {} },
    sizeStock: { type: Object, default: {} },
    colorImage: { type: Object, default: {} },
    bestseller: { type: Boolean, default: false },
    latest: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [
        {
            userId: { type: String, required: true },
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
            date: { type: Number, required: true }
        }
    ],
    stock: { type: Number, required: true, default: 0 },
    date: { type: Number, required: true }
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema)

export default productModel