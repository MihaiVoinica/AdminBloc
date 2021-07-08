// packages
const express = require("express");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const {
  validateAssignOwnerInput,
  validateCreateApartmentInput,
} = require("../validators");

// schemas
const { Apartments } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route POST /apartments/create
// @desc validate that token is assigned to an existing and blocked user
// @access Private [SUPERADMIN, ADMIN]
router.post("/create", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const data = req.body;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateCreateApartmentInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.create(data);

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/create] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/assign-owner/:apartmentId
// @desc validate that token is assigned to an existing and blocked user
// @access Private [SUPERADMIN, ADMIN]
router.patch("/assign-owner/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const { apartmentId } = req.params;
  const requestingUserRole = (req.user || {}).role;
  const data = req.body;

  // Check required params
  if (!apartmentId) {
    return res.status(400).json({ msg: "ApartmentId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateAssignOwnerInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.updateOne({ _id: apartmentId }, data);

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/create] ERROR:", e);
    res.status(500).json(e);
  }
});

module.exports = router;
