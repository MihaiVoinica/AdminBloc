const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateCreateTicketInput(data) {
  let errors = {};

  // Fields checks
  if (Validator.isEmpty(String(data.apartmentId || ""))) {
    errors.apartmentId = "ApartmentId field is required";
  }
  if (Validator.isEmpty(String(data.name || ""))) {
    errors.name = "Name field is required";
  }
  if (Validator.isEmpty(String(data.comment || ""))) {
    errors.comment = "Comment field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
