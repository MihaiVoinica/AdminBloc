// packages
const express = require("express");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const {
  validateCreateApartmentInput,
  validateUpdateApartmentInput,
  validateAssignOwnerInput,
  validateRemoveOwnerInput,
  validateCreateMeterInput,
  validateUpdateMeterInput,
  validateRemoveMeterInput,
} = require("../validators");

// schemas
const { Apartments } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route GET /apartments/create
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/get", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUserRole = (req.user || {}).role;
  const data = req.query;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { id } = data;

  if (!id) {
    return res.status(400).json({ msg: "Id is required" });
  }

  try {
    // TODO: find building before get
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.findOne({
      _id: id,
      active: true,
    });

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/get] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /apartments/create
// @desc
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

  const {
    buildingId,
    number,
    peopleCount,
    totalArea,
    radiantArea,
    share,
    thermalProvider,
  } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.create({
      buildingId,
      number,
      peopleCount,
      totalArea,
      radiantArea,
      share,
      thermalProvider,
    });

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/create] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /apartments/update/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.post("/update/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
  const data = req.body;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateUpdateApartmentInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const {
    buildingId,
    number,
    peopleCount,
    totalArea,
    radiantArea,
    share,
    thermalProvider,
  } = data;

  try {
    // TODO: find building before update
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      {
        buildingId,
        number,
        peopleCount,
        totalArea,
        radiantArea,
        share,
        thermalProvider,
      },
      { new: true }
    );

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/update] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/update/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    // TODO: find building before update
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { active: false },
      { new: true }
    );

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/update] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/assign-owner/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/assign-owner/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
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

  const { email } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const [user, apartment] = await Promise.all([
      Users.findOne({ email, active: true }),
      Apartments.findOne({
        _id: apartmentId,
        active: true,
      }),
    ]);

    if (!user) {
      return res.status(400).json({ msg: "Invalid User" });
    }

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    if (apartment.userId) {
      return res.status(400).json({
        msg:
          "Owner already assigned, remove the current one before trying to add another.",
      });
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $set: { userId: user._id }, $pull: { pastUserIds: user._id } },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/assign-owner/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/remove-owner/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove-owner/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
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
  const { errors, isValid } = validateRemoveOwnerInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const user = await Users.findOne({ email, active: true });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    const apartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, userId: user._id, active: true },
      { $unset: { userId: "" }, $addToSet: { pastUserIds: user._id } },
      { new: true }
    );

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/remove-owner/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/create-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/create-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
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
  const { errors, isValid } = validateCreateMeterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $push: { meters: { name } } },
      { new: true }
    );

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/create-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/update-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.patch("/update-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
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
  const { errors, isValid } = validateUpdateMeterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id, name, value } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const apartment = await Apartments.findOne({
      _id: apartmentId,
      active: true,
    });

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    const meterIndex = apartment.meters.findIndex(
      ({ _id, active }) => _id.equals(id) && active
    );

    if (meterIndex < 0) {
      return res.status(400).json({ msg: "Invalid Meter" });
    }

    const currentMeterDetails = apartment.meters[meterIndex];
    const updateObj = Object.assign(
      {},
      name && {
        [`meters.${meterIndex}.name`]: name,
      }
    );

    if (value) {
      const prevValue = currentMeterDetails.value;
      const consumption = value - prevValue;
      Object.assign(updateObj, {
        [`meters.${meterIndex}.value`]: value,
        [`meters.${meterIndex}.prevValue`]: prevValue,
        [`meters.${meterIndex}.consumption`]: consumption,
      });
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $set: updateObj },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/update-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/remove-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
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
  const { errors, isValid } = validateRemoveMeterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building
    const apartment = await Apartments.findOne({
      _id: apartmentId,
      active: true,
    });

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    const meterIndex = apartment.meters.findIndex(
      ({ _id, active }) => _id.equals(id) && active
    );

    if (meterIndex < 0) {
      return res.status(400).json({ msg: "Invalid Meter" });
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $set: { [`meters.${meterIndex}.active`]: false } },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/remove-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

module.exports = router;
