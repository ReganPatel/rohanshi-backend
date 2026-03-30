import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, updateProduct, addProductReview } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.array('images', 10), addProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/update', adminAuth, upload.array('images', 10), updateProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.post('/review', authUser, addProductReview);

export default productRouter