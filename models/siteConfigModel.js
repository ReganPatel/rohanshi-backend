import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema({
    heroImages: { type: Array, default: [] },
    latestProducts: { type: Array, default: [] },
    bestsellerProducts: { type: Array, default: [] },
    facebookLink: { type: String, default: "" },
    instagramLink: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" }
})

const siteConfigModel = mongoose.models.siteconfig || mongoose.model("siteconfig", siteConfigSchema)

export default siteConfigModel
