const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateCreateFileInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.buildingId || ""))) {
    errors.buildingId = "BuildingId field is required";
  }
  if (Validator.isEmpty(String(data.name || ""))) {
    errors.name = "Name field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
