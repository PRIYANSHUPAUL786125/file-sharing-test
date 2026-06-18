const ApiError = require("../utils/apiError.js"); 
const asyncHandler = require("../utils/asyncHandler.js");
const { verifyAccessToken } = require("../utils/tokenutils.js");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        throw new ApiError(401, "Not authorized to access this route. Token missing.");
    }

    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
        throw new ApiError(401, "Token has expired or is invalid.");
    }

    req.user = decoded;

    next();
});

module.exports = { protect };