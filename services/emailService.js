//const nodemailer = require("nodemailer");
const {Resend}=require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({from,to,subject,text,html}) => {
    const data = await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html,
    })
};
module.exports = sendEmail;
