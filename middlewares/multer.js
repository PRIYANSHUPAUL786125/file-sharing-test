// const multer = require("multer");
// const path = require("path");
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/");
//     },
//     filename: function (req, file, cb) {
//         const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//         cb(null, uniqueName);
//     },
// });

// const upload = multer({
//     storage,
//     limits: { fileSize: 1000000 * 10 },
// }).single("myfile");
// module.exports = upload;

const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const extToMime = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (!extToMime[ext] || extToMime[ext] !== file.mimetype) {
            return cb(new Error("Unsupported file type"));
        }

        cb(null, true);
    }
}).single("myfile");

const uploadSingle = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            const message =
                err.code === "LIMIT_FILE_SIZE"
                    ? "File exceeds 10 MB limit"
                    : err.message;
            return res.status(400).json({ success: false, message });
        }

        if (err) {
            return res.status(415).json({ success: false, message: err.message });
        }

        next();
    });
};

async function validateFileSignature(req, res, next) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "File is required"
        });
    }

    try {
        const { fileTypeFromFile } = await import("file-type");
        const detected = await fileTypeFromFile(req.file.path);

        const ext = path.extname(req.file.originalname).toLowerCase();

        const valid =
            detected &&
            extToMime[ext] === detected.mime &&
            detected.mime === req.file.mimetype;

        if (!valid) {
            await fsp.unlink(req.file.path).catch(() => {});

            return res.status(415).json({
                success: false,
                message: "File content does not match an allowed type"
            });
        }

        next();
    } catch (error) {
        await fsp.unlink(req.file.path).catch(() => {});
        next(error);
    }
}

module.exports = {
    uploadSingle,
    validateFileSignature
};

/*
Usage in your routes file:

const { uploadLimiter } = require("./rateLimiter");
const { uploadSingle, validateFileSignature } = require("./upload.middleware");

router.post("/upload", uploadLimiter, uploadSingle, validateFileSignature, handler);

Also make sure there is NO express.static("uploads") anywhere. Serve files through
an authenticated route using res.download(filePath, originalNameFromDb).
*/