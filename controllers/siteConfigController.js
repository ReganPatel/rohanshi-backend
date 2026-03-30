import siteConfigModel from "../models/siteConfigModel.js"
import { v2 as cloudinary } from "cloudinary"

const getSiteConfig = async (req, res) => {
    try {
        let config = await siteConfigModel.findOne()

        // If config doesn't exist, create an empty one
        if (!config) {
            config = new siteConfigModel({})
            await config.save()
        }
        res.json({ success: true, config })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateSiteConfig = async (req, res) => {
    try {
        const { latestProducts, bestsellerProducts, existingHeroImages, facebookLink, instagramLink, contactEmail, contactPhone } = req.body
        const newHeroImagesFiles = req.files || []

        let config = await siteConfigModel.findOne()
        if (!config) {
            config = new siteConfigModel({})
        }

        // Handle image updates
        let uploadedImagesUrls = []
        if (newHeroImagesFiles.length > 0) {
            uploadedImagesUrls = await Promise.all(
                newHeroImagesFiles.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' })
                    return result.secure_url
                })
            )
        }

        // Merge existing retained images with newly uploaded images
        // existingHeroImages could be a string if only one is passed, or an array, or undefined
        let retainedImages = []
        if (existingHeroImages) {
            if (Array.isArray(existingHeroImages)) {
                retainedImages = existingHeroImages
            } else {
                retainedImages = [existingHeroImages]
            }
        }

        const finalHeroImages = [...retainedImages, ...uploadedImagesUrls]

        // Parse product arrays
        const parsedLatestProducts = JSON.parse(latestProducts || "[]")
        const parsedBestsellerProducts = JSON.parse(bestsellerProducts || "[]")

        config.heroImages = finalHeroImages
        config.latestProducts = parsedLatestProducts
        config.bestsellerProducts = parsedBestsellerProducts
        config.facebookLink = facebookLink || ""
        config.instagramLink = instagramLink || ""
        config.contactEmail = contactEmail || ""
        config.contactPhone = contactPhone || ""

        await config.save()

        res.json({ success: true, message: "Site configuration updated successfully", config })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getSiteConfig, updateSiteConfig }
