// const router=require('express').Router();
// const upload=require('../middlewares/multer.js');
// const {protect}=require("../middlewares/auth.js");
// const {uploadfile,showfile,sendFile}=require('../controllers/files.js');
// router.post('/',protect,upload,uploadfile)
// router.get('/download/:uuid',protect,showfile);
// router.post("/send",protect,sendFile)
// router.get("/", (req, res) => {
//     res.send("API is running");
// });
// module.exports=router
const router = require("express").Router();
const { uploadSingle, validateFileSignature } = require("../middlewares/multer.js");
const { protect } = require("../middlewares/auth.js");
const { uploadLimiter } = require("../middlewares/rateLimit.js"); 
const { uploadfile, showfile, sendFile } = require("../controllers/files.js");

router.get("/", (req, res) => {
    res.json({ success: true, message: "API is running" });
});

router.post("/", uploadLimiter, protect, uploadSingle, validateFileSignature, uploadfile);
// router.post("/2", uploadLimiter, uploadSingle, validateFileSignature, uploadfile); //this is for test only
router.get("/download/:uuid", protect, showfile);
router.post("/send", protect, sendFile);

module.exports = router;