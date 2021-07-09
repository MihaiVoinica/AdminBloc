const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRemoveBillInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(data.id || "")) {
    errors.id = "Id field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
