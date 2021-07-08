const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateCreateMeterInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.name || ""))) {
    errors.name = "Name field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
