const { Google } = require("arctic");
const cookieParser = require("cookie-parser");
const {
    generateState,
    generateCodeVerifier,
    decodeIdToken,
} = require("arctic");

const { google } = require("../services/authService.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/apiError.js");
const ApiResponse = require("../utils/apiResponse.js");
const User = require("../models/User.js");
const {
    generateTokenPair,
    verifyRefreshToken,
} = require("../utils/tokenutils.js");
const loginRoute = asyncHandler(async (req, res) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const scopes = ["openid", "profile", "email"];
    // console.log(google);
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);

    res.cookie("google_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
        path: "/",
    });

    res.cookie("google_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
        path: "/",
    });

    res.redirect(url.toString());
});

const callbackFunction = asyncHandler(async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    const storedState = req.cookies.google_oauth_state;
    const storedCodeVerifier = req.cookies.google_code_verifier;

    if (
        !code ||
        !state ||
        !storedState ||
        !storedCodeVerifier ||
        state !== storedState
    ) {
        throw new ApiError(400, "Invalid or expired session request");
    }

    const tokens = await google.validateAuthorizationCode(
        code,
        storedCodeVerifier,
    );

    const idToken = tokens.idToken();
    const claims = decodeIdToken(idToken);
    // console.log(claims);

    const googleUserId = claims.sub;
    const name = claims.name;
    const email = claims.email;
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
        user = await User.create({
            email,
            name,
            googleId: googleUserId,
        });
        isNewUser = true;
    }

    const tokenPayload = { userId: user._id, email: user.email };
    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    res.clearCookie("google_oauth_state");
    res.clearCookie("google_code_verifier");

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching your token expiry
    });

    const message = isNewUser
        ? "Account created and logged in successfully"
        : "Logged in successfully";

    return res
        .status(200) 
        .json(new ApiResponse(200, { accessToken }, message));
});
const refreshTokenController = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            401,
            "Refresh token is missing. Please log in again.",
        );
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);
    if (!decoded) {
        throw new ApiError(403, "Refresh token is invalid or expired.");
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(403, "Refresh token has been revoked or used.");
    }
    const tokenPayload = { userId: user._id, email: user.email };
    const { accessToken, refreshToken: newRefreshToken } =
        generateTokenPair(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save();
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Token refreshed successfully",
            ),
        );
});
const logoutController = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (incomingRefreshToken) {
        const decoded = verifyRefreshToken(incomingRefreshToken);
        
        if (decoded) {
            await User.findByIdAndUpdate(
                decoded.userId,
                { $set: { refreshToken: null } }, // Or remove the field entirely
                { new: true }
            );
        }
    }

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };

    res.clearCookie("refreshToken", cookieOptions);
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});
module.exports = { loginRoute, callbackFunction, refreshTokenController,logoutController };
