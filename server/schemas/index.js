const Apartments = require("./apartments");
const Buildings = require("./buildings");
const Files = require("./files");
const common = require("./common");
const Tickets = require("./tickets");
const Users = require("./users");

module.exports = {
  ...common,
  Apartments,
  Buildings,
  Files,
  Tickets,
  Users,
};
