const validateCreateApartmentInput = require("./create-apartment");
const validateAssignOwnerInput = require("./assign-owner");
const validateRemoveOwnerInput = require("./remove-owner");
const validateCreateMeterInput = require("./create-meter");
const validateUpdateMeterInput = require("./update-meter");
const validateRemoveMeterInput = require("./remove-meter");

module.exports = {
  validateCreateApartmentInput,
  validateAssignOwnerInput,
  validateRemoveOwnerInput,
  validateCreateMeterInput,
  validateUpdateMeterInput,
  validateRemoveMeterInput,
};
