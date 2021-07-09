const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateUpdateApartmentInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.buildingId || ""))) {
    errors.buildingId = "BuildingId field is required";
  }
  if (!Validator.isInt(String(data.number))) {
    errors.number = "Number field is not an integer";
  }
  if (!Validator.isInt(String(data.peopleCount))) {
    errors.peopleCount = "PeopleCount field is not an integer";
  }
  if (!Validator.isNumeric(String(data.totalArea))) {
    errors.totalArea = "TotalArea field is not an integer";
  }
  if (!Validator.isNumeric(String(data.radiantArea))) {
    errors.radiantArea = "RadiantArea field is not an integer";
  }
  if (!Validator.isNumeric(String(data.share))) {
    errors.share = "Share field is not an integer";
  }
  if (!Validator.isBoolean(String(data.thermalProvider))) {
    errors.thermalProvider = "ThermalProvider field is not a boolean";
  }

  // Transforms
  data.number = Number(data.number);
  data.peopleCount = Number(data.peopleCount);
  data.totalArea = Number(data.totalArea);
  data.radiantArea = Number(data.radiantArea);
  data.share = Number(data.share);
  data.thermalProvider = Boolean(data.thermalProvider);

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
