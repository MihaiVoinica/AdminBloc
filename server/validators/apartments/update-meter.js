const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateUpdateMeterInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.id || ""))) {
    errors.id = "Id field is required";
  }
  if (Validator.isEmpty(String(data.name))) {
    errors.name = "Name field is required";
  }
  if (
    data.hasOwnProperty("value") &&
    !Validator.isNumeric(String(data.value))
  ) {
    errors.value = "Value field is not an integer";
  }

  // Transforms
  if (data.hasOwnProperty("value")) {
    data.value = Number(data.value);
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
