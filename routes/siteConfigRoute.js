import express from 'express'
import { getSiteConfig, updateSiteConfig } from '../controllers/siteConfigController.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'

const siteConfigRouter = express.Router()

siteConfigRouter.get('/', getSiteConfig)

// Support uploading up to 10 hero images at once
siteConfigRouter.post('/', adminAuth, upload.array('newHeroImages', 10), updateSiteConfig)

export default siteConfigRouter
