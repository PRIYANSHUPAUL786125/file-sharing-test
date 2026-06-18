const File = require("../models/File.js");
const uuid = require("uuid");
const path = require("path");
const ApiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/apiError.js");
const sendEmail = require("../services/emailService.js");
const emailTemplate = require("../services/emailTemplate.js");
const uploadfile = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "file is required");
    }
    // console.log(uuid.v4());
    const file = await File.create({
        filename: req.file.filename,
        uuid: uuid.v4(),
        path: req.file.path,
        size: req.file.size,
    });
    res.status(201).json(
        new ApiResponse(201, {
            file,
            url: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
        }),
    );
});
const showfile = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    // console.log(req.params);
    if (!uuid) {
        throw new ApiError(400, "file id is required");
    }
    const file = await File.findOne({ uuid });
    if (!file) {
        throw new ApiError(400, "file donot exist");
    }
    const fileLocation = path.join(__dirname, "..", file.path);
    res.download(fileLocation, file.filename);
});
const sendFile = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { uuid, emailTo, emailFrom, expiresIn } = req.body;
    if (!uuid || !emailTo || !emailFrom) {
        throw new ApiError(422, "all fields are required");
    }
    const file = await File.findOne({ uuid: uuid });
    if (file.sender) {
        return res.status(422).send({ error: "Email already sent once." });
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    sendEmail({
        from: emailFrom,
        to: emailTo,
        subject: "file sharing",
        text: `${emailFrom} has shared a file with you`,
        html: emailTemplate({
            emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${uuid}`,
            size: file.size,
        }),
    });
    res.status(201).json(new ApiResponse(201, "email send successfully"));
});
// const previewFile=asyncHandler(async (req,res))
module.exports = { uploadfile, showfile, sendFile };
