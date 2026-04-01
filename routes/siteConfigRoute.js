import express from 'express'
import { getSiteConfig, updateSiteConfig } from '../controllers/siteConfigController.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'

const siteConfigRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: SiteConfig
 *   description: Site configuration and settings
 */

/**
 * @swagger
 * /api/siteConfig/:
 *   get:
 *     summary: Get site configuration
 *     tags: [SiteConfig]
 *     responses:
 *       200:
 *         description: Site config retrieved
 */
siteConfigRouter.get('/', getSiteConfig)

// Support uploading up to 10 hero images at once
/**
 * @swagger
 * /api/siteConfig/:
 *   post:
 *     summary: Update site configuration (Admin)
 *     tags: [SiteConfig]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               announcementText:
 *                 type: string
 *               instagramLink:
 *                 type: string
 *               twitterLink:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               newHeroImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Site configuration updated
 */
siteConfigRouter.post('/', adminAuth, upload.array('newHeroImages', 10), updateSiteConfig)

export default siteConfigRouter
