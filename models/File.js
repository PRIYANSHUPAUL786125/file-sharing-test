const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema(
    {
        filename: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true },
        uuid: { type: String, required: true, unique: true, index: true },
        sender: { type: String, required: false },
        receiver: { type: String, required: false },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 1000 * 60 * 60 * 24),
            index: true,
        },
    },
    { timestamps: true },
);
module.exports = mongoose.model("File", fileSchema);
