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
  validateCreateBillInput,
  validateRemoveBillInput,
} = require("../validators");

// schemas
const { Users, Buildings, Apartments } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route GET /buildings/get
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.get("/get", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { id } = data;

  if (!id) {
    return res.status(400).json({ msg: "Id is required" });
  }

  try {
    if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        _id: id,
        userId: requestingUserId,
        active: true,
      });
      res.status(200).json(building);
    } else {
      const building = await Buildings.findOne({
        _id: id,
        active: true,
      });
      const user = building.userId
        ? await Users.findOne({ _id: building.userId, active: true })
        : {};

      res.status(200).json({
        ...building.toObject(),
        userEmail: building.userId ? user.email : "",
      });
    }
  } catch (e) {
    console.log("[/buildings/get] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route GET /buildings/list
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/list", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    if (requestingUserRole === NORMAL) {
      const buildingsIdsSet = new Set(
        (
          await Apartments.find({
            userId: requestingUserId,
            active: true,
          })
        ).map(({ buildingId }) => buildingId)
      );
      const buildings = await Buildings.find({
        _id: { $in: [...buildingsIdsSet] },
        userId: requestingUserId,
        active: true,
      });
      return res
        .status(200)
        .json(buildings.map(({ _id, name }) => ({ _id, name })));
    } else if (requestingUserRole === ADMIN) {
      const buildings = await Buildings.find({
        userId: requestingUserId,
        active: true,
      });
      return res.status(200).json(
        buildings.map((building) => ({
          ...building.toObject(),
          userEmail: requestingUserEmail,
        }))
      );
    } else {
      const [users, buildings] = await Promise.all([
        Users.find({ role: ADMIN, active: true }),
        Buildings.find({
          active: true,
        }),
      ]);

      const usersHash = {};
      users.forEach(({ _id, email }) => {
        usersHash[_id] = email;
      });

      return res.status(200).json(
        buildings.map((building) => ({
          ...building.toObject(),
          userEmail: building.userId ? usersHash[building.userId] || "" : "",
        }))
      );
    }
  } catch (e) {
    console.log("[/buildings/list] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /buildings/create
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.post("/create", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
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

  const { name, address, apartmentsCount, userId, autoGenerate } = data;

  try {
    let building = null;

    if (requestingUserRole === ADMIN) {
      building = await Buildings.create({
        name,
        address,
        apartmentsCount,
        userId: requestingUserId,
      });
    } else {
      building = await Buildings.create(
        Object.assign(
          {
            name,
            address,
            apartmentsCount,
          },
          userId && { userId }
        )
      );
    }

    if (autoGenerate) {
      const promises = [];
      for (let i = 1; i <= apartmentsCount; i++) {
        promises.push(
          Apartments.create({
            buildingId: building._id,
            name: `Apartament ${i}`,
            number: i,
            peopleCount: 0,
            totalArea: 0,
            radiantArea: 0,
            share: 0,
            thermalProvider: false,
          })
        );
      }
      await Promise.all(promises);
    }

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
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
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

  const { name, address, apartmentsCount, userId } = data;

  try {
    let building = null;

    if (requestingUserRole === ADMIN) {
      building = await Buildings.findOneAndUpdate(
        {
          _id: buildingId,
          userId: requestingUserId,
          apartmentsCount: { $lte: apartmentsCount },
          active: true,
        },
        {
          name,
          address,
          apartmentsCount,
          userId: requestingUserId,
        },
        { new: true }
      );
    } else {
      building = await Buildings.findOneAndUpdate(
        {
          _id: buildingId,
          apartmentsCount: { $lte: apartmentsCount },
          active: true,
        },
        Object.assign(
          {
            name,
            address,
            apartmentsCount,
          },
          userId
            ? { userId }
            : {
                $unset: { userId: "" },
              }
        ),
        { new: true }
      );
    }

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
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const { buildingId } = req.params;

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    let building = null;
    if (requestingUserRole === ADMIN) {
      building = await Buildings.findOneAndUpdate(
        { _id: buildingId, userId: requestingUserId, active: true },
        { active: false },
        { new: true }
      );
    } else {
      building = await Buildings.findOneAndUpdate(
        { _id: buildingId, active: true },
        { active: false },
        { new: true }
      );
    }

    // Deactivate all apartments for this building
    await Apartments.updateMany(
      {
        buildingId,
        active: true,
      },
      {
        active: false,
      }
    );

    res.status(200).json(building);
  } catch (e) {
    console.log("[/buildings/remove/:buildingId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route GET /buildings/list-bills
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.get("/list-bills", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { buildingId } = data;

  try {
    let buildings = null;
    if (requestingUserRole === ADMIN) {
      buildings = await Buildings.find(
        Object.assign(
          {
            userId: requestingUserId,
            active: true,
          },
          buildingId && { _id: buildingId }
        )
      );
    } else {
      buildings = await Buildings.find(
        Object.assign(
          {
            active: true,
          },
          buildingId && { _id: buildingId }
        )
      );
    }

    if (!buildings) {
      return res.status(400).json({ msg: "Invalid Buildings" });
    }

    const bills = [];

    buildings.forEach((building) => {
      const {
        _id: currentBuildingId,
        name: buildingName,
        bills: buildingBills,
      } = building;

      buildingBills.forEach((bill) => {
        if (bill.active) {
          bills.push({
            ...bill.toObject(),
            buildingId: currentBuildingId,
            buildingName,
          });
        }
      });
    });

    res.status(200).json(bills);
  } catch (e) {
    console.log("[/buildings/list-bills] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /buildings/create-bill/:buildingId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/create-bill/:buildingId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const { buildingId } = req.params;
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const data = req.body;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
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
    let building = null;
    if (requestingUserRole === ADMIN) {
      building = await Buildings.findOneAndUpdate(
        { _id: buildingId, userId: requestingUserId, active: true },
        { $push: { bills: { name, type, value } } },
        { new: true }
      );
    } else {
      building = await Buildings.findOneAndUpdate(
        { _id: buildingId, active: true },
        { $push: { bills: { name, type, value } } },
        { new: true }
      );
    }

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
