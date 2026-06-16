const cron = require("node-cron");
const fs = require("fs/promises");
const path = require("path");
const File = require("../models/File.js");
const asyncHandler = require("./asyncHandler.js");
cron.schedule(
    "0 * * * *",
    asyncHandler(async () => {
        const expiredFiles = await File.find({
            expiresAt: {
                $lt: new Date(),
            },
        });
        for (const file of expiredFiles) {
            const fileLocation = path.join(__dirname, "..", file.path);
            await fs.unlink(fileLocation);
            const id = file._id;
            await File.deleteOne({ _id: file._id });
            console.log("file deleted with id:", id);
        }
    }),
);
