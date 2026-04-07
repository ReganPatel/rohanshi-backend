import jwt from 'jsonwebtoken'

const adminAuth = async (req,res,next) => {
    try {
        next()
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }) 
    }
}

export default adminAuth