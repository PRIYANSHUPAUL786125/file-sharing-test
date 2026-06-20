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
const COOKIE_SETTINGS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
}
const loginRoute = asyncHandler(async (req, res) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const scopes = ["openid", "profile", "email"];
    // console.log(google);
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);

    res.cookie("google_oauth_state", state, COOKIE_SETTINGS);

    res.cookie("google_code_verifier", codeVerifier, COOKIE_SETTINGS);

    res.redirect(url.toString());
});
;
const callbackFunction = asyncHandler(async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    const storedState = req.cookies.google_oauth_state;
    const storedCodeVerifier = req.cookies.google_code_verifier;
console.log("cookies:", req.cookies);
console.log("storedState:", storedState);
console.log("storedCodeVerifier:", storedCodeVerifier);
console.log("incomingState:", state);
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

    res.clearCookie("google_oauth_state", COOKIE_SETTINGS);
    res.clearCookie("google_code_verifier", COOKIE_SETTINGS);

    res.cookie("refreshToken", refreshToken, COOKIE_SETTINGS);
    res.cookie("accessToken", accessToken, COOKIE_SETTINGS);
    res.redirect(process.env.REACT_URL);
});
const refreshTokenController = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            401,
            "Refresh token is missing. Please log in again.",
        );
    }

    // console.log(incomingRefreshToken)
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
    res.cookie("refreshToken", newRefreshToken, COOKIE_SETTINGS);
    res.cookie("accessToken", accessToken, COOKIE_SETTINGS);
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
                { new: true },
            );
        }
    }

   

    res.clearCookie("refreshToken", COOKIE_SETTINGS);
    res.clearCookie("accessToken", COOKIE_SETTINGS);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});
module.exports = {
    loginRoute,
    callbackFunction,
    refreshTokenController,
    logoutController,
};
