// packages
const express = require("express");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const {
  validateCreateBuildingInput,
  validateUpdateBuildingInput,
  validateAssignManagerInput,
  validateRemoveManagerInput,
  validateCreateBillInput,
  validateRemoveBillInput,
} = require("../validators");

// schemas
const { Buildings } = require("../schemas");

// roles
const { ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route POST /buildings/create
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
  const { errors, isValid } = validateCreateBuildingInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name, address, apartmentsCount } = data;

  try {
    const building = await Buildings.create({
      name,
      address,
      apartmentsCount,
    });

    res.status(200).json(building);
  } catch (e) {
    console.log("[/buildings/create] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /buildings/update/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.post("/update/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { buildingId } = req.params;
  const data = req.body;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateUpdateBuildingInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name, address, apartmentsCount } = data;

  try {
    const building = await Buildings.findOneAndUpdate(
      { _id: buildingId, active: true },
      {
        name,
        address,
        apartmentsCount,
      },
      { new: true }
    );

    res.status(200).json(building);
  } catch (e) {
    console.log("[/buildings/update/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /buildings/remove/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { buildingId } = req.params;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    const building = await Buildings.findOneAndUpdate(
      { _id: buildingId, active: true },
      { active: false },
      { new: true }
    );

    res.status(200).json(building);
  } catch (e) {
    console.log("[/buildings/remove/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /buildings/assign-manager/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/assign-manager/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const { buildingId } = req.params;
  const requestingUserRole = (req.user || {}).role;
  const data = req.body;

  // Check required params
  if (!buildingId) {
    return res.status(400).json({ msg: "BuildingId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateAssignManagerInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email } = data;

  try {
    const [user, building] = await Promise.all([
      Users.findOne({ email, active: true }),
      Buildings.findOne({
        _id: buildingId,
        active: true,
      }),
    ]);

    if (!user) {
      return res.status(400).json({ msg: "Invalid User" });
    }

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    if (building.userId) {
      return res.status(400).json({
        msg:
          "Manager already assigned, remove the current one before trying to add another.",
      });
    }

    const newBuilding = await Buildings.findOneAndUpdate(
      { _id: buildingId, active: true },
      { $set: { userId: user._id }, $pull: { pastUserIds: user._id } },
      { new: true }
    );

    res.status(200).json(newBuilding);
  } catch (e) {
    console.log("[/buildings/assign-manager/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /buildings/remove-manager/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove-manager/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const { buildingId } = req.params;
  const requestingUserRole = (req.user || {}).role;
  const data = req.body;

  // Check required params
  if (!buildingId) {
    return res.status(400).json({ msg: "BuildingId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateRemoveManagerInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email } = data;

  try {
    const user = await Users.findOne({ email, active: true });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    const building = await Buildings.findOneAndUpdate(
      { _id: buildingId, userId: user._id, active: true },
      { $unset: { userId: "" }, $addToSet: { pastUserIds: user._id } },
      { new: true }
    );

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    res.status(200).json(building);
  } catch (e) {
    console.log("[/buildings/remove-manager/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /buildings/create-bill/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/create-bill/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { buildingId } = req.params;
  const data = req.body;

  // Check required params
  if (!buildingId) {
    return res.status(400).json({ msg: "BuildingId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateCreateBillInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name, type, value } = data;

  try {
    const building = await Buildings.findOneAndUpdate(
      { _id: buildingId, active: true },
      { $push: { bills: { name, type, value } } },
      { new: true }
    );

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    res.status(200).json(building);
  } catch (e) {
    console.log("[/buildings/create-bill/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /buildings/remove-bill/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove-bill/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { buildingId } = req.params;
  const data = req.body;

  // Check required params
  if (!buildingId) {
    return res.status(400).json({ msg: "BuildingId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateRemoveBillInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id } = data;

  try {
    const building = await Buildings.findOne({
      _id: buildingId,
      active: true,
    });

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    const billIndex = building.bills.findIndex(
      ({ _id, active }) => _id.equals(id) && active
    );

    if (billIndex < 0) {
      return res.status(400).json({ msg: "Invalid bill" });
    }

    const newBuildings = await Buildings.findOneAndUpdate(
      { _id: buildingId, active: true },
      { $set: { [`bills.${billIndex}.active`]: false } },
      { new: true }
    );

    res.status(200).json(newBuildings);
  } catch (e) {
    console.log("[/buildings/remove-bill/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

module.exports = router;
