const nodemailer = require("nodemailer");
const secrets = require("./secrets");

const mailerConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: secrets.MAILER_AUTH.USER,
    pass: secrets.MAILER_AUTH.PASS,
  },
};

// mailer transport
module.exports = nodemailer.createTransport(mailerConfig);
