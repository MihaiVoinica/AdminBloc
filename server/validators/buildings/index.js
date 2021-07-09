const validateCreateBuildingInput = require("./create-building");
const validateUpdateBuildingInput = require("./update-building");
const validateAssignManagerInput = require("./assign-manager");
const validateRemoveManagerInput = require("./remove-manager");
const validateCreateBillInput = require("./create-bill");
const validateRemoveBillInput = require("./remove-bill");

module.exports = {
  validateCreateBuildingInput,
  validateUpdateBuildingInput,
  validateAssignManagerInput,
  validateRemoveManagerInput,
  validateCreateBillInput,
  validateRemoveBillInput,
};
