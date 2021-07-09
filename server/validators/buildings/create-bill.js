const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateCreateBillInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.name || ""))) {
    errors.name = "Name field is required";
  }
  if (Validator.isEmpty(String(data.type || ""))) {
    errors.type = "Type field is required";
  }
  if (!Validator.isNumeric(String(data.value))) {
    errors.value = "Value field is not an integer";
  }

  // Transforms
  data.value = Number(data.value);

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
