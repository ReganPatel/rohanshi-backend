import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
})

console.log("Cloud config:", process.env.CLOUDINARY_NAME)
