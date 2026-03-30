import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, originalPrice, category, subCategory, sizes, colors, colorStock, sizeStock, colorImageIndices, bestseller, latest, stock } = req.body
        
        if (Number(stock) < 0) return res.json({ success: false, message: "Total stock cannot be negative" });

        const parsedColorStock = JSON.parse(colorStock || "{}");
        for (const color in parsedColorStock) {
            if (Number(parsedColorStock[color]) < 0) {
                return res.json({ success: false, message: `Stock for color ${color} cannot be negative` });
            }
        }

        const parsedSizeStock = JSON.parse(sizeStock || "{}");
        for (const size in parsedSizeStock) {
            if (Number(parsedSizeStock[size]) < 0) {
                return res.json({ success: false, message: `Stock for size ${size} cannot be negative` });
            }
        }

        const images = req.files || [];

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const ProductData = {
            name,
            description,
            category,
            price: Number(price),
            originalPrice: Number(originalPrice) || 0,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            latest: latest === "true" ? true : false,
            sizes: JSON.parse(sizes || "[]"),
            colors: JSON.parse(colors || "[]"),
            colorStock: parsedColorStock,
            sizeStock: parsedSizeStock,
            image: imagesUrl,
            colorImage: {},
            stock: Number(stock) || 0,
            date: Date.now()
        }

        const indices = JSON.parse(colorImageIndices || "{}");
        for (const [color, index] of Object.entries(indices)) {
            if (imagesUrl[index]) {
                ProductData.colorImage[color] = imagesUrl[index];
            }
        }

        console.log(ProductData);

        const product = new productModel(ProductData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {

        const products = await productModel.find({});
        res.json({ success: true, products })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// function for editing a product
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, originalPrice, category, subCategory, sizes, colors, colorStock, sizeStock, existingColorImage, colorImageIndices, isColorImagesOnly, stock } = req.body;

        if (Number(stock) < 0) return res.json({ success: false, message: "Total stock cannot be negative" });

        const parsedColorStock = JSON.parse(colorStock || "{}");
        for (const color in parsedColorStock) {
            if (Number(parsedColorStock[color]) < 0) {
                return res.json({ success: false, message: `Stock for color ${color} cannot be negative` });
            }
        }

        const parsedSizeStock = JSON.parse(sizeStock || "{}");
        for (const size in parsedSizeStock) {
            if (Number(parsedSizeStock[size]) < 0) {
                return res.json({ success: false, message: `Stock for size ${size} cannot be negative` });
            }
        }

        const updateData = {
            name,
            description,
            price: Number(price),
            originalPrice: Number(originalPrice) || 0,
            category,
            subCategory,
            sizes: JSON.parse(sizes || "[]"),
            colors: JSON.parse(colors || "[]"),
            colorStock: parsedColorStock,
            sizeStock: parsedSizeStock,
            colorImage: JSON.parse(existingColorImage || "{}"),
            stock: Number(stock) || 0,
        };

        // Handle image updates if images are provided
        const images = req.files || [];
        let imagesUrl = [];

        if (images.length > 0) {
            imagesUrl = await Promise.all(
                images.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url;
                })
            );

            // Map the newly uploaded images to colors based on indices
            const indices = JSON.parse(colorImageIndices || "{}");
            for (const [color, index] of Object.entries(indices)) {
                if (imagesUrl[index]) {
                    updateData.colorImage[color] = imagesUrl[index];
                }
            }
        }

        if (isColorImagesOnly === "false") {
            const existingImages = JSON.parse(req.body.existingImages || "[]");
            const imagesOrder = JSON.parse(req.body.imagesOrder || "[]");
            
            const colorIndicesSet = new Set(Object.values(JSON.parse(req.body.colorImageIndices || "{}")));
            const primaryNewImages = imagesUrl.filter((_, index) => !colorIndicesSet.has(index));
            
            if (imagesOrder.length > 0) {
                // If explicit order is provided, use it
                let newImgIdx = 0;
                updateData.image = imagesOrder.map(item => {
                    if (item.startsWith("new_file_")) {
                        return primaryNewImages[newImgIdx++] || null;
                    }
                    return item;
                }).filter(img => img !== null);
            } else {
                // Default fallback
                updateData.image = [...existingImages, ...primaryNewImages];
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

        if (updatedProduct) {
            res.json({ success: true, message: "Product Updated" });
        } else {
            res.json({ success: false, message: "Product not found" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for adding a product review
const addProductReview = async (req, res) => {
    try {
        const { rating, comment, productId, userId } = req.body;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.json({ success: false, message: 'Product not found' });
        }

        // Verify the user has purchased this item and the order is delivered
        const userOrders = await orderModel.find({ userId, status: 'Delivered' });

        const hasPurchased = userOrders.some(order =>
            order.items.some(item => item._id === productId)
        );

        if (!hasPurchased) {
            return res.json({ success: false, message: 'You can only review products that have been delivered to you' });
        }

        // Optional: Check if the user already reviewed this product
        const alreadyReviewed = product.reviews.find(
            (r) => r.userId.toString() === userId.toString()
        );

        if (alreadyReviewed) {
            return res.json({ success: false, message: 'Product already reviewed' });
        }

        let userName = 'Anonymous';
        if (req.body.userName) {
            userName = req.body.userName;
        } else {
            const user = await userModel.findById(userId);
            if (user && user.name) {
                userName = user.name;
            }
        }

        const review = {
            userId: userId,
            name: userName,
            rating: Number(rating),
            comment,
            date: Date.now()
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.json({ success: true, message: 'Review added' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct, addProductReview }
