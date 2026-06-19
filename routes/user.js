const router = require("express").Router();
const {
    loginRoute,
    callbackFunction,
    refreshTokenController,
    logoutController
} = require("../controllers/user.js");
const {protect}=require("../middlewares/auth.js")
router.get("/login", loginRoute);
// {"statusCode":200,"data":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTMzY2ViN2JhNzA5MjBhNzI2Y2MzZDAiLCJlbWFpbCI6InRza3ByaXlhbnNodTIwMDVAZ21haWwuY29tIiwiaWF0IjoxNzgxODY3MjgzLCJleHAiOjE3ODE4NjgxODN9.rhgKNokE4f7HBHy65mtNHFA_2y23NijPCNlO90M4cZU"},"message":"Logged in successfully","success":true} also with refreshToken as http only cookie
router.get("/login/google/callback", callbackFunction);
router.post("/refresh-token", refreshTokenController);
router.post("/logout",logoutController)
router.get("/check",protect,(req,res)=>{
    res.send("you are logined");
})
module.exports = router;
