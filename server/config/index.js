const serverConfig = require("./server");
const usersConfig = require("./users");
const nodemailerTransporter = require("./mailer");
const secrets = require("./secrets");

module.exports = {
  serverConfig,
  usersConfig,
  nodemailerTransporter,
  secrets,
};
