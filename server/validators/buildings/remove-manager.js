const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRemoveManagerInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.email || ""))) {
    errors.email = "Email field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
