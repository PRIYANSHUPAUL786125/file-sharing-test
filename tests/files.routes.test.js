
const request = require("supertest");
const express = require("express");

jest.mock("../middlewares/multer.js", () => ({
    uploadSingle: jest.fn((req, res, next) => next()),
    validateFileSignature: jest.fn((req, res, next) => next()),
}));

jest.mock("../middlewares/auth.js", () => ({
    protect: jest.fn((req, res, next) => {
        req.user = { id: "user123" };
        next();
    }),
}));

jest.mock("../middlewares/rateLimit.js", () => ({
    uploadLimiter: jest.fn((req, res, next) => next()),
}));

jest.mock("../controllers/files.js", () => ({
    uploadfile: jest.fn((req, res) =>
        res.status(201).json({ success: true, message: "File uploaded" })
    ),
    showfile: jest.fn((req, res) =>
        res.status(200).json({
            success: true,
            uuid: req.params.uuid,
        })
    ),
    sendFile: jest.fn((req, res) =>
        res.status(200).json({ success: true, message: "File sent" })
    ),
}));

const filesRouter = require("../routes/files.js");

const app = express();
app.use(express.json());
app.use("/api/files", filesRouter);

describe("Files routes", () => {
    test("GET / should return API status", async () => {
        const res = await request(app).get("/api/files");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: "API is running",
        });
    });

    test("POST / should invoke upload pipeline", async () => {
        const res = await request(app).post("/api/files");

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        const { uploadLimiter } = require("../middlewares/rateLimit.js");
        const { protect } = require("../middlewares/auth.js");
        const {
            uploadSingle,
            validateFileSignature,
        } = require("../middlewares/multer.js");
        const { uploadfile } = require("../controllers/files.js");

        expect(uploadLimiter).toHaveBeenCalled();
        expect(protect).toHaveBeenCalled();
        expect(uploadSingle).toHaveBeenCalled();
        expect(validateFileSignature).toHaveBeenCalled();
        expect(uploadfile).toHaveBeenCalled();
    });

    test("GET /download/:uuid should return file information", async () => {
        const res = await request(app).get(
            "/api/files/download/file-abc"
        );

        expect(res.status).toBe(200);
        expect(res.body.uuid).toBe("file-abc");
    });

    test("POST /send should invoke sendFile controller", async () => {
        const res = await request(app).post("/api/files/send");

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("File sent");

        const { sendFile } = require("../controllers/files.js");
        expect(sendFile).toHaveBeenCalled();
    });
});
