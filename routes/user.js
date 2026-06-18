const router = require("express").Router();
const {
    loginRoute,
    callbackFunction,
    refreshTokenController,
    logoutController
} = require("../controllers/user.js");
const {protect}=require("../middlewares/auth.js")
router.get("/login", loginRoute);
router.get("/login/google/callback", callbackFunction);
router.post("/refresh-token", refreshTokenController);
router.post("/logout",logoutController)
router.get("/check",protect,(req,res)=>{
    res.send("you are logined");
})
module.exports = router;
