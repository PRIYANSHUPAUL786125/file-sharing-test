
const request = require("supertest");
const express = require("express");

jest.mock("../controllers/user.js", () => ({
    loginRoute: jest.fn((req, res) => res.status(200).send("login")),
    callbackFunction: jest.fn((req, res) =>
        res.status(200).send("callback")
    ),
    refreshTokenController: jest.fn((req, res) =>
        res.status(200).json({ message: "refreshed" })
    ),
    logoutController: jest.fn((req, res) =>
        res.status(200).json({ message: "logged out" })
    ),
}));

jest.mock("../middlewares/auth.js", () => ({
    protect: (req, res, next) => {
        req.user = { id: "123", email: "test@example.com" };
        next();
    },
}));

const userRouter = require("../routes/user.js");

const app = express();
app.use(express.json());
app.use("/api/user", userRouter);

describe("User routes", () => {
    test("GET /login should return 200", async () => {
        const res = await request(app).get("/api/user/login");

        expect(res.status).toBe(200);
        expect(res.text).toBe("login");
    });

    test("GET /login/google/callback should return 200", async () => {
        const res = await request(app)
            .get("/api/user/login/google/callback");

        expect(res.status).toBe(200);
        expect(res.text).toBe("callback");
    });

    test("POST /refresh-token should return 200", async () => {
        const res = await request(app)
            .post("/api/user/refresh-token");

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("refreshed");
    });

    test("POST /logout should return 200", async () => {
        const res = await request(app).post("/api/user/logout");

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("logged out");
    });

    test("GET /check should return 200 for authenticated user", async () => {
        const res = await request(app).get("/api/user/check");

        expect(res.status).toBe(200);
        expect(res.text).toBe("you are logined");
    });

    test("GET /me should return the current user", async () => {
        const res = await request(app).get("/api/user/me");

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            id: "123",
            email: "test@example.com",
        });
    });
});
