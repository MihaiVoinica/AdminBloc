const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateAssignOwnerInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.userId || ""))) {
    errors.userId = "UserId field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
