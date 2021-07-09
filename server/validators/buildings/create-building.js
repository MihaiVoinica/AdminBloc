const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateCreateBuildingInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.name || ""))) {
    errors.name = "Name field is required";
  }
  if (Validator.isEmpty(String(data.address || ""))) {
    errors.address = "Address field is required";
  }
  if (!Validator.isInt(String(data.apartmentsCount))) {
    errors.apartmentsCount = "ApartmentsCount field is not an integer";
  }

  // Transforms
  data.apartmentsCount = Number(data.apartmentsCount);

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
