const router=require('express').Router();
const upload=require('../middlewares/multer.js');
const {uploadfile,showfile,sendFile}=require('../controllers/files.js');
router.post('/',upload,uploadfile)
router.get('/download/:uuid',showfile);
router.post("/send",sendFile)
router.get("/", (req, res) => {
    res.send("API is running");
});
module.exports=router