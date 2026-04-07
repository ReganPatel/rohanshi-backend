import multer from "multer";

const storage = multer.diskStorage({
    filename:function (req,file,callback){
        callback(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname)
    }
})

const upload = multer({storage})

export default upload