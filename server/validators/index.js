const apartments = require("./apartments");
const auth = require("./auth");
const buildings = require("./buildings");
const files = require("./files");
const tickets = require("./tickets");

module.exports = {
  ...apartments,
  ...auth,
  ...buildings,
  ...files,
  ...tickets,
};
