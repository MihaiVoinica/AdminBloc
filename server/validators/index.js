const apartments = require("./apartments");
const auth = require("./auth");
const buildings = require("./buildings");
const files = require("./files");

module.exports = {
  ...apartments,
  ...auth,
  ...buildings,
  ...files,
};
