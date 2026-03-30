import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' });
    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        
        // Check if user is blocked
        const user = await userModel.findById(token_decode.id);
        if (user && user.isBlocked) {
            return res.json({ success: false, message: 'Your account has been blocked. Please contact support.' });
        }

        req.body = req.body || {};
        req.body.userId = token_decode.id
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export default authUser