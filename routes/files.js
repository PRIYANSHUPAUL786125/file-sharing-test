const router=require('express').Router();
const upload=require('../middlewares/multer.js');
const {protect}=require("../middlewares/auth.js");
const {uploadfile,showfile,sendFile}=require('../controllers/files.js');
router.post('/',protect,upload,uploadfile)
router.get('/download/:uuid',protect,showfile);
router.post("/send",protect,sendFile)
router.get("/", (req, res) => {
    res.send("API is running");
});
module.exports=router