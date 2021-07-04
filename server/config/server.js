const PORT = process.env.PORT || 3001;
const LOGGER_PREFIX = "[SERVER]";
// WARNING: keep this value in sync with the client value
const TOKEN_EXPIRY_TIME = 3600; // seconds

module.exports = {
  PORT,
  TOKEN_EXPIRY_TIME,
  LOGGER_PREFIX,
};
