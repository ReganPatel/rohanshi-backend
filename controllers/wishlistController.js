import userModel from "../models/userModel.js"

// add product to user wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        const userData = await userModel.findById(userId);
        let wishlist = userData.wishlist || [];

        if (!wishlist.includes(itemId)) {
            wishlist.push(itemId);
        }

        await userModel.findByIdAndUpdate(userId, { wishlist });

        res.json({ success: true, message: "Added to Wishlist" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// remove product from user wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        const userData = await userModel.findById(userId);
        let wishlist = userData.wishlist || [];

        wishlist = wishlist.filter(id => id !== itemId);

        await userModel.findByIdAndUpdate(userId, { wishlist });

        res.json({ success: true, message: "Removed from Wishlist" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// get user wishlist data
const getUserWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        const userData = await userModel.findById(userId);
        let wishlist = userData.wishlist || [];

        res.json({ success: true, wishlist });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addToWishlist, removeFromWishlist, getUserWishlist }
