const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const generateAccessToken = (payload) => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error(
            "ACCESS_TOKEN_SECRET is not defined in environment variables.",
        );
    }
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (payload) => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new Error(
            "REFRESH_TOKEN_SECRET is not defined in environment variables.",
        );
    }
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const verifyAccessToken = (token) => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error(
            "ACCESS_TOKEN_SECRET is not defined in environment variables.",
        );
    }
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return { valid: true, expired: false, payload };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return { valid: false, expired: true, payload: null };
        }
        return { valid: false, expired: false, payload: null };
    }
};

const verifyRefreshToken = (token) => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new Error(
            "REFRESH_TOKEN_SECRET is not defined in environment variables.",
        );
    }
    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
        return payload; 
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return null;
        }
        return null;
    }
};
const generateTokenPair = (payload) => {
    const accessToken = generateAccessToken(payload);
    
    const targetUserId = payload.userId || payload._id;

    const refreshToken = generateRefreshToken({ userId: targetUserId });
    
    return { accessToken, refreshToken };
};


const rotateTokens = (refreshToken) => {
    const { valid, expired, payload } = verifyRefreshToken(refreshToken);

    if (expired) {
        throw new Error("Refresh token has expired. Please log in again.");
    }
    if (!valid || !payload) {
        throw new Error("Invalid refresh token.");
    }

    const newPair = generateTokenPair({ userId: payload.userId });
    return { ...newPair, payload };
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
};

module.exports = {
    decodeToken,
    rotateTokens,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
};
